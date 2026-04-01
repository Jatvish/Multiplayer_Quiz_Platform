function SettingsModal({ questionCount, setQuestionCount, difficulties, setDifficulties, categories, setCategories, onSave, onCancel }) {
  const toggle = (value, list, setList) => {
    setList(list.includes(value) ? list.filter(x => x !== value) : [...list, value]);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-card">
        <h3 className="modal-title">⚙️ Room Settings</h3>

        <div className="settings-section">
          <p className="settings-section-label">Number of Questions</p>
          <div className="toggle-group">
            {[3, 5, 10].map(n => (
              <button key={n} className={`toggle-btn${questionCount === n ? ' active' : ''}`}
                onClick={() => setQuestionCount(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <p className="settings-section-label">Difficulty</p>
          <div className="toggle-group">
            {['easy', 'medium', 'hard'].map(d => (
              <button key={d} className={`toggle-btn${difficulties.includes(d) ? ' active' : ''}`}
                onClick={() => toggle(d, difficulties, setDifficulties)}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <p className="settings-section-label">Categories</p>
          <div className="toggle-group">
            {['Geography', 'Science', 'Math'].map(c => (
              <button key={c} className={`toggle-btn${categories.includes(c) ? ' active' : ''}`}
                onClick={() => toggle(c, categories, setCategories)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary btn-full" onClick={onSave}>✓ Save Settings</button>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
