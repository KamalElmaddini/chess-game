import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Game from './components/Game';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container">
        <div className="content-wrap">
          <ErrorBoundary>
            <Game />
          </ErrorBoundary>
        </div>
        <footer className="app-footer">
          Designed & Developed by <a href="https://kamalelmaddini.github.io/portfolio/" target="_blank" rel="noopener noreferrer" className="creator-name">Kamal Elmaddini</a>
        </footer>
      </div>
    </DndProvider>
  );
}

export default App;
