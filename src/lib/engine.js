import { Chess } from 'chess.js';

// Piece values for evaluation
const PIECE_VALUES = {
    p: 10,
    n: 30,
    b: 30,
    r: 50,
    q: 90,
    k: 900
};

// Simplified Piece-Square Tables (PST) for positional evaluation (Master level)
// Values are from white's perspective. For black, we mirror.
const PST = {
    p: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5, 5, 10, 25, 25, 10, 5, 5],
        [0, 0, 0, 20, 20, 0, 0, 0],
        [5, -5, -10, 0, 0, -10, -5, 5],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    n: [
        [-50, -40, -30, -30, -30, -30, -40, -50],
        [-40, -20, 0, 0, 0, 0, -20, -40],
        [-30, 0, 10, 15, 15, 10, 0, -30],
        [-30, 5, 15, 20, 20, 15, 5, -30],
        [-30, 0, 15, 20, 20, 15, 0, -30],
        [-30, 5, 10, 15, 15, 10, 5, -30],
        [-40, -20, 0, 5, 5, 0, -20, -40],
        [-50, -40, -30, -30, -30, -30, -40, -50]
    ],
    // Simplified others for brevity, can expand for 'Master' feel
    b: [
        [-20, -10, -10, -10, -10, -10, -10, -20],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-10, 0, 5, 10, 10, 5, 0, -10],
        [-10, 5, 5, 10, 10, 5, 5, -10],
        [-10, 0, 10, 10, 10, 10, 0, -10],
        [-10, 10, 10, 10, 10, 10, 10, -10],
        [-10, 5, 0, 0, 0, 0, 5, -10],
        [-20, -10, -10, -10, -10, -10, -10, -20]
    ],
    r: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [5, 10, 10, 10, 10, 10, 10, 5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [0, 0, 0, 5, 5, 0, 0, 0]
    ],
    q: [
        [-20, -10, -10, -5, -5, -10, -10, -20],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-10, 0, 5, 5, 5, 5, 0, -10],
        [-5, 0, 5, 5, 5, 5, 0, -5],
        [0, 0, 5, 5, 5, 5, 0, -5],
        [-10, 5, 5, 5, 5, 5, 0, -10],
        [-10, 0, 5, 0, 0, 0, 0, -10],
        [-20, -10, -10, -5, -5, -10, -10, -20]
    ],
    k: [
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-20, -30, -30, -40, -40, -30, -30, -20],
        [-10, -20, -20, -20, -20, -20, -20, -10],
        [20, 20, 0, 0, 0, 0, 20, 20],
        [20, 30, 10, 0, 0, 10, 30, 20]
    ]
};

// Evaluate the board position
const evaluateBoard = (game) => {
    let totalEvaluation = 0;
    const board = game.board();

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                const value = PIECE_VALUES[piece.type];

                // Position evaluation (Master only mostly triggers this fully in logic if desired, but we include it for levels 4-5)
                // Note: PST is for WHITE. For BLACK, we map mirrored.
                let pstValue = 0;
                if (PST[piece.type]) {
                    if (piece.color === 'w') {
                        pstValue = PST[piece.type][i][j];
                    } else {
                        pstValue = PST[piece.type][7 - i][j]; // Simple mirror for ranks
                    }
                }

                if (piece.color === 'w') {
                    totalEvaluation += (value + pstValue);
                } else {
                    totalEvaluation -= (value + pstValue);
                }
            }
        }
    }
    return totalEvaluation;
};

// Minimax with Alpha-Beta Pruning
const minimax = (game, depth, alpha, beta, isMaximizingPlayer) => {
    if (depth === 0 || game.isGameOver()) {
        return evaluateBoard(game);
    }

    const moves = game.moves();

    if (isMaximizingPlayer) { // White
        let maxEval = -Infinity;
        for (const move of moves) {
            game.move(move);
            const evalValue = minimax(game, depth - 1, alpha, beta, false);
            game.undo();
            maxEval = Math.max(maxEval, evalValue);
            alpha = Math.max(alpha, evalValue);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else { // Black (Computer usually plays black in this setup)
        let minEval = Infinity;
        for (const move of moves) {
            game.move(move);
            const evalValue = minimax(game, depth - 1, alpha, beta, true);
            game.undo();
            minEval = Math.min(minEval, evalValue);
            beta = Math.min(beta, evalValue);
            if (beta <= alpha) break;
        }
        return minEval;
    }
};

export const getBestMove = (game, difficultyLevel = 1) => { // 1 to 5
    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return null;

    // --- LEVEL 1: BEGINNER (Random) ---
    if (difficultyLevel <= 1) {
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    // --- LEVEL 2: INTERMEDIATE (Aggressive Captures) ---
    if (difficultyLevel === 2) {
        const movesDetail = game.moves({ verbose: true });
        const captures = movesDetail.filter(m => m.captured);
        if (captures.length > 0) {
            return captures[Math.floor(Math.random() * captures.length)];
        }
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    // --- LEVEL 3, 4, 5: MINIMAX ---
    // Level 3: Depth 2 (Quick, looks 1 exchange ahead)
    // Level 4: Depth 3 
    // Level 5: Depth 3 (We can increase search or keep depth 3 with better Eval already applied via PST)

    let depth = 2;
    if (difficultyLevel >= 4) depth = 3;

    let bestMove = null;
    let bestValue = Infinity; // Black wants to minimize score (White +, Black -)
    // Assuming AI is BLACK

    // Check who is playing. If AI is White, it wants Max. If Black, Min.
    // In this app, Player matches 'game.turn()'.
    // If we call getBestMove, it's the AI's turn.
    const isMaximizing = game.turn() === 'w';
    bestValue = isMaximizing ? -Infinity : Infinity;

    // Randomize moves order to not be deterministic for equal moves
    const shuffledMoves = possibleMoves.sort(() => Math.random() - 0.5);

    for (const move of shuffledMoves) {
        game.move(move);
        // If AI is Maximizing (White), next is Black (Minimize) -> call with false
        // If AI is Minimizing (Black), next is White (Maximize) -> call with true
        const boardValue = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizing);
        game.undo();

        if (isMaximizing) {
            if (boardValue > bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        } else {
            if (boardValue < bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        }
    }

    return bestMove || possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
};
