import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';

export function useChess() {
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen()); // Use FEN string to trigger re-renders
    const [turn, setTurn] = useState(game.turn()); // 'w' or 'b'
    const [isGameOver, setIsGameOver] = useState(false);
    const [result, setResult] = useState(null); // 'Checkmate', 'Draw', etc.

    // Make a move (supports 'from'-'to' object or string SAN)
    const makeMove = useCallback((moveOrFrom, to, promotion = 'q') => {
        try {
            let move;
            if (typeof moveOrFrom === 'string' && !to) {
                // Handle SAN string (e.g., 'Nf3') or object passed as single arg
                move = game.move(moveOrFrom);
            } else {
                // Handle from-to
                move = game.move({ from: moveOrFrom, to, promotion });
            }

            if (move) {
                setFen(game.fen());
                setTurn(game.turn());

                if (game.isGameOver()) {
                    setIsGameOver(true);
                    if (game.isCheckmate()) setResult('Checkmate');
                    else if (game.isDraw()) setResult('Draw');
                    else if (game.isStalemate()) setResult('Stalemate');
                }
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }, [game]);

    // Reset the game
    const resetGame = useCallback(() => {
        const newGame = new Chess();
        setGame(newGame);
        setFen(newGame.fen());
        setTurn(newGame.turn());
        setIsGameOver(false);
        setResult(null);
    }, []);

    // Get valid moves for a square
    const getValidMoves = useCallback((square) => {
        return game.moves({ square, verbose: true });
    }, [game]);

    return {
        game,
        fen,
        turn,
        isGameOver,
        result,
        makeMove,
        resetGame,
        getValidMoves,
    };
}
