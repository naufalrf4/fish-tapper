import React from 'react';

function HUD({ timeLeft, score, playerName }) {
  const formatTime = (seconds) => {
    return seconds.toFixed(1);
  };

  return (
    <div className="hud">
      <div className="hud__item">
        <span className="hud__label">Player:</span>
        <span className="hud__value">{playerName}</span>
      </div>
      <div className="hud__item">
        <span className="hud__label">Time:</span>
        <span className={`hud__value ${timeLeft <= 5 ? 'hud__value--warning' : ''}`}>
          {formatTime(timeLeft)}s
        </span>
      </div>
      <div className="hud__item">
        <span className="hud__label">Score:</span>
        <span className="hud__value hud__value--score">{score}</span>
      </div>
    </div>
  );
}

export default HUD;
