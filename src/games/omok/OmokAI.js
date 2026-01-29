// Directions: Horizontal, Vertical, Diagonal 1 (\), Diagonal 2 (/)
const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
];

const BOARD_SIZE = 15;

const getLineLength = (board, r, c, dr, dc, player) => {
    let count = 0;
    let openEnds = 0;

    // Forward
    let tr = r + dr;
    let tc = c + dc;
    while (tr >= 0 && tr < BOARD_SIZE && tc >= 0 && tc < BOARD_SIZE && board[tr][tc] === player) {
        count++;
        tr += dr;
        tc += dc;
    }
    if (tr >= 0 && tr < BOARD_SIZE && tc >= 0 && tc < BOARD_SIZE && board[tr][tc] === null) {
        openEnds++;
    }

    // Backward
    tr = r - dr;
    tc = c - dc;
    while (tr >= 0 && tr < BOARD_SIZE && tc >= 0 && tc < BOARD_SIZE && board[tr][tc] === player) {
        count++;
        tr -= dr;
        tc -= dc;
    }
    if (tr >= 0 && tr < BOARD_SIZE && tc >= 0 && tc < BOARD_SIZE && board[tr][tc] === null) {
        openEnds++;
    }

    return { count: count + 1, openEnds }; // +1 for the current stone
};

const evaluatePosition = (board, r, c, player) => {
    let score = 0;

    for (const [dr, dc] of directions) {
        const { count, openEnds } = getLineLength(board, r, c, dr, dc, player);

        // Determine score based on patterns
        if (count >= 5) score += 100000;
        else if (count === 4) {
            if (openEnds === 2) score += 10000;
            else if (openEnds === 1) score += 1000;
        } else if (count === 3) {
            if (openEnds === 2) score += 1000;
            else if (openEnds === 1) score += 100;
        } else if (count === 2) {
            if (openEnds === 2) score += 100;
            else if (openEnds === 1) score += 10;
        }
    }

    return score;
};

export const getBestMove = (board, aiPlayer, humanPlayer) => {
    let bestScore = -Infinity;
    let bestMoves = [];

    // Check only empty spots nearby existing stones to optimization
    const candidateMoves = [];
    const visited = new Set();

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] !== null) {
                // Add neighbors
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === null) {
                            const key = `${nr},${nc}`;
                            if (!visited.has(key)) {
                                candidateMoves.push({ r: nr, c: nc });
                                visited.add(key);
                            }
                        }
                    }
                }
            }
        }
    }

    // If empty board (AI starts), center
    if (candidateMoves.length === 0) return { r: 7, c: 7 };

    for (const move of candidateMoves) {
        const { r, c } = move;

        // Evaluate Attack (AI's turn)
        let attackScore = evaluatePosition(board, r, c, aiPlayer);

        // Evaluate Defense (Block Human)
        let defenseScore = evaluatePosition(board, r, c, humanPlayer);

        // Heuristic: Attack + Defense (Weight defense slightly higher to avoid losing)
        let totalScore = attackScore + defenseScore * 1.1;

        if (totalScore > bestScore) {
            bestScore = totalScore;
            bestMoves = [move];
        } else if (totalScore === bestScore) {
            bestMoves.push(move);
        }
    }

    // Pick random from best moves
    const randomIdx = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[randomIdx];
};
