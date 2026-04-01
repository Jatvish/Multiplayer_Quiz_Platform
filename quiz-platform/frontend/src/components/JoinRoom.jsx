import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function JoinRoom({ user }) {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/rooms/join', { roomCode });
      navigate(`/room/${roomCode}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-page">
      <div className="room-card">
        <h2 className="room-card-title">🎯 Join Room</h2>
        <p className="room-card-subtitle">Enter a 6-character room code to jump in</p>

        {error && <div className="error-message">⚠ {error}</div>}

        <form onSubmit={handleJoin}>
          <div className="form-group">
            <label className="form-label" htmlFor="roomCode">Room Code</label>
            <input
              className="form-input room-code-input"
              type="text" id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              required maxLength="6"
              placeholder="XXXXXX"
              autoComplete="off"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg"
            disabled={loading || roomCode.length !== 6}>
            {loading ? 'Joining...' : '🚀 Join Room'}
          </button>
        </form>

        <button onClick={() => navigate('/')} className="btn btn-ghost btn-full mt-1">
          ← Back to Home
        </button>

        <div className="tips-card">
          <p className="tips-title">💡 Tips</p>
          <ul className="tips-list">
            <li>Room codes are 6 characters (letters and numbers)</li>
            <li>Ask the host to share their room code</li>
            <li>Make sure the host hasn't started yet</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default JoinRoom;
