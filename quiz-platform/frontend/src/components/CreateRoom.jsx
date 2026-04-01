import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SettingsModal from './SettingsModal';

function CreateRoom({ user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulties, setDifficulties] = useState(['easy', 'medium', 'hard']);
  const [categories, setCategories] = useState(['Geography', 'Science', 'Math']);
  const [tempSettings, setTempSettings] = useState({});
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/rooms/create', { questionCount, difficulties, categories });
      const { roomCode } = response.data.data;
      setTimeout(() => navigate(`/room/${roomCode}`), 200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const openSettings = () => {
    setTempSettings({ questionCount, difficulties: [...difficulties], categories: [...categories] });
    setShowSettings(true);
  };
  const handleSave = () => setShowSettings(false);
  const handleCancel = () => {
    setQuestionCount(tempSettings.questionCount);
    setDifficulties(tempSettings.difficulties);
    setCategories(tempSettings.categories);
    setShowSettings(false);
  };

  return (
    <div className="room-page">
      <div className="room-card">
        <h2 className="room-card-title">🎮 Create Room</h2>
        <p className="room-card-subtitle">Set up your quiz battle arena</p>

        {error && <div className="error-message">⚠ {error}</div>}

        <div className="settings-preview">
          <div className="settings-row">
            <span className="settings-row-label">Host</span>
            <span className="settings-row-value">{user.username}</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Questions</span>
            <span className="settings-row-value">{questionCount}</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Difficulty</span>
            <span className="settings-row-value">{difficulties.join(', ')}</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Categories</span>
            <span className="settings-row-value">{categories.join(', ')}</span>
          </div>
        </div>

        <button className="btn btn-secondary btn-full mb-1" onClick={openSettings}>
          ⚙️ Customize Settings
        </button>

        <button className="btn btn-primary btn-full btn-lg btn-glow"
          onClick={handleCreateRoom} disabled={loading}>
          {loading ? 'Creating...' : '🚀 Create Room'}
        </button>

        <button onClick={() => navigate('/')} className="btn btn-ghost btn-full mt-1">
          ← Back to Home
        </button>
      </div>

      {showSettings && (
        <SettingsModal
          questionCount={questionCount} setQuestionCount={setQuestionCount}
          difficulties={difficulties}   setDifficulties={setDifficulties}
          categories={categories}       setCategories={setCategories}
          onSave={handleSave}           onCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default CreateRoom;
