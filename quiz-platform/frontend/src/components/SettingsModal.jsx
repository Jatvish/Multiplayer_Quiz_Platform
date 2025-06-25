// src/components/SettingsModal.jsx

import React from 'react';

function SettingsModal({
  questionCount,
  setQuestionCount,
  difficulties,
  setDifficulties,
  categories,
  setCategories,
  onSave,
  onCancel
}) {
  const toggleSelection = (value, list, setList) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  return (
    <div className="settings-modal">
      <div className="modal-content">
        <h3>🛠️ Customize Room Settings</h3>

        <p><strong>Number of Questions</strong></p>
        {[3, 5, 10].map((num) => (
          <button
            key={num}
            className={`toggle-btn ${questionCount === num ? 'active' : ''}`}
            onClick={() => setQuestionCount(num)}
          >
            {num}
          </button>
        ))}

        <p className="mt-2"><strong>Difficulties</strong></p>
        {['easy', 'medium', 'hard'].map((diff) => (
          <button
            key={diff}
            className={`toggle-btn ${difficulties.includes(diff) ? 'active' : ''}`}
            onClick={() => toggleSelection(diff, difficulties, setDifficulties)}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}

        <p className="mt-2"><strong>Categories</strong></p>
        {['Geography', 'Science', 'Math'].map((cat) => (
          <button
            key={cat}
            className={`toggle-btn ${categories.includes(cat) ? 'active' : ''}`}
            onClick={() => toggleSelection(cat, categories, setCategories)}
          >
            {cat}
          </button>
        ))}

        <div className="mt-3">
          <button className="btn btn-success me-2" onClick={onSave}>✅ Save</button>
          <button className="btn btn-danger" onClick={onCancel}>❌ Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
