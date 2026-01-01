import { minimax } from './ai/search';
import { evaluateBoard } from './ai/evaluate';
import { Chess } from 'chess.js';

export const getBestMove = (game, difficultyLevel = 1) => { // 1 to 5
    // CLONE THE GAME to avoid polluting the actual game state validation
    // or rendering if exceptions occur.
    const gameClone = new Chess(game.fen());

    const possibleMoves = gameClone.moves();
    if (possibleMoves.length === 0) return null;

    // --- LEVEL 1: BEGINNER (Random) ---
    if (difficultyLevel <= 1) {
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    // --- LEVEL 2: EASY (Greedy Captures) ---
    if (difficultyLevel === 2) {
        const movesDetail = gameClone.moves({ verbose: true });
        // Prioritize captures
        const captures = movesDetail.filter(m => m.captured);

        // Pick a random capture if available, else random move
        if (captures.length > 0) {
            // Optional: Pick the 'best' capture (highest value victim)
            // Simple greedy: just random capture for now, or sort by captured piece value?
            // Let's stick to simple greedy: any capture is better than non-capture for Level 2 logic (aggressive)
            return captures[Math.floor(Math.random() * captures.length)];
        }
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    // --- LEVEL 3, 4, 5: MINIMAX with Iterative Deepening ---
    const TIME_LIMIT = 2000; // 2 seconds
    const endTime = Date.now() + TIME_LIMIT;

    // Target Depths
    let maxDepth = 2;
    if (difficultyLevel === 4) maxDepth = 3;
    if (difficultyLevel >= 5) maxDepth = 4; // can go deeper if time permits with ID?

    // Who is AI? (Assuming AI moved so it's their turn)
    const isMaximizing = gameClone.turn() === 'w'; // White wants +score

    // Randomize top-level moves for variety
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
    const shuffledMoves = shuffleArray([...possibleMoves]);

    let bestMove = shuffledMoves[0]; // Default fallback
    // If we have some heuristic sort for top level, apply it here

    // Iterative Deepening Loop
    // For lower levels (3), maybe strictly maxDepth is enough?
    // User requested "reduce time ... to 2s max". 
    // ID allows us to stop ANYTIME.

    // Start depth 1, go up to maxDepth.
    // NOTE: For Level 5, we might assume d=4 is target, but if it's fast, should we go d=5?
    // Let's cap at maxDepth for now to ensure strength doesn't accidentally become Grandmaster if user machine is fast,
    // or keep it strict to requested design. 
    // BUT user said "reduce time", implies it's too slow.

    try {
        for (let d = 1; d <= maxDepth; d++) {
            let currentDownloadBestMove = null;
            let currentDownloadBestValue = isMaximizing ? -Infinity : Infinity;

            // Search at depth 'd'
            // We reuse shuffledMoves order, but ideally we should sort them based on PREVIOUS iteration's scores (PV).
            // For simplicity, we just search.

            for (const move of shuffledMoves) {
                gameClone.move(move);

                // Check time before diving?
                if (Date.now() > endTime) {
                    gameClone.undo();
                    throw new Error('Timeout');
                }

                const boardValue = minimax(gameClone, d - 1, -Infinity, Infinity, !isMaximizing, endTime);
                gameClone.undo();

                if (isMaximizing) {
                    if (boardValue > currentDownloadBestValue) {
                        currentDownloadBestValue = boardValue;
                        currentDownloadBestMove = move;
                    }
                } else {
                    if (boardValue < currentDownloadBestValue) {
                        currentDownloadBestValue = boardValue;
                        currentDownloadBestMove = move;
                    }
                }
            }

            // Completed depth 'd' fully without timeout
            if (currentDownloadBestMove) {
                bestMove = currentDownloadBestMove;
            }
        }
    } catch (err) {
        if (err.message === 'Timeout') {
            console.log("AI Time limit reached. Returning best move from last completed depth.");
        } else {
            throw err;
        }
    }

    return bestMove || possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
};
