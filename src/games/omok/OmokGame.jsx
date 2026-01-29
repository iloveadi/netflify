import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { checkWinner } from './OmokLogic';
import { getBestMove } from './OmokAI';
import './Omok.css';

const BOARD_SIZE = 15;

const OmokGame = () => {
    const [board, setBoard] = useState(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    const [isBlackTurn, setIsBlackTurn] = useState(true);
    const [winner, setWinner] = useState(null);
    const [lastMove, setLastMove] = useState(null); // {r, c}
    const [isAiThinking, setIsAiThinking] = useState(false);

    // AI Turn Handling
    useEffect(() => {
        if (!isBlackTurn && !winner) {
            setIsAiThinking(true);
            const timer = setTimeout(() => {
                const bestMove = getBestMove(board);
                if (bestMove) {
                    handleMove(bestMove.r, bestMove.c);
                }
                setIsAiThinking(false);
            }, 700); // 0.7s delay

            return () => clearTimeout(timer);
        }
    }, [isBlackTurn, winner, board]);

    const handleMove = (r, c) => {
        const newBoard = board.map(row => [...row]);
        const currentStone = isBlackTurn ? 'black' : 'white';
        newBoard[r][c] = currentStone;

        setBoard(newBoard);
        setLastMove({ r, c });

        const win = checkWinner(newBoard);
        if (win) {
            setWinner(win);
        } else {
            setIsBlackTurn(!isBlackTurn);
        }
    };

    const handleCellClick = (r, c) => {
        // Player turn (black) only
        if (!isBlackTurn || board[r][c] || winner || isAiThinking) return;
        handleMove(r, c);
    };

    const resetGame = () => {
        setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
        setIsBlackTurn(true);
        setWinner(null);
        setLastMove(null);
        setIsAiThinking(false);
    };

    return (
        <div className="omok-container">
            <div className="omok-header">
                <Link to="/" className="back-btn">← Back</Link>
                <div className={`turn-indicator ${isBlackTurn ? 'black' : 'white'}`}>
                    {winner
                        ? 'GAME OVER'
                        : isAiThinking
                            ? 'AI Thinking...'
                            : `${isBlackTurn ? 'Your' : "Computer's"} Turn`}
                </div>
            </div>

            <div className="omok-board">
                {board.map((row, r) => (
                    row.map((cell, c) => (
                        <div
                            key={`${r}-${c}`}
                            className="cell"
                            onClick={() => handleCellClick(r, c)}
                        >
                            {cell && <div className={`stone ${cell}`}></div>}
                            {lastMove && lastMove.r === r && lastMove.c === c && !winner && (
                                <div className="last-move-marker"></div>
                            )}
                        </div>
                    ))
                ))}
            </div>

            {winner && (
                <div className="winner-modal">
                    <h2>
                        {winner === 'black' ? 'You Win!' : 'Computer Wins!'}
                    </h2>
                    <button className="reset-btn" onClick={resetGame}>Play Again</button>
                </div>
            )}
        </div>
    );
};

export default OmokGame;
