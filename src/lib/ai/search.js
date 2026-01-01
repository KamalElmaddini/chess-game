import { evaluateBoard } from './evaluate';

// Simple move ordering: prioritized captures
const orderMoves = (game, moves) => {
    return moves.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Prioritize Captures (MVV-LVA simplified: just capture is formatting)
        // If we had victim/attacker values locally we could be more precise
        if (a.captured) scoreA += 10;
        if (b.captured) scoreB += 10;

        // Promotions
        if (a.promotion) scoreA += 20;
        if (b.promotion) scoreB += 20;

        return scoreB - scoreA;
    });
};

export const minimax = (game, depth, alpha, beta, isMaximizingPlayer, endTime) => {
    // Timeout check (check every few nodes? Checking "every" node is fine in JS for small depths)
    // To minimize overhead, maybe only check if depth > some value? But we want to break anywhere.
    // For simplicity, check every node. Date.now() is fast enough.
    if (endTime && Date.now() > endTime) {
        throw new Error('Timeout');
    }

    if (depth === 0 || game.isGameOver()) {
        return evaluateBoard(game);
    }

    // Get all legal moves
    const moves = game.moves({ verbose: true }); // verbose for move ordering data

    // Sort moves to improve pruning (Captures first)
    const sortedMoves = orderMoves(game, moves);

    if (isMaximizingPlayer) { // White
        let maxEval = -Infinity;
        for (const move of sortedMoves) {
            game.move(move); // chess.js move object works directly
            const evalValue = minimax(game, depth - 1, alpha, beta, false, endTime);
            game.undo();
            maxEval = Math.max(maxEval, evalValue);
            alpha = Math.max(alpha, evalValue);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else { // Black
        let minEval = Infinity;
        for (const move of sortedMoves) {
            game.move(move);
            const evalValue = minimax(game, depth - 1, alpha, beta, true, endTime);
            game.undo();
            minEval = Math.min(minEval, evalValue);
            beta = Math.min(beta, evalValue);
            if (beta <= alpha) break;
        }
        return minEval;
    }
};
