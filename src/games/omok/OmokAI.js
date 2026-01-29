const BOARD_SIZE = 15;

// 방향 벡터 (가로, 세로, 대각선, 반대각선)
const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
];

const getBestMove = (board) => {
    // 빈 칸 중에서 가장 점수가 높은 곳을 찾음
    let bestScore = -Infinity;
    let bestMoves = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === null) {
                const score = evaluatePosition(board, r, c);
                if (score > bestScore) {
                    bestScore = score;
                    bestMoves = [{ r, c }];
                } else if (score === bestScore) {
                    bestMoves.push({ r, c });
                }
            }
        }
    }

    // 최고 점수 중 랜덤 선택 (다양성)
    if (bestMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * bestMoves.length);
        return bestMoves[randomIndex];
    }

    return null;
};

const evaluatePosition = (board, r, c) => {
    let score = 0;

    // 중앙에 가까울수록 가산점 (초반 포석)
    const center = Math.floor(BOARD_SIZE / 2);
    const dist = Math.abs(r - center) + Math.abs(c - center);
    score += (BOARD_SIZE * 2 - dist);

    // 공격(백돌)과 방어(흑돌) 점수 계산
    // AI는 현재 'white'라고 가정 (Player가 선공 black)
    score += evaluateLine(board, r, c, 'white') * 1.2; // 공격 가중치
    score += evaluateLine(board, r, c, 'black');       // 방어

    return score;
};

const evaluateLine = (board, r, c, color) => {
    let totalScore = 0;

    for (let [dr, dc] of directions) {
        let count = 1;      // 현재 위치 포함 연속된 돌 개수
        let emptyEnds = 0;  // 양쪽 끝이 비어있는지 여부
        let blocked = 0;    // 막 막힘 여부

        // 정방향 탐색
        let i = 1;
        while (true) {
            const nr = r + dr * i;
            const nc = c + dc * i;

            if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) {
                blocked++;
                break;
            }

            if (board[nr][nc] === color) {
                count++;
            } else if (board[nr][nc] === null) {
                emptyEnds++;
                break;
            } else {
                blocked++;
                break;
            }
            i++;
        }

        // 역방향 탐색
        i = 1;
        while (true) {
            const nr = r - dr * i;
            const nc = c - dc * i;

            if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) {
                blocked++;
                break;
            }

            if (board[nr][nc] === color) {
                count++;
            } else if (board[nr][nc] === null) {
                emptyEnds++;
                break;
            } else {
                blocked++;
                break;
            }
            i++;
        }

        // 점수 부여 (휴리스틱)
        if (count >= 5) totalScore += 100000;
        else if (count === 4) {
            if (emptyEnds > 0) totalScore += 10000; // 당장 막거나 이겨야 함
            if (emptyEnds === 2) totalScore += 40000; // 양쪽 열린 4 (필승/필패)
        }
        else if (count === 3) {
            if (emptyEnds === 2) totalScore += 5000; // 양쪽 열린 3
            else if (emptyEnds === 1) totalScore += 1000;
        }
        else if (count === 2) {
            if (emptyEnds === 2) totalScore += 500;
        }
        else if (count === 1) {
            // 주변 탐색 정도
            totalScore += 10;
        }
    }

    return totalScore;
};

export { getBestMove };
