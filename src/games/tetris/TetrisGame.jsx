import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import useTetris from './useTetris';
import './Tetris.css';

const TetrisGame = () => {
    const {
        stage,
        gameOver,
        score,
        startGame,
        movePlayer,
        dropPlayer,
        hardDrop,
        playerRotate,
        keyUp
    } = useTetris();

    const gameAreaRef = useRef(null);

    const handleKeyDown = (e) => {
        if (!gameOver) {
            // Prevent default scrolling for arrow keys and space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            if (e.key === 'ArrowLeft') {
                movePlayer(-1);
            } else if (e.key === 'ArrowRight') {
                movePlayer(1);
            } else if (e.key === 'ArrowDown') {
                dropPlayer();
            } else if (e.key === 'ArrowUp') {
                playerRotate(stage, -1);
            } else if (e.key === ' ') { // Space for Hard Drop
                hardDrop();
            }
        }
    };

    const handleKeyUp = (e) => {
        keyUp(e);
    };

    const focusGame = () => {
        gameAreaRef.current.focus();
    };

    return (
        <div
            className="tetris-container"
            role="button"
            tabIndex="0"
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            ref={gameAreaRef}
            onClick={focusGame}
        >
            <div className="tetris-header">
                <Link to="/" className="back-btn">← Back</Link>
                <h1>Tetris - Score: {score}</h1>
            </div>

            <div className="tetris-wrapper">
                <div className="tetris-board">
                    {stage.map((row, y) =>
                        row.map((cell, x) => (
                            <div
                                key={`${y}-${x}`}
                                className={`tetris-cell type-${cell[0]}`}
                            ></div>
                        ))
                    )}
                    {gameOver && (
                        <div className="game-over-overlay">
                            <h2>GAME OVER</h2>
                            <button onClick={() => { startGame(); focusGame(); }}>Try Again</button>
                        </div>
                    )}
                </div>

                <div className="tetris-controls">
                    <button className="start-btn" onClick={() => { startGame(); focusGame(); }}>Start Game</button>
                    <p className="instructions">
                        Move: ← →<br />
                        Rotate: ↑<br />
                        Drop: ↓
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TetrisGame;
