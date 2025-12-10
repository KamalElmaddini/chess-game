
import { Chess } from 'chess.js';

console.log("Starting debug script...");

try {
    const game = new Chess();
    console.log("Initial FEN:", game.fen());

    const move = { from: 'e2', to: 'e4' };
    console.log("Attempting move:", move);

    // Test logic from Game.jsx
    const result = game.move(move);
    console.log("Move result:", result);
    console.log("FEN after move:", game.fen());

    // Test computer logic
    const gameCopy = new Chess(game.fen());
    const moves = gameCopy.moves();
    console.log("Possible moves for computer:", moves.length);

    if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        console.log("Computer logic chose:", randomMove);
        const compResult = gameCopy.move(randomMove);
        console.log("Computer move result:", compResult);
        console.log("Final FEN:", gameCopy.fen());
    } else {
        console.log("No moves available for computer");
    }

} catch (e) {
    console.error("Error in debug script:", e);
}
