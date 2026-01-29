import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSnake } from './useSnake';
import './Snake.css';

const BOARD_SIZE = 20;

const SnakeGame = () => {
    const { snake, food, score, gameOver, isPlaying, resetGame, changeDirection } = useSnake();
    const gameContainerRef = useRef(null);

    // Initial Start
    useEffect(() => {
        resetGame(); // Start game on mount
        if (gameContainerRef.current) gameContainerRef.current.focus();
    }, [resetGame]);

    // Keyboard Controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            if (gameOver && e.key === 'r') {
                resetGame();
                return;
            }

            switch (e.key) {
                case 'ArrowUp':
                    changeDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                    changeDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                    changeDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                    changeDirection({ x: 1, y: 0 });
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [changeDirection, gameOver, resetGame]);

    return (
        <div className="snake-container" ref={gameContainerRef} tabIndex="0">
            <div className="snake-header">
                <Link to="/" className="back-btn">← Back</Link>
                <h1>Neon Snake</h1>
                <div className="score-board">Score: {score}</div>
            </div>

            <div className="game-area">
                <div className="snake-grid">
                    {/* Render Grid Cells */}
                    {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => {
                        const x = i % BOARD_SIZE;
                        const y = Math.floor(i / BOARD_SIZE);
                        const isFood = food.x === x && food.y === y;
                        const isSnakeHead = snake[0].x === x && snake[0].y === y;
                        const isSnakeBody = snake.some((segment, index) => index !== 0 && segment.x === x && segment.y === y);

                        let className = 'grid-cell';
                        if (isFood) className += ' food';
                        if (isSnakeHead) className += ' snake-head';
                        else if (isSnakeBody) className += ' snake-body';

                        return (
                            <div key={i} className={className}></div>
                        );
                    })}
                </div>

                {gameOver && (
                    <div className="game-over-overlay">
                        <h2>GAME OVER</h2>
                        <p>Final Score: {score}</p>
                        <button onClick={resetGame} className="restart-btn">Press 'R' or Click to Restart</button>
                    </div>
                )}
            </div>

            <div className="mobile-controls">
                <p>Use Arrow Keys to Move</p>
            </div>
        </div>
    );
};

export default SnakeGame;
