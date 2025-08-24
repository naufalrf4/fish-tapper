import React, { useEffect, useState } from 'react';
import { fetchTopScores } from '../lib/api';
import { escapeHtml, formatDate } from '../lib/utils';

function Leaderboard({ currentScore, onPlayAgain, isModal = false, onClose = null }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await fetchTopScores();
    
    if (fetchError) {
      setError(fetchError);
    } else {
      setScores(data);
    }
    
    setLoading(false);
  };

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}.`;
    }
  };

  return (
    <div className={`leaderboard ${isModal ? 'leaderboard--modal' : ''}`}>
      {isModal && (
        <button className="leaderboard__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
      <h2 className="leaderboard__title">🏆 Leaderboard</h2>
      
      {currentScore !== null && (
        <div className="leaderboard__current-score">
          <h3>Your Score: {currentScore}</h3>
        </div>
      )}

      {loading && (
        <div className="leaderboard__loading">Loading scores...</div>
      )}

      {error && (
        <div className="leaderboard__error">
          Failed to load leaderboard: {error}
        </div>
      )}

      {!loading && !error && scores.length === 0 && (
        <div className="leaderboard__empty">
          No scores yet. Be the first to play!
        </div>
      )}

      {!loading && !error && scores.length > 0 && (
        <>
          <div className="leaderboard__stats">
            <span>Total Players: {scores.length}</span>
            {scores.length > 20 && <span className="leaderboard__scroll-hint">↓ Scroll for more</span>}
          </div>
          <div className="leaderboard__list">
            <div className="leaderboard__header">
              <span className="leaderboard__rank">Rank</span>
              <span className="leaderboard__name">Name</span>
              <span className="leaderboard__score">Score</span>
              <span className="leaderboard__date">Date</span>
            </div>
            <div className="leaderboard__rows">
              {scores.map((score, index) => (
                <div 
                  key={`${score.created_at}-${index}`} 
                  className={`leaderboard__row ${currentScore === score.score ? 'leaderboard__row--highlight' : ''} ${index < 3 ? 'leaderboard__row--top' : ''}`}
                >
                  <span className="leaderboard__rank">{getRankEmoji(index + 1)}</span>
                  <span className="leaderboard__name" dangerouslySetInnerHTML={{ __html: escapeHtml(score.name) }} />
                  <span className="leaderboard__score">{score.score}</span>
                  <span className="leaderboard__date">{formatDate(score.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="leaderboard__actions">
        {!isModal ? (
          <>
            <button onClick={onPlayAgain} className="leaderboard__button">
              Play Again
            </button>
            <button onClick={loadScores} className="leaderboard__button leaderboard__button--secondary">
              Refresh
            </button>
          </>
        ) : (
          <>
            <button onClick={loadScores} className="leaderboard__button">
              Refresh Scores
            </button>
            <button onClick={onClose} className="leaderboard__button leaderboard__button--secondary">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
