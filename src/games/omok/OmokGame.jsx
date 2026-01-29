import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './OmokGame.css';
import { getBestMove } from './omokAI';

const BOARD_SIZE = 15;

const OmokGame = () => {
    const [board, setBoard] = useState(
        Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
    );
    const [isBlackTurn, setIsBlackTurn] = useState(true);
    const [winner, setWinner] = useState(null);
    const [winningLine, setWinningLine] = useState([]);
    const [lastMove, setLastMove] = useState(null); // {r, c}
    const [useAI, setUseAI] = useState(true); // Default to AI mode
    const [isProcessing, setIsProcessing] = useState(false);

    const checkWin = useCallback((boardState, r, c, player) => {
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];

        for (const [dr, dc] of directions) {
            let count = 1;
            let line = [{ r, c }];

            // Forward
            let tr = r + dr;
            let tc = c + dc;
            while (tr >= 0 && tr < BOARD_SIZE && tc >= 0 && tc < BOARD_SIZE && boardState[tr][tc] === player) {
                count++;
                line.push({ r: tr, c: tc });
                tr += dr;
                tc += dc;
            }

            // Backward
            tr = r - dr;
            tc = c - dc;
            while (tr >= 0 && tr < BOARD_SIZE && tc >= 0 && tc < BOARD_SIZE && boardState[tr][tc] === player) {
                count++;
                line.push({ r: tr, c: tc });
                tr -= dr;
                tc -= dc;
            }

            if (count >= 5) {
                return line;
            }
        }
        return null;
    }, []);

    const placeStone = (r, c, playerColor) => {
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = playerColor;
        setBoard(newBoard);
        setLastMove({ r, c });

        const line = checkWin(newBoard, r, c, playerColor);
        if (line) {
            setWinner(playerColor);
            setWinningLine(line);
        } else {
            setIsBlackTurn(prev => !prev);
        }
    };

    const handleCellClick = useCallback((r, c) => {
        if (board[r][c] || winner || isProcessing) return;
        if (useAI && !isBlackTurn) return; // Prevent clicking during AI turn

        placeStone(r, c, 'black');
    }, [board, winner, isProcessing, useAI, isBlackTurn]);

    // AI Turn Effect
    useEffect(() => {
        if (useAI && !isBlackTurn && !winner) {
            setIsProcessing(true);
            const timer = setTimeout(() => {
                // AI plays White
                const { r, c } = getBestMove(board, 'white', 'black');
                if (r !== undefined && c !== undefined) {
                    placeStone(r, c, 'white');
                } else {
                    console.log("No move found?");
                }
                setIsProcessing(false);
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [isBlackTurn, winner, useAI, board]);

    const resetGame = () => {
        setBoard(Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)));
        setIsBlackTurn(true);
        setWinner(null);
        setWinningLine([]);
        setLastMove(null);
        setIsProcessing(false);
    };

    return (
        <div className="omok-container">
            <div className="omok-header">
                <Link to="/" className="back-btn">← Back</Link>
                <h1>Omok</h1>
                <div className="game-status">
                    <div className={`turn-indicator ${isBlackTurn ? 'black' : 'white'}`}>
                        {winner
                            ? `${winner === 'black' ? 'Black' : 'White'} Wins!`
                            : isProcessing
                                ? 'AI Thinking...'
                                : `Turn: ${isBlackTurn ? 'Black' : 'White'}`}
                    </div>
                </div>
            </div>

            <div className="board-wrapper">
                <div className="omok-board">
                    {/* Grid Lines */}
                    {Array.from({ length: BOARD_SIZE }).map((_, i) => (
                        <div key={`h-${i}`} className="grid-line horizontal" style={{ top: `${i * (100 / (BOARD_SIZE - 1))}%` }}></div>
                    ))}
                    {Array.from({ length: BOARD_SIZE }).map((_, i) => (
                        <div key={`v-${i}`} className="grid-line vertical" style={{ left: `${i * (100 / (BOARD_SIZE - 1))}%` }}></div>
                    ))}

                    {/* Clickable Cells */}
                    {board.map((row, r) => (
                        row.map((cell, c) => (
                            <div
                                key={`${r}-${c}`}
                                className="cell-intersection"
                                style={{
                                    top: `${r * (100 / (BOARD_SIZE - 1))}%`,
                                    left: `${c * (100 / (BOARD_SIZE - 1))}%`
                                }}
                                onClick={() => handleCellClick(r, c)}
                            >
                                {cell && <div className={`stone ${cell} ${winner && winningLine.some(p => p.r === r && p.c === c) ? 'winning' : ''} ${lastMove?.r === r && lastMove?.c === c ? 'last-move' : ''}`}></div>}
                                {!cell && !winner && isBlackTurn && !isProcessing && <div className="hover-stone black"></div>}
                            </div>
                        ))
                    ))}
                </div>
            </div>

            <div className="controls">
                <button onClick={resetGame} className="reset-btn">Reset Game</button>
                <button className="reset-btn" onClick={() => { resetGame(); setUseAI(!useAI); }}>
                    Mode: {useAI ? 'vs AI' : 'vs Human'}
                </button>
            </div>

            {winner && (
                <div className="winner-overlay" onClick={resetGame}>
                    <h2>{winner.toUpperCase()} WINS!</h2>
                    <p>Click to restart</p>
                </div>
            )}
        </div>
    );
};

export default OmokGame;
