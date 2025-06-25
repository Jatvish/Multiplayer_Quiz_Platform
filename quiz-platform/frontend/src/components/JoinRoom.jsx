
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function JoinRoom({ user }) {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/rooms/join', { roomCode });
      navigate(`/room/${roomCode}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="text-center mb-2">
        <h2>🚪 Join Quiz Room</h2>
        <p>Enter a room code to join an existing quiz!</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleJoinRoom}>
        <div className="form-group">
          <label htmlFor="roomCode">Room Code:</label>
          <input
            type="text"
            id="roomCode"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            required
            placeholder="Enter 6-character room code"
            maxLength="6"
            style={{ 
              textAlign: 'center', 
              fontSize: '1.5rem', 
              letterSpacing: '0.5rem',
              textTransform: 'uppercase'
            }}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-full"
          disabled={loading || roomCode.length !== 6}
        >
          {loading ? 'Joining Room...' : '🎯 Join Room'}
        </button>
      </form>

      <div className="text-center mt-2">
        <button 
          onClick={() => navigate('/')}
          className="btn btn-secondary"
        >
          ← Back to Home
        </button>
      </div>

      <div className="text-center mt-2">
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '1px solid #e1e5e9'
        }}>
          <h4>💡 Tips:</h4>
          <ul style={{ textAlign: 'left', margin: '1rem 0' }}>
            <li>Room codes are 6 characters long</li>
            <li>Ask the host for the room code</li>
            <li>Make sure you have a stable internet connection</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default JoinRoom;
