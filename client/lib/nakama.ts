import { Client, Session, Socket } from "@heroiclabs/nakama-js";
import { v4 as uuidv4 } from "uuid";
import { OpCode } from "@/lib/messages";

class GameState {
    public playerIndex = 0;
}


class Nakama {
    public client: Client;
    public session: Session | null = null;
    public socket: Socket | null = null;
    public matchId: string | null = null;
    public gameState: GameState = new GameState();

    constructor() {
        this.client = new Client("defaultkey", process.env.NEXT_PUBLIC_SERVER_API, process.env.NEXT_PUBLIC_SERVER_PORT, process.env.NEXT_PUBLIC_USE_SSL === "true");
    }

    async authenticate(): Promise<void> {
        // todo : add catch erro
        let deviceId = localStorage.getItem("deviceId");
        if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem("deviceId", deviceId);
        }

        try {
            this.session = await this.client.authenticateDevice(deviceId, true);
        }
        catch (err: any) {
            console.log("Error authenticating device: %o:%o", err.statusCode, err.message);
        }
        if (!this.session?.user_id) return;
        localStorage.setItem("user_id", this.session.user_id);

        const trace = false;
        this.socket = this.client.createSocket(process.env.NEXT_PUBLIC_USE_SSL === "true", trace);
        await this.socket.connect(this.session, true);
    }

    async createMatch(): Promise<void> {
        if (!this.socket || !this.session) return;
        const match = await this.socket.createMatch();
        console.log("Match created:", match.match_id);
    }

    async findMatch(): Promise<void> {
        const rpc_name = "find_match_js";
        if (!this.session || !this.socket) {
            console.log("Session or socket not found");
            return;
        };
        const matches = await this.client.rpc(this.session, rpc_name, {});

        if (typeof matches === 'object' && matches !== null) {
            const safeParsedJson = matches as {
                payload: {
                    matchIds: string[];
                    // height: string,
                    // weight: string,
                    // image: string,
                };
            };
            this.matchId = safeParsedJson.payload.matchIds[0]
            await this.socket.joinMatch(this.matchId);
            console.log('Match joined!');
        }
    }

    async makeMove(index: number): Promise<void> {
        if (!this.socket || !this.matchId) {
            console.log("Socket or matchId not found");
            return;
        };
        const data = { position: index };
        await this.socket.sendMatchState(this.matchId, OpCode.MOVE, JSON.stringify(data));
        console.log("Match data sent");
    }
}

export default Nakama;