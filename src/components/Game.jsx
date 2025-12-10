import React, { useState, useCallback } from 'react';
import { useChess } from '../hooks/useChess';
import Board from './Board/Board';
import { PieceIcons } from './Board/PieceIcons';

function Game() {
    const { game, fen, turn, isGameOver, result, makeMove, resetGame, getValidMoves } = useChess();
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [lastMove, setLastMove] = useState(null);

    // Game Mode: 'PvP' or 'PvC'
    const [gameMode, setGameMode] = useState(null); // Null means menu open
    const [difficulty, setDifficulty] = useState(1); // 1-5
    const [difficultySelect, setDifficultySelect] = useState(false); // Show difficulty select screen
    const [colorSelect, setColorSelect] = useState(false); // Show color select screen
    const [playerColor, setPlayerColor] = useState('w'); // Player is White


    const onDrop = useCallback((sourceSquare, targetSquare) => {
        // Prevent move if computer's turn
        if (gameMode === 'PvC' && turn !== playerColor) return;

        const move = makeMove(sourceSquare, targetSquare);
        if (move) {
            setLastMove({ from: sourceSquare, to: targetSquare });
            setValidMoves([]);
            setSelectedSquare(null);
        }
    }, [makeMove, gameMode, turn, playerColor]);

    const onDragStart = useCallback((square) => {
        const moves = getValidMoves(square);
        // moves is array of objects { to: 'e4', ... }
        setValidMoves(moves.map(m => m.to));
    }, [getValidMoves]);

    const onDragEnd = useCallback(() => {
        setValidMoves([]);
    }, []);

    // Check detection
    const checkedSquare = React.useMemo(() => {
        if (game.inCheck()) {
            // Find King of current turn
            const board = game.board();
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const piece = board[r][c];
                    if (piece && piece.type === 'k' && piece.color === turn) {
                        const file = String.fromCharCode('a'.charCodeAt(0) + c);
                        const rank = 8 - r;
                        return `${file}${rank}`;
                    }
                }
            }
        }
        return null;
    }, [game, fen, turn]);

    // AI Turn Effect
    React.useEffect(() => {
        if (gameMode === 'PvC' && turn !== playerColor && !isGameOver) {
            const timer = setTimeout(() => {
                import('../lib/engine').then(({ getBestMove }) => {
                    const aiMove = getBestMove(game, difficulty);
                    if (aiMove) {
                        makeMove(aiMove); // aiMove is full move object or string, chess.js handles it
                    }
                });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [turn, gameMode, playerColor, isGameOver, game, makeMove]);

    // Move History and Captures (Hooks must be unconditional)
    const { capturedWhite, capturedBlack } = React.useMemo(() => {
        const history = game.history({ verbose: true });
        const capturedW = []; // Pieces lost by White (captured by Black)
        const capturedB = []; // Pieces lost by Black (captured by White)

        history.forEach(move => {
            if (move.captured) {
                if (move.color === 'w') {
                    capturedB.push(move.captured);
                } else {
                    capturedW.push(move.captured);
                }
            }
        });

        return { capturedWhite: capturedW, capturedBlack: capturedB };
    }, [game, fen]);

    // Move history for display
    const moveHistory = game.history();

    // Handle Game Reset (Back to Menu or Restart)
    const handleReset = () => {
        resetGame();
        setLastMove(null);
        setValidMoves([]);
    };

    const handleBackToMenu = () => {
        handleReset();
        setGameMode(null);
        setDifficultySelect(false);
        setColorSelect(false);
    };

    const handleModeSelect = (mode) => {
        if (mode === 'PvC') {
            setDifficultySelect(true);
        } else {
            setGameMode('PvP');
            setPlayerColor('w');
        }
    };

    const handleDifficultySelect = (level) => {
        setDifficulty(level);
        setDifficultySelect(false);
        setColorSelect(true);
    };

    const startGame = (color) => {
        setPlayerColor(color);
        setColorSelect(false);
        setGameMode('PvC');
    };

    // DIFFICULTY DATA
    const levels = [
        { level: 1, name: 'Beginner', stars: '⭐' },
        { level: 2, name: 'Intermediate', stars: '⭐⭐' },
        { level: 3, name: 'Advanced', stars: '⭐⭐⭐' },
        { level: 4, name: 'Expert', stars: '⭐⭐⭐⭐' },
        { level: 5, name: 'Master', stars: '⭐⭐⭐⭐⭐' },
    ];

    // START SCREEN
    if (!gameMode) {
        if (difficultySelect) {
            return (
                <div className="menu-container">
                    <h1 className="menu-title">Select Difficulty</h1>
                    <div className="menu-options vertical">
                        {levels.map((lvl) => (
                            <button key={lvl.level} onClick={() => handleDifficultySelect(lvl.level)} className="menu-btn level-btn">
                                <span className="level-name">{lvl.name}</span>
                                <span className="level-stars">{lvl.stars}</span>
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setDifficultySelect(false)} className="menu-back-btn" style={{ width: '200px', marginTop: '20px' }}>Back</button>
                </div>
            );
        }

        if (colorSelect) {
            return (
                <div className="menu-container">
                    <h1 className="menu-title">Choose Side</h1>
                    <div className="menu-options">
                        <button onClick={() => startGame('w')} className="menu-btn primary">
                            <span className="icon" style={{ filter: 'brightness(2)' }}>♔</span>
                            Play as White
                        </button>
                        <button onClick={() => startGame('b')} className="menu-btn secondary" style={{ background: '#333', color: '#ccc', border: '1px solid #555' }}>
                            <span className="icon">♚</span>
                            Play as Black
                        </button>
                    </div>
                    <button onClick={() => { setColorSelect(false); setDifficultySelect(true); }} className="menu-back-btn" style={{ width: '200px', marginTop: '20px' }}>Back</button>
                </div>
            );
        }

        return (
            <div className="menu-container">
                <h1 className="menu-title">Chess Master</h1>
                <p className="menu-subtitle">Select Game Mode</p>
                <div className="menu-options">
                    <button onClick={() => handleModeSelect('PvC')} className="menu-btn primary">
                        <span className="icon">🤖</span> Play vs Computer
                    </button>
                    <button onClick={() => handleModeSelect('PvP')} className="menu-btn secondary">
                        <span className="icon">👥</span> Play vs Friend
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="game-wrapper">
            <div className="game-info-panel">
                <h1>Professional Chess</h1>
                <div className="status-card">
                    <div className={`turn-indicator ${turn}`}>
                        Turn: <span>{turn === 'w' ? 'White' : 'Black'}</span>
                    </div>
                    {isGameOver && (
                        <div className="game-over-alert">
                            {result}
                        </div>
                    )}
                </div>

                <div className="captures-panel">
                    <div className="capture-row">
                        <span className="capture-label">Black's Captures:</span>
                        <div className="captured-pieces">
                            {capturedWhite.map((p, i) => {
                                const PieceIcon = PieceIcons['w'][p]; // Black captured White pieces
                                return (
                                    <div key={i} className="captured-piece-icon">
                                        <PieceIcon />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="capture-row">
                        <span className="capture-label">White's Captures:</span>
                        <div className="captured-pieces">
                            {capturedBlack.map((p, i) => {
                                const PieceIcon = PieceIcons['b'][p]; // White captured Black pieces
                                return (
                                    <div key={i} className="captured-piece-icon">
                                        <PieceIcon />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="controls">
                    <button onClick={handleReset} className="reset-btn">Restart Game</button>
                    <button onClick={handleBackToMenu} className="menu-back-btn">Main Menu</button>
                </div>
            </div>

            <div className="board-area">
                <Board
                    game={game}
                    onMove={onDrop}
                    validMoves={validMoves}
                    lastMove={lastMove}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    checkedSquare={checkedSquare}
                    orientation={playerColor === 'w' ? 'white' : 'black'}
                />
            </div>

            <div className="history-panel">
                <h3>Move History</h3>
                <div className="history-list">
                    {moveHistory.map((move, index) => (
                        (index % 2 === 0) ? (
                            <div key={index} className="history-row">
                                <span className="move-num">{Math.floor(index / 2) + 1}.</span>
                                <span className="move-white">{move}</span>
                                {moveHistory[index + 1] && <span className="move-black">{moveHistory[index + 1]}</span>}
                            </div>
                        ) : null
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Game;
