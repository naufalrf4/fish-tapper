import React, { useState } from 'react';
import { validateName } from '../lib/utils';

function NameForm({ onSubmit, onViewScoreboard }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateName(name);
    
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    setError('');
    onSubmit(validation.name);
  };

  return (
    <div className="name-form">
      <div className="name-form__logo">
        <img src="/elsa-logo.svg" alt="ELSA IoT" className="name-form__logo-img" />
        <h1 className="name-form__title">Fish Tapper</h1>
      </div>
      <p className="name-form__subtitle">Smart Aquaculture Gaming Experience</p>
      <p className="name-form__brand">ELSA IoT Platform</p>
      
      <form onSubmit={handleSubmit} className="name-form__form">
        <div className="name-form__input-group">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="name-form__input"
            maxLength={24}
            autoFocus
          />
          {error && <div className="name-form__error">{error}</div>}
        </div>
        
        <button type="submit" className="name-form__button">
          Start Game
        </button>
      </form>
      
      <button 
        type="button" 
        onClick={onViewScoreboard} 
        className="name-form__button name-form__button--secondary"
      >
        🏆 View Scoreboard
      </button>
      
      <div className="name-form__rules">
        <h3>How to Play:</h3>
        <ul>
          <li>Click on fish as they appear in the water</li>
          <li>Each fish is worth 1 point</li>
          <li>Fish speed increases gradually</li>
          <li>Score as many points as possible in 30 seconds</li>
          <li>Compete for the top spot on the leaderboard!</li>
        </ul>
      </div>
    </div>
  );
}

export default NameForm;
