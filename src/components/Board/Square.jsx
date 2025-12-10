import React from 'react';
import { useDrop } from 'react-dnd';
import Piece from './Piece';

function Square({ position, isBlack, piece, onMove, isValidMove, isLastMove, isChecked, onDragStart, onDragEnd }) {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: 'piece',
        drop: (item) => {
            onMove(item.from, position);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(), // In a real app we might check validity here too
        }),
    }), [position, onMove]);

    const backgroundColor = isBlack ? '#779556' : '#ebecd0'; // Classic standard colors, can change to professional later

    let overlayColor = null;
    if (isChecked) {
        overlayColor = 'rgba(255, 0, 0, 0.6)'; // Red for check
    } else if (isOver && canDrop) {
        overlayColor = 'rgba(255, 255, 0, 0.5)'; // Highlight drop target
    } else if (isValidMove) {
        overlayColor = 'rgba(0, 0, 0, 0.1)'; // Hint valid move (dot usually)
    } else if (isLastMove) {
        overlayColor = 'rgba(255, 255, 0, 0.2)';
    }

    return (
        <div
            ref={drop}
            className="square"
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: backgroundColor,
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {/* Position Label (optional, for debugging or pro feel) */}
            {/* <span style={{ position: 'absolute', bottom: 2, right: 2, fontSize: 10, color: isBlack ? '#ebecd0' : '#779556' }}>{position}</span> */}

            {overlayColor && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: overlayColor,
                    zIndex: 1
                }} />
            )}

            {/* Dot for valid move if empty */}
            {isValidMove && !piece && (
                <div style={{
                    position: 'absolute',
                    width: '20%',
                    height: '20%',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    zIndex: 2
                }} />
            )}

            <div style={{ zIndex: 3, width: '100%', height: '100%' }}>
                {piece && <Piece type={piece.type} color={piece.color} position={position} onDragStart={onDragStart} onDragEnd={onDragEnd} />}
            </div>
        </div>
    );
}

export default Square;
