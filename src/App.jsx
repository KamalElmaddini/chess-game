import React from 'react';
import { DndProvider } from 'react-dnd';
import { MultiBackend } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import Game from './components/Game';
import ErrorBoundary from './components/ErrorBoundary';
import CustomDragLayer from './components/CustomDragLayer';
import './App.css';

function App() {
  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <div className="app-container">
        <CustomDragLayer />
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
