import { useState, useEffect, useCallback, useRef } from 'react';
import { TETROMINOS, randomTetromino } from './tetronimos';

const STAGE_WIDTH = 10;
const STAGE_HEIGHT = 20;

// Custom Hook for interval that doesn't reset on render
function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

export const createStage = () =>
    Array.from(Array(STAGE_HEIGHT), () =>
        new Array(STAGE_WIDTH).fill([0, 'clear'])
    );

export const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
    for (let y = 0; y < player.tetromino.length; y += 1) {
        for (let x = 0; x < player.tetromino[y].length; x += 1) {
            // 1. Check that we're on an actual Tetromino cell
            if (player.tetromino[y][x] !== 0) {
                if (
                    // 2. Check that our move is inside the game areas height (y)
                    // We shouldn't go through the bottom of the play area
                    !stage[y + player.pos.y + moveY] ||
                    // 3. Check that our move is inside the game areas width (x)
                    !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
                    // 4. Check that the cell we're moving to isn't set to clear
                    stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
                ) {
                    return true;
                }
            }
        }
    }
    return false;
};

export const useTetris = () => {
    const [stage, setStage] = useState(createStage());
    const [rowsCleared, setRowsCleared] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [dropTime, setDropTime] = useState(null);

    const [player, setPlayer] = useState({
        pos: { x: 0, y: 0 },
        tetromino: TETROMINOS[0].shape,
        collided: false,
    });

    const movePlayer = (dir) => {
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0 });
        }
    };

    const startGame = () => {
        setStage(createStage());
        setDropTime(1000);
        resetPlayer();
        setGameOver(false);
        setScore(0);
        setRowsCleared(0);
    };

    const resetPlayer = useCallback(() => {
        setPlayer({
            pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
            tetromino: randomTetromino().shape,
            collided: false,
        });
    }, []);

    const drop = () => {
        // Increase level when player has cleared 10 rows
        if (rowsCleared > (score / 100 + 1) * 5) {
            // Simple level up logic
        }

        if (!checkCollision(player, stage, { x: 0, y: 1 })) {
            updatePlayerPos({ x: 0, y: 1, collided: false });
        } else {
            // Game Over
            if (player.pos.y < 1) {
                setGameOver(true);
                setDropTime(null);
            }
            updatePlayerPos({ x: 0, y: 0, collided: true });
        }
    };

    const keyUp = ({ key }) => {
        if (!gameOver) {
            if (key === 'ArrowDown') {
                setDropTime(1000 / (Math.floor(score / 500) + 1) + 200 || 1000);
            }
        }
    };

    const dropPlayer = () => {
        setDropTime(null);
        drop();
    };

    const hardDrop = () => {
        let tmpY = 0;
        while (!checkCollision(player, stage, { x: 0, y: tmpY + 1 })) {
            tmpY += 1;
        }
        updatePlayerPos({ x: 0, y: tmpY, collided: true });
    };

    const updatePlayerPos = ({ x, y, collided }) => {
        setPlayer(prev => ({
            ...prev,
            pos: { x: (prev.pos.x + x), y: (prev.pos.y + y) },
            collided,
        }));
    };

    // Rotate Matrix
    const rotate = (matrix, dir) => {
        const rotatedTetro = matrix.map((_, index) =>
            matrix.map(col => col[index])
        );
        if (dir > 0) return rotatedTetro.map(row => row.reverse());
        return rotatedTetro.reverse();
    };

    const playerRotate = (stage, dir) => {
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

        const pos = clonedPlayer.pos.x;
        let offset = 1;
        while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > clonedPlayer.tetromino[0].length) {
                rotate(clonedPlayer.tetromino, -dir);
                clonedPlayer.pos.x = pos;
                return;
            }
        }
        setPlayer(clonedPlayer);
    };

    useInterval(() => {
        drop();
    }, dropTime);

    useEffect(() => {
        const sweepRows = (newStage) => {
            return newStage.reduce((ack, row) => {
                if (row.findIndex(cell => cell[0] === 0) === -1) {
                    setRowsCleared(prev => prev + 1);
                    setScore(prev => prev + 100);
                    ack.unshift(new Array(newStage[0].length).fill([0, 'clear']));
                    return ack;
                }
                ack.push(row);
                return ack;
            }, []);
        };

        const updateStage = (prevStage) => {
            const newStage = prevStage.map(row =>
                row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
            );

            player.tetromino.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        const targetY = y + player.pos.y;
                        const targetX = x + player.pos.x;
                        if (newStage[targetY] && newStage[targetY][targetX]) {
                            newStage[targetY][targetX] = [
                                value,
                                `${player.collided ? 'merged' : 'clear'}`,
                            ];
                        }
                    }
                });
            });

            if (player.collided) {
                resetPlayer();
                return sweepRows(newStage);
            }

            return newStage;
        };

        setStage(prev => updateStage(prev));
    }, [player, resetPlayer]);

    return {
        stage,
        player,
        score,
        gameOver,
        startGame,
        movePlayer,
        dropPlayer,
        hardDrop,
        playerRotate,
        keyUp
    };
};

export default useTetris;
