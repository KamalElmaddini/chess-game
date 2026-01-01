import React from 'react';
import '../App.css'; // Ensure we have access to styles

const GameOverModal = ({ message, onRestart, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Game Over</h2>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button onClick={onRestart} className="modal-btn primary">New Game</button>
                    <button onClick={onClose} className="modal-btn secondary">Close</button>
                </div>
            </div>
        </div>
    );
};

export default GameOverModal;
