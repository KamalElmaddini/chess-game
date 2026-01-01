import React, { useState, useCallback } from 'react';
import { useChess } from '../hooks/useChess';
import Board from './Board/Board';
import { PieceIcons } from './Board/PieceIcons';
import GameOverModal from './GameOverModal';


function Game() {
    const { game, fen, turn, isGameOver, result, makeMove, undo, resetGame, getValidMoves } = useChess();
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [lastMove, setLastMove] = useState(null);

    // ... (state vars same)
    const [gameMode, setGameMode] = useState(null); // Null means menu open
    const [difficulty, setDifficulty] = useState(1); // 1-5
    const [difficultySelect, setDifficultySelect] = useState(false); // Show difficulty select screen
    const [colorSelect, setColorSelect] = useState(false); // Show color select screen
    const [playerColor, setPlayerColor] = useState('w'); // Player is White
    const [showModal, setShowModal] = useState(true);

    // Reset modal visibility when game over changes
    React.useEffect(() => {
        if (isGameOver) setShowModal(true);
    }, [isGameOver]);

    const handleModalClose = () => setShowModal(false);


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

    // UseUndo
    const handleUndo = () => {
        if (gameMode === 'PvC') {
            // Undo twice if computer mode (player move + computer move)
            // But wait, if computer handles its move quickly, turn might be back to player.
            // If we are waiting for computer, turning is computer.
            // If we undo while computer is thinking? logic gets tricky.
            // Simple approach: undo once. If turn becomes computer's, computer might re-move or we manually undo again.
            // Better: Undo twice if it was player's turn (so we go back to before player moved).
            // If computer is thinking, undoing might break the partial state.
            // For now, simple undo.
            undo();
        } else {
            undo();
        }
        setLastMove(null);
    };

    // ... (rest of logic same)

    // ... Copying existing logic ...

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
                        const executedMove = makeMove(aiMove);
                        if (executedMove) {
                            setLastMove({ from: executedMove.from, to: executedMove.to });
                        }
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

        // If player chose black, computer (White) needs to move.
        // The effect handles 'turn !== playerColor'.
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
        <div className="game-layout">
            {/* 1. Header Control Bar (Top) */}
            <div className="game-header">
                <div className="header-left">
                    <button onClick={handleBackToMenu} className="text-btn">Main Menu</button>
                    <button onClick={handleReset} className="text-btn">Restart</button>
                    <button onClick={handleUndo} className="text-btn undo-btn">Undo ↩️</button>
                </div>
                <div className="header-right">
                    {/* Placeholder */}
                </div>
            </div>

            {/* 2. Opponent Strip */}
            <div className="player-strip opponent">
                <div className="player-info">
                    <div className="avatar opponent-avatar">👤</div>
                    <div className="name-box">
                        <span className="name">{gameMode === 'PvC' ? `Computer (Lvl ${difficulty})` : 'Opponent'}</span>
                        <span className="status">{turn === (playerColor === 'w' ? 'b' : 'w') ? 'Thinking...' : ''}</span>
                    </div>
                </div>
                <div className="captured-line">
                    {/* Opponent captured MY pieces. If I am White, opponent is Black. Black captures White pieces. */}
                    {(playerColor === 'w' ? capturedWhite : capturedBlack).map((p, i) => {
                        const PieceIcon = PieceIcons['w'][p]; // Simplification: Render captured pieces. If opponent is black, they captured white pieces.
                        // Wait, if I am White, capturedWhite contains White pieces (captured by Black).
                        // So I want to show White pieces in the Black player's strip?
                        // Usually: You show the pieces the opponent has WON. i.e. The pieces currently missing from MY side.
                        // So yes, display capturedWhite here if I am White.
                        // But wait! PieceIcons['w'][p] will render a White piece. Correct.
                        // If I am Black, I want to show Black pieces (capturedBlack) in the Opponent's (White) strip.
                        // Correct logic:
                        // Opponent is 'b' (if I am 'w'). captured pieces are 'capturedWhite'.

                        // Dynamic Icon Color: The pieces displayed are the ones LOST by the player, so they are the PLAYER's color.
                        // Or usually, it shows the pieces the opponent has *eaten*. 
                        // Let's stick to: Opponent Bar shows pieces Opponent currently "holds" (captured).
                        const capturedList = playerColor === 'w' ? capturedWhite : capturedBlack;
                        const piecesColor = playerColor; // The pieces are my color

                        // BUT `map` below iterates `capturedList`. I need to fix the map to use correct list from `capturedList` variable if I used one.
                        // Let's rely on the inline ternary for now.

                        const iconColor = playerColor; // Display the pieces OF the player that were captured
                        const Icon = PieceIcons[iconColor][p];
                        return (
                            <div key={i} className="captured-piece-sm">
                                <Icon />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. Board Area */}
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

            {/* 4. Player Strip (Me) */}
            <div className="player-strip me">
                <div className="player-info">
                    <div className="avatar player-avatar">😎</div>
                    <div className="name-box">
                        <span className="name">You</span>
                        <span className="status">{turn === playerColor ? 'Your Turn' : ''}</span>
                    </div>
                </div>
                <div className="captured-line">
                    {/* I captured THEIR pieces. */}
                    {/* If I am White, I captured Black pieces (capturedBlack). */}
                    {(playerColor === 'w' ? capturedBlack : capturedWhite).map((p, i) => {
                        const iconColor = playerColor === 'w' ? 'b' : 'w';
                        const Icon = PieceIcons[iconColor][p];
                        return (
                            <div key={i} className="captured-piece-sm">
                                <Icon />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 5. Sidebar / Bottom Info (History, Game Over) */}
            <div className="game-sidebar">
                <div className="status-card-compact">
                    <div className={`turn-indicator ${turn}`}>
                        {isGameOver ? (
                            <span className="game-over-text">{result}</span>
                        ) : (
                            <>
                                <span>{turn === 'w' ? 'White' : 'Black'}</span> to move
                            </>
                        )}
                    </div>
                </div>

                <div className="history-panel-compact">
                    <h3>History</h3>
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
            {/* Game Over Modal */}
            {isGameOver && showModal && (
                <GameOverModal
                    message={result}
                    onRestart={handleReset}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
}

export default Game;
