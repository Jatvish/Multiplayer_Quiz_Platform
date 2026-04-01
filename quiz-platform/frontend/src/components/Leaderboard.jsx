function Leaderboard({ leaderboard, currentUserId, isGameEnded }) {
  if (!leaderboard || leaderboard.length === 0) return null;

  const rankClass = (i) => ['rank-1', 'rank-2', 'rank-3'][i] || 'rank-other';
  const rankLabel = (i) => ['🥇', '🥈', '🥉'][i] || `${i + 1}`;

  return (
    <>
      <div className="leaderboard-title">
        {isGameEnded ? '🏆 Final Results' : '📊 Live Standings'}
      </div>
      <div className="leaderboard-list">
        {leaderboard.map((player, i) => (
          <div
            key={player.user_id}
            className={`leaderboard-item${player.user_id === currentUserId ? ' is-me' : ''}`}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className={`rank-badge ${rankClass(i)}`}>{rankLabel(i)}</div>
            <div className="lb-player-info">
              <div className="lb-username">
                {player.username}
                {player.user_id === currentUserId && ' (You)'}
              </div>
            </div>
            <div className="lb-score">{player.score} pts</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Leaderboard;
