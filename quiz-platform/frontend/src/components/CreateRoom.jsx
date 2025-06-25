// src/components/CreateRoom.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SettingsModal from './SettingsModal';

function CreateRoom({ user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  // const [timePerQuestion, setTimePerQuestion] = useState(10); // default 10 seconds

  const [questionCount, setQuestionCount] = useState(5);
  const [difficulties, setDifficulties] = useState(['easy', 'medium', 'hard']);
  const [categories, setCategories] = useState(['Geography', 'Science', 'Math']);

  const [tempSettings, setTempSettings] = useState({});

  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/rooms/create', {
        questionCount,
        difficulties,
        categories
      });
      const { roomCode } = response.data.data;
      navigate(`/room/${roomCode}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const openSettings = () => {
    setTempSettings({ questionCount, difficulties: [...difficulties], categories: [...categories] });
    setShowSettings(true);
  };

  const handleSaveSettings = () => {
    setShowSettings(false);
  };

  const handleCancelSettings = () => {
    setQuestionCount(tempSettings.questionCount);
    setDifficulties(tempSettings.difficulties);
    setCategories(tempSettings.categories);
    setShowSettings(false);
  };

  return (
    <div className="container">
      <div className="text-center mb-2">
        <h2>🎮 Create Quiz Room</h2>
        <p>Create a new quiz room and invite your friends!</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div style={{
        background: '#f8f9fa',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h3>Room Settings</h3>
        <p><strong>Host:</strong> {user.username}</p>
        <p><strong>Questions:</strong> {questionCount}</p>
        <p><strong>Difficulties:</strong> {difficulties.join(', ')}</p>
        <p><strong>Categories:</strong> {categories.join(', ')}</p>
        <button className="btn btn-outline-primary mt-2" onClick={openSettings}>⚙️ Edit Settings</button>
      </div>

      <button className="btn btn-primary btn-full" onClick={handleCreateRoom} disabled={loading}>
        {loading ? 'Creating Room...' : '🚀 Create Room'}
      </button>

      <div className="text-center mt-2">
        <button onClick={() => navigate('/')} className="btn btn-secondary">← Back to Home</button>
      </div>

      {showSettings && (
        <SettingsModal
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          difficulties={difficulties}
          setDifficulties={setDifficulties}
          categories={categories}
          setCategories={setCategories}
          onSave={handleSaveSettings}
          onCancel={handleCancelSettings}
        />
      )}
    </div>
  );
}

export default CreateRoom;
