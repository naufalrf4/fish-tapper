import React, { useState, useCallback } from 'react';
import NameForm from './components/NameForm';
import GameCanvas from './components/GameCanvas';
import Leaderboard from './components/Leaderboard';
import StatusToast from './components/StatusToast';
import Modal from './components/Modal';
import { insertScore } from './lib/api';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, finished
  const [playerName, setPlayerName] = useState('');
  const [finalScore, setFinalScore] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [showScoreboardModal, setShowScoreboardModal] = useState(false);

  const handleNameSubmit = useCallback((name) => {
    setPlayerName(name);
    setGameState('playing');
    setFinalScore(null);
  }, []);

  const handleGameEnd = useCallback(async (score) => {
    setFinalScore(score);
    setGameState('finished');
    
    // Save score to database
    const { error } = await insertScore(playerName, score);
    
    if (error) {
      setToast({
        message: `Score saved locally. ${error}`,
        type: 'warning'
      });
    } else {
      setToast({
        message: `Score of ${score} saved successfully!`,
        type: 'success'
      });
    }
  }, [playerName]);

  const handlePlayAgain = useCallback(() => {
    setGameState('menu');
    setFinalScore(null);
    setPlayerName('');
  }, []);

  const handleCloseToast = useCallback(() => {
    setToast({ message: '', type: 'info' });
  }, []);

  const handleOpenScoreboard = useCallback(() => {
    setShowScoreboardModal(true);
  }, []);

  const handleCloseScoreboard = useCallback(() => {
    setShowScoreboardModal(false);
  }, []);

  return (
    <div className="app">
      <StatusToast
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
      
      {gameState === 'menu' && (
        <NameForm 
          onSubmit={handleNameSubmit} 
          onViewScoreboard={handleOpenScoreboard}
        />
      )}
      
      {gameState === 'playing' && (
        <GameCanvas
          playerName={playerName}
          onGameEnd={handleGameEnd}
        />
      )}
      
      {gameState === 'finished' && (
        <Leaderboard
          currentScore={finalScore}
          onPlayAgain={handlePlayAgain}
        />
      )}
      
      <Modal isOpen={showScoreboardModal} onClose={handleCloseScoreboard}>
        <Leaderboard
          currentScore={null}
          isModal={true}
          onClose={handleCloseScoreboard}
        />
      </Modal>
    </div>
  );
}

export default App;
