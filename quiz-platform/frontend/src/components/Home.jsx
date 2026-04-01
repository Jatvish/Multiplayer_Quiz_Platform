import { useNavigate } from 'react-router-dom';

function Home({ user }) {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="hero">
        <div className="hero-eyebrow">⚡ Multiplayer Quiz Battle</div>
        <h1 className="hero-title">
          Think Fast,<br />
          <span className="gradient-text">Win Big</span>
        </h1>
        <p className="hero-subtitle">
          Real-time quiz battles with friends. Answer faster, score higher, climb the leaderboard.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg btn-glow" onClick={() => navigate('/create-room')}>
            🚀 Create Room
          </button>
          <button className="btn btn-glass btn-lg" onClick={() => navigate('/join-room')}>
            🎯 Join Room
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <div className="stat-number">10s</div>
          <div className="stat-label">Per Question</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">1000</div>
          <div className="stat-label">Max Points</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">3</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">∞</div>
          <div className="stat-label">Players</div>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <span className="feature-icon">⚡</span>
          <h3 className="feature-title">Real-time Battles</h3>
          <p className="feature-desc">Compete live with friends using WebSocket-powered instant updates.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🎯</span>
          <h3 className="feature-title">Speed Scoring</h3>
          <p className="feature-desc">Answer faster to earn more points. Up to 1000 pts per correct answer.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🧠</span>
          <h3 className="feature-title">Multiple Categories</h3>
          <p className="feature-desc">Geography, Science, Math — customize difficulty and categories your way.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🏆</span>
          <h3 className="feature-title">Live Leaderboard</h3>
          <p className="feature-desc">Track rankings in real time. See who's dominating after every question.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
