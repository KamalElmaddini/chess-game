import React, { useMemo } from 'react';
import Square from './Square';

const Board = ({ game, onMove, validMoves, lastMove, onDragStart, onDragEnd, checkedSquare, orientation = 'white' }) => {
    const board = game.board();

    // Helper to get algebraic notation from row/col indices (0-7)
    // If orientation is white: row 0 = rank 8.
    // If orientation is black: row 0 = rank 1. But game.board() always returns rank 8 first.
    // So we need to reverse the board array for rendering if black.

    let displayBoard = [...board];
    if (orientation === 'black') {
        displayBoard = displayBoard.reverse().map(row => [...row].reverse());
    }

    const getPosition = (rowIndex, colIndex) => {
        // If white: row 0, col 0 -> a8
        // If black: row 0, col 0 -> h1 (visual top-left is h1? no, visual top-left is h1 if flipped?
        // Wait. Standard:
        // Top-Left (0,0) is a8.
        // Flipped: Top-Left is h1.

        if (orientation === 'black') {
            const file = String.fromCharCode('h'.charCodeAt(0) - colIndex);
            const rank = rowIndex + 1;
            return `${file}${rank}`;
        } else {
            const file = String.fromCharCode('a'.charCodeAt(0) + colIndex);
            const rank = 8 - rowIndex;
            return `${file}${rank}`;
        }
    };

    const squares = displayBoard.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
            const position = getPosition(rowIndex, colIndex);

            // Determine square color
            // Standard: 0,0 (a8) is light (white). (0+0)%2=0 -> Light.
            // But we used (rowIndex + colIndex) % 2 === 1 for Black.
            // 0,0 -> 0 -> Light. Correct.
            // Flipped: 0,0 (h1). h1 is Light (White).
            // So visual check remains same pattern?
            // a8 (Light), b8 (Dark).
            // h1 (Light), g1 (Dark).
            // Yes, the visual pattern of the grid doesn't change relative to the screen.

            const isDark = (rowIndex + colIndex) % 2 === 1;

            const isValid = validMoves.includes(position);
            const isLast = lastMove && (lastMove.from === position || lastMove.to === position);

            return (
                <Square
                    key={position}
                    position={position}
                    isBlack={isDark}
                    piece={piece}
                    onMove={onMove}
                    isValidMove={isValid}
                    isLastMove={isLast}
                    isChecked={checkedSquare === position}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                />
            );
        })
    );

    const ranks = orientation === 'black' ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
    const files = orientation === 'black' ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    return (
        <div className="board-container">
            <div className="board-grid">
                {squares.flat()}
            </div>

            {/* Ranks (Numbers 1-8) */}
            <div className="coords ranks">
                {ranks.map(r => <span key={r}>{r}</span>)}
            </div>

            {/* Files (Letters A-H) */}
            <div className="coords files">
                {files.map(f => <span key={f}>{f}</span>)}
            </div>
        </div>
    );
}

export default Board;
