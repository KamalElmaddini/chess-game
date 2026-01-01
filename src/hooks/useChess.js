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
                    if (game.isCheckmate()) {
                        // If it's White's turn and checkmate, White lost. Black wins.
                        const winner = game.turn() === 'w' ? 'Black' : 'White';
                        setResult(`Checkmate! ${winner} Wins! 🏆`);
                    }
                    else if (game.isDraw()) setResult('Draw! 🤝');
                    else if (game.isStalemate()) setResult('Stalemate! ½-½');
                }
                return move;
            }
        } catch (e) {
            return null;
        }
        return null; // For fallback if no move
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

    // Undo the last move
    const undo = useCallback(() => {
        const move = game.undo();
        if (move) {
            setFen(game.fen());
            setTurn(game.turn());
            setIsGameOver(false);
            setResult(null);
            return true;
        }
        return false;
    }, [game]);

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
        undo,
        resetGame,
        getValidMoves,
    };
}
