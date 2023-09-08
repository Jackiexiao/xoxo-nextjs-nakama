'use client';
import { useState, useEffect, useRef } from 'react';
import Square from './square';
import { MatchData } from '@heroiclabs/nakama-js';
import Nakama from '@/lib/nakama';
import {
  OpCode,
  StartMessage,
  DoneMessage,
  UpdateMessage,
} from '@/lib/messages';

import { Button } from '@/components/ui/button';

export default function Game() {
  const [squares, setSquares] = useState<(number | null)[]>(
    Array(9).fill(null)
  );
  const [playerIndex, setPlayerIndex] = useState<number>(-1);
  const [playerTurn, setPlayerTurn] = useState<number>(-1);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [gameMessage, setMessage] = useState<string>('Welcome to TicTacToe');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const nakamaRef = useRef<Nakama | undefined>(undefined);

  function initSocket() {
    if (
      !nakamaRef.current ||
      !nakamaRef.current.socket ||
      !nakamaRef.current.session
    )
      return;
    const userId = nakamaRef.current.session.user_id;

    let socket = nakamaRef.current.socket;

    socket.onmatchdata = (matchState: MatchData) => {
      if (!nakamaRef.current) return;
      const json_string = new TextDecoder().decode(matchState.data);
      const json: string = json_string ? JSON.parse(json_string) : '';
      console.log('op_code: ', matchState.op_code);

      let myPlayerIndex = nakamaRef.current.gameState.playerIndex;

      if (typeof json === 'object' && json !== null) {
        switch (matchState.op_code) {
          case OpCode.START:
            const startMessage = json as StartMessage;
            setTimeLeft(0);
            setSquares(startMessage.board);
            setPlayerTurn(startMessage.mark);
            setGameStarted(true);
            setMessage('Game Started!');

            let tmpId = startMessage.marks[userId!];
            if (tmpId !== null) {
              setPlayerIndex(tmpId);
              nakamaRef.current.gameState.playerIndex = tmpId;
            } else {
              console.error('tmpId is null');
            }
            break;
          case OpCode.UPDATE:
            const updateMessage = json as UpdateMessage;
            if (updateMessage.mark === myPlayerIndex) {
              setMessage('Your Turn!');
            }
            setPlayerTurn(updateMessage.mark);
            setSquares(updateMessage.board);
            setDeadline(updateMessage.deadline);
            break;
          case OpCode.DONE:
            const doneMessage = json as DoneMessage;
            setDeadline(doneMessage.nextGameStart);
            setGameStarted(false);
            setSquares(doneMessage.board);
            setPlayerTurn(-1);
            if (doneMessage.winner === myPlayerIndex) {
              setMessage('You won!');
            } else {
              setMessage('You lost!');
            }
            break;
          case OpCode.MOVE:
            // Handle MOVE message
            break;
          case OpCode.REJECTED:
            // Handle REJECTED message
            break;
          default:
            // Handle unknown message
            break;
        }
      }
    };
  }

  useEffect(() => {
    const initNakama = async () => {
      nakamaRef.current = new Nakama();
      await nakamaRef.current.authenticate();
      initSocket();
    };
    initNakama();
  }, []);

  useEffect(() => {
    if (deadline !== null) {
      const intervalId = setInterval(() => {
        setTimeLeft(deadline * 1000 - Date.now());
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [deadline]);

  function handleClick(i: number) {
    if (!gameStarted) {
      setMessage("Game hasn't started yet!");
      return;
    }
    if (!nakamaRef.current) return;

    if (playerTurn === playerIndex && squares[i] === null) {
      const nextSquares = squares.slice();

      nextSquares[i] = playerIndex;
      setSquares(nextSquares);
      nakamaRef.current.makeMove(i);
      setMessage("Wait for other player's turn!");
    } else if (playerTurn !== playerIndex) {
      setMessage("It's not your turn!");
    }
  }

  async function findMatch() {
    if (!nakamaRef.current) return;
    await nakamaRef.current.findMatch();
    if (nakamaRef.current.matchId === null) {
      setMessage('Server Error:Failed to find match!');
    }
    console.log('find match, matchId: ', nakamaRef.current.matchId!);
    setMessage('Wait Other Player to join...');
  }

  return (
    <>
      <div className='board-row'>
        <div>{gameMessage}</div>
      </div>
      <div className='board-row'>
        <Button onClick={findMatch}>Find Match</Button>
      </div>
      {gameStarted && (
        <div className='flex items-center justify-center space-x-3'>
          <div className='w-36 rounded-lg bg-gray-700 px-4 py-1 text-xl font-medium text-white'>
            You are
            <span
              className={`${
                playerIndex === 0 ? 'text-[#30c4bd]' : 'px-2 text-[#f3b236]'
              } text-2xl font-bold`}
            >
              {playerIndex === 0 ? 'X' : 'O'}
            </span>{' '}
          </div>
          <div>
            <div className='w-28 rounded-lg bg-gray-700 px-4 py-1 text-xl font-medium uppercase text-white'>
              <span
                className={`${
                  playerTurn === 0 ? 'text-[#30c4bd]' : 'text-[#f3b236]'
                } text-2xl font-bold`}
              >
                {playerTurn === 0 ? 'X' : 'O'}
              </span>{' '}
              Turn
            </div>
          </div>
        </div>
      )}

      {deadline !== null && (
        <div className='text-center'>
          <div className='text-sm text-gray-500'>
            {gameStarted ? 'Time left:' : 'Game will start after: '}
          </div>
          <div className='text-2xl font-bold'>
            {timeLeft > 0
              ? new Date(timeLeft).toISOString().substr(14, 5)
              : '0:00'}
          </div>
        </div>
      )}

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
    </>
  );
}
