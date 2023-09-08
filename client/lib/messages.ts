// same as ../../server/messages.ts but add `export`
export enum Mark {
    X = 0,
    O = 1,
    UNDEFINED = 2,
}

export enum OpCode {
    START = 1,
    UPDATE = 2,
    DONE = 3,
    MOVE = 4,
    REJECTED = 5,
}

export type BoardPosition = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Board = (Mark | null)[];

export type Message =
    | StartMessage
    | UpdateMessage
    | DoneMessage
    | MoveMessage
    | RpcFindMatchRequest
    | RpcFindMatchResponse;

export interface StartMessage {
    board: Board;
    marks: { [userID: string]: Mark | null };
    mark: Mark;
    deadline: number;
}

export interface UpdateMessage {
    board: Board;
    mark: Mark;
    deadline: number;
}

export interface DoneMessage {
    board: Board;
    winner: Mark | null;
    winnerPositions: BoardPosition[] | null;
    nextGameStart: number;
}

export interface MoveMessage {
    position: BoardPosition;
}

export interface RpcFindMatchRequest {
    fast: boolean;
}

export interface RpcFindMatchResponse {
    matchIds: string[];
}