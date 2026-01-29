import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import soundManager from '../../utils/SoundManager';
import './Galaga.css';

const GalagaGame = () => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    // Game Constants
    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 800;
    const PLAYER_WIDTH = 40;
    const PLAYER_HEIGHT = 40;
    const PLAYER_SPEED = 5;
    const BULLET_SPEED = 10;
    const ENEMY_ROWS = 4;
    const ENEMY_COLS = 8;
    const ENEMY_WIDTH = 30;
    const ENEMY_HEIGHT = 30;
    const ENEMY_PADDING = 20;

    // Game State Ref (Mutable)
    const gameState = useRef({
        player: { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 60 },
        bullets: [],
        particles: [],
        enemies: [],
        keys: {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        },
        lastShotTime: 0,
        enemyDirection: 1, // 1: right, -1: left
        enemyMoveTimer: 0
    });

    // Initialize Game
    const initGame = () => {
        const state = gameState.current;
        state.player = { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 60 };
        state.bullets = [];
        state.particles = [];
        state.enemies = [];
        state.keys = { ArrowLeft: false, ArrowRight: false, Space: false };
        state.lastShotTime = 0;
        state.enemyDirection = 1;

        // Create Enemies
        const startX = (CANVAS_WIDTH - (ENEMY_COLS * (ENEMY_WIDTH + ENEMY_PADDING))) / 2;
        for (let r = 0; r < ENEMY_ROWS; r++) {
            for (let c = 0; c < ENEMY_COLS; c++) {
                state.enemies.push({
                    x: startX + c * (ENEMY_WIDTH + ENEMY_PADDING),
                    y: 60 + r * (ENEMY_HEIGHT + ENEMY_PADDING),
                    width: ENEMY_WIDTH,
                    height: ENEMY_HEIGHT,
                    row: r,
                    active: true,
                    color: r === 0 ? '#FF0055' : r === 1 ? '#FFD93D' : '#00f2ff'
                });
            }
        }

        setScore(0);
        setLives(3);
        setGameOver(false);
        setGameWon(false);
        setGameStarted(true);
        soundManager.init();
    };

    // Input Handling
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState.current.keys.hasOwnProperty(e.code)) {
                gameState.current.keys[e.code] = true;
                if (!gameStarted && e.code === 'Space') {
                    initGame();
                }
            }
        };

        const handleKeyUp = (e) => {
            if (gameState.current.keys.hasOwnProperty(e.code)) {
                gameState.current.keys[e.code] = false;
            }
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
        let animationId;

        const update = () => {
            const state = gameState.current;

            // 1. Move Player
            if (state.keys.ArrowLeft && state.player.x > 0) {
                state.player.x -= PLAYER_SPEED;
            }
            if (state.keys.ArrowRight && state.player.x < CANVAS_WIDTH - PLAYER_WIDTH) {
                state.player.x += PLAYER_SPEED;
            }

            // 2. Shoot Bullets
            const now = Date.now();
            if (state.keys.Space && now - state.lastShotTime > 300) { // Fire rate limit
                state.bullets.push({
                    x: state.player.x + PLAYER_WIDTH / 2,
                    y: state.player.y,
                    width: 4,
                    height: 10,
                    active: true
                });
                state.lastShotTime = now;
                soundManager.playShoot();
            }

            // 3. Update Bullets
            state.bullets.forEach(b => {
                b.y -= BULLET_SPEED;
                if (b.y < 0) b.active = false;
            });
            state.bullets = state.bullets.filter(b => b.active);

            // 4. Move Enemies
            state.enemyMoveTimer++;
            if (state.enemyMoveTimer > 30) { // Move every 30 frames
                let moveDown = false;
                let activeEnemies = state.enemies.filter(e => e.active);

                // Check bounds
                const leftMost = Math.min(...activeEnemies.map(e => e.x));
                const rightMost = Math.max(...activeEnemies.map(e => e.x + e.width));

                if (rightMost > CANVAS_WIDTH - 20 || leftMost < 20) {
                    state.enemyDirection *= -1;
                    moveDown = true;
                }

                activeEnemies.forEach(e => {
                    e.x += state.enemyDirection * 10;
                    if (moveDown) e.y += 20;
                });
                state.enemyMoveTimer = 0;

                // Check Game Over (Enemies reached bottom)
                if (activeEnemies.some(e => e.y > state.player.y - 50)) {
                    setGameOver(true);
                    setGameStarted(false);
                    soundManager.playGameOver();
                }
            }

            // 5. Collision Detection
            state.bullets.forEach(b => {
                state.enemies.forEach(e => {
                    if (e.active && b.active &&
                        b.x < e.x + e.width &&
                        b.x + b.width > e.x &&
                        b.y < e.y + e.height &&
                        b.y + b.height > e.y) {
                        e.active = false;
                        b.active = false;
                        setScore(prev => prev + 100);
                        soundManager.playExplosion();

                        // Spawn particles
                        for (let i = 0; i < 8; i++) {
                            state.particles.push({
                                x: e.x + e.width / 2,
                                y: e.y + e.height / 2,
                                vx: (Math.random() - 0.5) * 5,
                                vy: (Math.random() - 0.5) * 5,
                                life: 30,
                                color: e.color
                            });
                        }
                    }
                });
            });

            // Check Win
            if (state.enemies.every(e => !e.active)) {
                setGameWon(true);
                setGameStarted(false);
                soundManager.playWin();
            }

            // 6. Update Particles
            state.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
            });
            state.particles = state.particles.filter(p => p.life > 0);

            draw();
            animationId = requestAnimationFrame(update);
        };

        const draw = () => {
            const state = gameState.current;
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw Initial Stars (Static for now, could be animated)
            // (Assumed CSS background handles most starfield)

            // Draw Player
            ctx.fillStyle = '#00f2ff';
            ctx.beginPath();
            ctx.moveTo(state.player.x + PLAYER_WIDTH / 2, state.player.y);
            ctx.lineTo(state.player.x + PLAYER_WIDTH, state.player.y + PLAYER_HEIGHT);
            ctx.lineTo(state.player.x + PLAYER_WIDTH / 2, state.player.y + PLAYER_HEIGHT - 10);
            ctx.lineTo(state.player.x, state.player.y + PLAYER_HEIGHT);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00f2ff';

            // Draw Enemies
            state.enemies.forEach(e => {
                if (!e.active) return;
                ctx.fillStyle = e.color;
                ctx.shadowColor = e.color;

                // Alien Shape (bug-like)
                const cx = e.x + ENEMY_WIDTH / 2;
                const cy = e.y + ENEMY_HEIGHT / 2;
                const r = ENEMY_WIDTH / 2;

                ctx.beginPath();
                ctx.arc(cx, cy, r * 0.8, 0, Math.PI, true); // Head
                ctx.fillRect(e.x, cy, ENEMY_WIDTH, r); // Body

                // Eyes
                ctx.fillStyle = '#000';
                ctx.fillRect(cx - 5, cy - 2, 4, 4);
                ctx.fillRect(cx + 1, cy - 2, 4, 4);

                // Return to color
                ctx.fillStyle = e.color;

                // Legs
                if (Math.floor(Date.now() / 200) % 2 === 0) {
                    ctx.fillRect(e.x, e.y + e.height, 4, 6);
                    ctx.fillRect(e.x + e.width - 4, e.y + e.height, 4, 6);
                } else {
                    ctx.fillRect(e.x + 4, e.y + e.height, 4, 6);
                    ctx.fillRect(e.x + e.width - 8, e.y + e.height, 4, 6);
                }
            });

            // Draw Bullets
            ctx.fillStyle = '#ff0'; // Yellow bullets
            state.bullets.forEach(b => {
                ctx.fillRect(b.x, b.y, b.width, b.height);
            });

            // Draw Particles
            state.particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life / 30;
                ctx.fillRect(p.x, p.y, 4, 4);
                ctx.globalAlpha = 1;
            });
            ctx.shadowBlur = 0;
        };

        update();

        return () => cancelAnimationFrame(animationId);
    }, [gameStarted, gameOver, gameWon]);

    return (
        <div className="galaga-container">
            <div className="galaga-header">
                <Link to="/" className="back-btn">← Back</Link>
                <h1>GALAGA</h1>
                <div className="score-board galaga">Score: {score}</div>
            </div>

            <div className="canvas-wrapper">
                <canvas
                    id="galagaCanvas"
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="game-canvas"
                    ref={canvasRef}
                ></canvas>

                {!gameStarted && !gameOver && !gameWon && (
                    <div className="overlay start-overlay">
                        <h2>GALAGA MISSION</h2>
                        <button onClick={() => { initGame(); }} className="neon-btn galaga">START GAME</button>
                    </div>
                )}

                {gameOver && (
                    <div className="overlay game-over">
                        <h2>GAME OVER</h2>
                        <div className="final-score">Score: {score}</div>
                        <button onClick={initGame} className="neon-btn galaga">TRY AGAIN</button>
                    </div>
                )}

                {gameWon && (
                    <div className="overlay game-won">
                        <h2>MISSION COMPLETE</h2>
                        <div className="final-score">Score: {score}</div>
                        <button onClick={initGame} className="neon-btn galaga">PLAY AGAIN</button>
                    </div>
                )}
            </div>

            <p className="controls-hint">Arrow Keys to Move, Space to Shoot</p>
        </div>
    );
};

export default GalagaGame;
