import React from 'react';
import { useDrag } from 'react-dnd';
import { PieceIcons } from './PieceIcons';

function Piece({ type, color, position, onDragStart, onDragEnd }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'piece',
        item: () => {
            if (onDragStart) onDragStart(position);
            return { type, color, from: position };
        },
        end: () => {
            if (onDragEnd) onDragEnd();
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [position, type, color, onDragStart, onDragEnd]);

    const Icon = PieceIcons[color][type];

    return (
        <div
            ref={drag}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Icon style={{ width: '90%', height: '90%', pointerEvents: 'none' }} />
        </div>
    );
}

export default Piece;
