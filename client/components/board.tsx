'use client';
import { useState, useRef, useEffect } from 'react';
import Square from './square';
import { Client, Session, Socket } from '@heroiclabs/nakama-js';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';

export default function Board() {
  const [squares, setSquares] = useState<(number | null)[]>(
    Array(9).fill(null)
  );
  const [userColor, setUserColor] = useState<number>(-1);
  const [userMove, setUserMove] = useState<number>(-1);
  const socketRef = useRef<Socket | undefined>(undefined);
  const sessionRef = useRef<Session | undefined>(undefined);
  const clientRef = useRef<Client | undefined>(undefined);
  const [matchId, setMatchID] = useState<string | undefined>(undefined);

  const dataFetchedRef = useRef(false);
  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    const authenticate = async () => {
      let useSSL = false; // Enable if server is run with an SSL certificate.
      const client = new Client('defaultkey', '127.0.0.1', '7350', useSSL);
      clientRef.current = client;

      // let deviceId = localStorage.getItem('deviceId');
      let deviceId = localStorage.getItem('deviceId') ?? uuidv4();

      console.log('deviceId', deviceId);
      localStorage.setItem('deviceId', deviceId);
      const session: Session = await client.authenticateDevice(deviceId, true);
      sessionRef.current = session;
      console.log('authenticate()');
      localStorage.setItem('user_id', session.user_id!);

      const trace = false;
      const socket: Socket = client.createSocket(useSSL, trace);
      socketRef.current = socket;
      await socket.connect(session, true);
    };
    authenticate();
  }, []);

  const findMatch = async () => {
    if (!clientRef.current || !socketRef.current || !sessionRef.current) return;
    console.log('const findMatch');
    const rpcid = 'find_match';
    const matches = await clientRef.current.rpc(sessionRef.current, rpcid, {});
    console.log('matches:', matches);

    if (typeof matches === 'object' && matches !== null) {
      const safeParsedJson = matches as {
        payload: {
          matchIds: string[];
          // height: string,
          // weight: string,
          // image: string,
        };
      };
      // console.log(safeParsedJson.payload.name);
      // console.log(safeParsedJson.payload.height);
      // console.log(safeParsedJson.payload.weight);

      //console.log(safeParsedJson.payload.matchIds[0]);
      setMatchID(safeParsedJson.payload.matchIds[0]);
      //console.log(matchId);

      //this.matchID = safeParsedJson.payload.matchIds[0];

      await socketRef.current.joinMatch(safeParsedJson.payload.matchIds[0]);
      console.log('Match joined!');

      // console.log(this.socket!.onmatchdata);
    }

    let userId = localStorage.getItem('user_id');
    console.log('userId localStorage: ', userId);

    if (!socketRef.current) return;

    socketRef.current.onmatchdata = (result) => {
      const json_string = new TextDecoder().decode(result.data);
      const json: string = json_string ? JSON.parse(json_string) : '';
      //console.log(result.data);
      //console.log(result.op_code);

      if (typeof json === 'object' && json !== null) {
        if (result.op_code === 1) {
          console.log('START');
          //console.log(json);

          const safeParsedJson = json as {
            //payload: {
            board: number[];
            deadline: number;
            mark: number;
            marks: { [key: string]: number };
            // }
          };

          setSquares(safeParsedJson.board);

          //console.log(json);

          //console.log("safeParsedJson.mark: ", safeParsedJson.mark);
          //console.log("safeParsedJson.board: ", safeParsedJson.board);
          //console.log("safeParsedJson.marks: ", safeParsedJson.marks);
          //console.log(safeParsedJson.marks[1]);

          setUserMove(safeParsedJson.mark);

          if (safeParsedJson.marks[userId!] === 1) {
            setUserColor(1);
            // console.log("safeParsedJson.marks[userId!]: ", 1);
          } else {
            setUserColor(0);
            // console.log("safeParsedJson.marks[userId!]: ", 0);
          }
          // }
        } else if (result.op_code === 2) {
          console.log('result.op_code: ', 2);
          //console.log(json);

          const safeParsedJson = json as {
            //payload: {
            board: number[];
            deadline: number;
            mark: number;
            // marks: { [key: string]: number },
            // }
          };
          //console.log(json);
          //console.log("safeParsedJson.mark: ", safeParsedJson.mark);
          //console.log("safeParsedJson.board: ", safeParsedJson.board);
          // console.log("safeParsedJson.marks: ", safeParsedJson.marks);
          setUserMove(safeParsedJson.mark);
          setSquares(safeParsedJson.board);
        } else if (result.op_code === 3) {
          console.log('result.op_code: ', 3);
          //console.log(json);

          const safeParsedJson = json as {
            //payload: {
            board: number[];
            nextGameStart: number;
            winner: number;
            winnerPositions: number[];
            // }
          };

          //console.log(safeParsedJson.winnerPositions);
          setSquares(safeParsedJson.board);
          setUserMove(-1);
        } else if (result.op_code === 4) {
          console.log('result.op_code: ', 4);
        } else if (result.op_code === 5) {
          console.log('result.op_code: ', 5);
        }
      }
    };
  };

  const makeMove = async (index: number) => {
    console.log('const makeMove');
    const data = { position: index };
    if (!socketRef.current) return;
    await socketRef.current.sendMatchState(matchId!, 4, JSON.stringify(data));
    //console.log("Match data sent");
  };

  function handleClick(i: number) {
    console.log('handleClick');

    if (userMove === userColor && squares[i] === null) {
      console.log('handleClick ES');
      const nextSquares = squares.slice();

      nextSquares[i] = userColor;
      setSquares(nextSquares);
      makeMove(i);

      console.log('userColor: ', userColor);
    } else {
      console.log('handleClick NONE');
    }
  }

  function BeginClick() {
    console.log('BeginClick');
    findMatch();
  }

  return (
    <>
      <div className='board-row'>
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className='board-row'>
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className='board-row'>
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
      <div className='board-row'>
        <div>
          <Button onClick={BeginClick}>Find Match</Button>
        </div>
      </div>
      <hr></hr>
      <div className='board-row'>
        <h3 className='game-info'>My Color: {userColor} </h3>
        <h3 className='game-info'>Whose Turn: {userMove} </h3>
      </div>
    </>
  );
}
