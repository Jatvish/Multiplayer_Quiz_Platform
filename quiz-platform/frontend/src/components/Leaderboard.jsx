
import React from 'react';

function Leaderboard({ leaderboard, currentUserId, isGameEnded }) {
  if (!leaderboard || leaderboard.length === 0) return null;

  const getRankEmoji = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}.`;
    }
  };

  return (
    <div className="leaderboard">
      <h3>
        {isGameEnded ? '🏆 Final Leaderboard' : '📊 Current Standings'}
      </h3>

      {leaderboard.map((player, index) => (
        <div 
          key={player.user_id} 
          className={`leaderboard-item ${player.user_id === currentUserId ? 'current-user' : ''}`}
          style={{
            border: player.user_id === currentUserId ? '2px solid #667eea' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="rank">{getRankEmoji(index)}</span>
            <span className="username">
              {player.username}
              {player.user_id === currentUserId && ' (You)'}
            </span>
          </div>
          <span className="score">{player.score} pts</span>
        </div>
      ))}
    </div>
  );
}

export default Leaderboard;
