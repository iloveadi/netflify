import { useState, useEffect, useCallback, useRef } from 'react';

const BOARD_SIZE = 20; // 20x20 grid
const INITIAL_SNAKE = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // Moving Up initially
const GAME_SPEED = 150;

// Custom Hook for interval
function useInterval(callback, delay) {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

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

export const useSnake = () => {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 5, y: 5 });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // To prevent rapid multiple key presses causing self-collision
    const [lastDirection, setLastDirection] = useState(INITIAL_DIRECTION);

    const generateFood = useCallback((currentSnake) => {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * BOARD_SIZE),
                y: Math.floor(Math.random() * BOARD_SIZE),
            };
            const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
            if (!isOnSnake) break;
        }
        return newFood;
    }, []);

    const resetGame = useCallback(() => {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setLastDirection(INITIAL_DIRECTION);
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
        setFood(generateFood(INITIAL_SNAKE));
    }, [generateFood]);

    const changeDirection = useCallback(({ x, y }) => {
        // Prevent reversing direction directly
        if (x + lastDirection.x === 0 && y + lastDirection.y === 0) return;
        setDirection({ x, y });
    }, [lastDirection]);

    const gameLoop = useCallback(() => {
        if (!isPlaying || gameOver) return;

        setSnake(prevSnake => {
            const head = prevSnake[0];
            const newHead = { x: head.x + direction.x, y: head.y + direction.y };

            // Check Collision with Walls
            if (
                newHead.x < 0 ||
                newHead.x >= BOARD_SIZE ||
                newHead.y < 0 ||
                newHead.y >= BOARD_SIZE
            ) {
                setGameOver(true);
                setIsPlaying(false);
                return prevSnake;
            }

            // Check Collision with Self
            if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                setGameOver(true);
                setIsPlaying(false);
                return prevSnake;
            }

            const newSnake = [newHead, ...prevSnake];

            // Check Food
            if (newHead.x === food.x && newHead.y === food.y) {
                setScore(prev => prev + 100);
                setFood(generateFood(newSnake));
            } else {
                newSnake.pop(); // Remove tail
            }

            setLastDirection(direction);
            return newSnake;
        });
    }, [isPlaying, gameOver, direction, food, generateFood]);

    useInterval(gameLoop, isPlaying && !gameOver ? GAME_SPEED : null);

    return {
        snake,
        food,
        score,
        gameOver,
        isPlaying,
        resetGame,
        changeDirection,
        setGameOver
    };
};
