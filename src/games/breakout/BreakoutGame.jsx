import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Breakout.css';

const BreakoutGame = () => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    // Game Constants
    const BALL_RADIUS = 8;
    const PADDLE_HEIGHT = 15;
    const PADDLE_WIDTH = 100;
    const BRICK_ROW_COUNT = 5;
    const BRICK_COLUMN_COUNT = 8;
    const BRICK_PADDING = 10;
    const BRICK_OFFSET_TOP = 50;
    const BRICK_OFFSET_LEFT = 35;
    const BRICK_HEIGHT = 20;
    // Calculate brick width dynamically based on canvas
    const CANVAS_WIDTH = 800;
    const BRICK_WIDTH = (CANVAS_WIDTH - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLUMN_COUNT - 1))) / BRICK_COLUMN_COUNT;

    // Refs for mutable game state (to avoid re-renders on every frame)
    const gameState = useRef({
        ball: { x: CANVAS_WIDTH / 2, y: 550, dx: 4, dy: -4 },
        paddle: { x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2 },
        bricks: [],
        rightPressed: false,
        leftPressed: false,
        animationId: null
    });

    // Initialize Bricks
    useEffect(() => {
        const bricks = [];
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            bricks[c] = [];
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                // Neon colors for rows
                let color = '#00f2ff'; // Default Blue
                if (r === 0) color = '#FF6B6B'; // Red
                if (r === 1) color = '#FFD93D'; // Yellow
                if (r === 2) color = '#6BCB77'; // Green
                if (r === 3) color = '#4D96FF'; // Blue
                if (r === 4) color = '#C71585'; // Purple

                bricks[c][r] = { x: 0, y: 0, status: 1, color };
            }
        }
        gameState.current.bricks = bricks;
    }, []);

    // Input Handling
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'd') gameState.current.rightPressed = true;
            if (e.key === 'ArrowLeft' || e.key === 'a') gameState.current.leftPressed = true;
            if (e.key === ' ') {
                if (!gameStarted) setGameStarted(true);
            }
        };

        const handleKeyUp = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'd') gameState.current.rightPressed = false;
            if (e.key === 'ArrowLeft' || e.key === 'a') gameState.current.leftPressed = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameStarted]);

    // Game Loop
    useEffect(() => {
        if (!gameStarted || gameOver || gameWon) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const state = gameState.current;

        const drawBall = () => {
            ctx.beginPath();
            ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fff';
            ctx.fill();
            ctx.closePath();
            ctx.shadowBlur = 0;
        };

        const drawPaddle = () => {
            ctx.beginPath();
            ctx.rect(state.paddle.x, canvas.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);
            ctx.fillStyle = '#00f2ff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00f2ff';
            ctx.fill();
            ctx.closePath();
            ctx.shadowBlur = 0;
        };

        const drawBricks = () => {
            for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
                for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                    if (state.bricks[c][r].status === 1) {
                        const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                        const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                        state.bricks[c][r].x = brickX;
                        state.bricks[c][r].y = brickY;

                        ctx.beginPath();
                        ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                        ctx.fillStyle = state.bricks[c][r].color;
                        ctx.shadowBlur = 5;
                        ctx.shadowColor = state.bricks[c][r].color;
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
            ctx.shadowBlur = 0;
        };

        const collisionDetection = () => {
            for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
                for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                    const b = state.bricks[c][r];
                    if (b.status === 1) {
                        if (
                            state.ball.x > b.x &&
                            state.ball.x < b.x + BRICK_WIDTH &&
                            state.ball.y > b.y &&
                            state.ball.y < b.y + BRICK_HEIGHT
                        ) {
                            state.ball.dy = -state.ball.dy;
                            b.status = 0;
                            setScore(prev => prev + 10);

                            // Check Win
                            // (Optimized: check count logic could be here, but simpler to check score or remaining bricks)
                        }
                    }
                }
            }
        };

        const draw = () => {
            if (gameOver || gameWon) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

            drawBricks();
            drawBall();
            drawPaddle();
            collisionDetection();

            // Ball Movement
            // Wall Collision (Left/Right)
            if (state.ball.x + state.ball.dx > canvas.width - BALL_RADIUS || state.ball.x + state.ball.dx < BALL_RADIUS) {
                state.ball.dx = -state.ball.dx;
            }

            // Wall Collision (Top)
            if (state.ball.y + state.ball.dy < BALL_RADIUS) {
                state.ball.dy = -state.ball.dy;
            } else if (state.ball.y + state.ball.dy > canvas.height - BALL_RADIUS - 10) { // Bottom (near paddle)
                // Paddle Collision
                if (state.ball.x > state.paddle.x && state.ball.x < state.paddle.x + PADDLE_WIDTH) {
                    // Calculate bounce angle based on where it hit the paddle
                    // Farther from center = sharper angle
                    const hitPoint = state.ball.x - (state.paddle.x + PADDLE_WIDTH / 2);
                    // Normalize hit point (-1 to 1)
                    let normalizedHit = hitPoint / (PADDLE_WIDTH / 2);

                    state.ball.dx = normalizedHit * 5; // Max speed 5
                    state.ball.dy = -Math.abs(state.ball.dy); // Always bounce up
                    // Speed up slightly
                    // state.ball.dy *= 1.05; 
                } else if (state.ball.y + state.ball.dy > canvas.height - BALL_RADIUS) {
                    // Game Over (Floor)
                    setGameOver(true);
                    setGameStarted(false);
                    return;
                }
            }

            state.ball.x += state.ball.dx;
            state.ball.y += state.ball.dy;

            // Paddle Movement
            if (state.rightPressed && state.paddle.x < canvas.width - PADDLE_WIDTH) {
                state.paddle.x += 7;
            } else if (state.leftPressed && state.paddle.x > 0) {
                state.paddle.x -= 7;
            }

            state.animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(state.animationId);
        };
    }, [gameStarted, gameOver, gameWon]);

    const handleRestart = () => {
        // Reset Game State
        gameState.current.ball = { x: CANVAS_WIDTH / 2, y: 550, dx: 4, dy: -4 };
        gameState.current.paddle = { x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2 };
        gameState.current.bricks.forEach(col => col.forEach(brick => brick.status = 1));

        setScore(0);
        setGameOver(false);
        setGameWon(false);
        setGameStarted(true);
    };

    return (
        <div className="breakout-container">
            <div className="breakout-header">
                <Link to="/" className="back-btn">← Back</Link>
                <h1>Neon Breakout</h1>
                <div className="score-board">Score: {score}</div>
            </div>

            <div className="canvas-wrapper">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height="600"
                    className="game-canvas"
                />

                {!gameStarted && !gameOver && !gameWon && (
                    <div className="overlay start-overlay">
                        <h2>Ready?</h2>
                        <button onClick={() => setGameStarted(true)} className="neon-btn">PRESS SPACE TO START</button>
                    </div>
                )}

                {gameOver && (
                    <div className="overlay game-over">
                        <h2>GAME OVER</h2>
                        <div className="final-score">Score: {score}</div>
                        <button onClick={handleRestart} className="neon-btn">TRY AGAIN</button>
                    </div>
                )}

                {gameWon && (
                    <div className="overlay game-won">
                        <h2>YOU WIN!</h2>
                        <div className="final-score">Score: {score}</div>
                        <button onClick={handleRestart} className="neon-btn">PLAY AGAIN</button>
                    </div>
                )}
            </div>

            <p className="controls-hint">Use Left/Right Arrows or 'A'/'D' to Move</p>
        </div>
    );
};

export default BreakoutGame;
