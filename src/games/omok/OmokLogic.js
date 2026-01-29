// 5목 승리 조건 확인 로직
// board: 15x15 2D array (null, 'black', 'white')

const BOARD_SIZE = 15;

export const checkWinner = (board) => {
    // 가로, 세로, 대각선 방향 체크
    const directions = [
        [0, 1],   // 가로 (우)
        [1, 0],   // 세로 (하)
        [1, 1],   // 대각선 (우하)
        [1, -1]   // 대각선 (좌하)
    ];

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const stone = board[r][c];
            if (!stone) continue;

            for (let [dr, dc] of directions) {
                let count = 1;

                // 정방향 체크
                for (let i = 1; i < 5; i++) {
                    const nr = r + dr * i;
                    const nc = c + dc * i;
                    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
                    if (board[nr][nc] === stone) count++;
                    else break;
                }

                if (count === 5) {
                    // 6목 체크 (5목 초과 달성 시 승리 아님 - 렌주룰 간단 적용 시 필요할 수 있으나 여기선 일반 오목 룰로 5개 이상이면 승리로 처리하거나 정확히 5개만 승리로 처리 등 선택.
                    // 보통 간단한 오목은 5개 이상 승리 또는 정확히 5개 승리. 
                    // 여기서는 '정확히 5개'만 승리로 하거나, 연속된 5개를 찾았을 때 육목 여부를 체크해야 함.
                    // 간단하게: 현재 위치 이전 칸이 같은 색인지 확인하여 중복 카운팅 방지.

                    // 이전 칸 체크 (방향 반대쪽)
                    const prevR = r - dr;
                    const prevC = c - dc;
                    const hasPrev = prevR >= 0 && prevR < BOARD_SIZE && prevC >= 0 && prevC < BOARD_SIZE && board[prevR][prevC] === stone;

                    if (!hasPrev) {
                        // 6목 확인 (5번째 칸 다음 칸이 같은 색인지)
                        const nextR = r + dr * 5;
                        const nextC = c + dc * 5;
                        const hasNext = nextR >= 0 && nextR < BOARD_SIZE && nextC >= 0 && nextC < BOARD_SIZE && board[nextR][nextC] === stone;

                        if (!hasNext) {
                            return stone;
                        }
                    }
                }
            }
        }
    }
    return null;
};
