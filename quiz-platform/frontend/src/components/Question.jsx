import React from 'react';

function Question({ question, onAnswerSelect, selectedAnswer, timeLeft, answerResult }) {
  if (!question) return null;

  const getAnswerFeedback = (optionId) => {
    if (!answerResult) return '';
    if (optionId === answerResult.correctAnswerId) return '✅ Correct';
    if (optionId === selectedAnswer && !answerResult.isCorrect) return '❌ Incorrect';
    return '';
  };

  return (
    <div className="question-container">
      <div className="question-header text-center mb-1">
        <span className="category">📚 {question.category}</span>
        <span className="difficulty" style={{ 
          marginLeft: '1rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '15px',
          fontSize: '0.8rem',
          background: question.difficulty === 'easy' ? '#d4edda' : 
                     question.difficulty === 'medium' ? '#fff3cd' : '#f8d7da',
          color: question.difficulty === 'easy' ? '#155724' : 
                 question.difficulty === 'medium' ? '#856404' : '#721c24'
        }}>
          {question.difficulty.toUpperCase()}
        </span>
      </div>

      <h3 className="question-text">{question.questionText}</h3>

      <div className="options-container">
        {question.options.map((option) => (
          <div key={option.id} style={{ position: 'relative' }}>
            <button
              onClick={() => onAnswerSelect(option.id)}
              disabled={selectedAnswer !== null || timeLeft <= 0}
              className={`option-btn ${selectedAnswer === option.id ? 'selected' : ''}`}
            >
              {option.option_text}
            </button>
            {answerResult && (
              <div style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontWeight: 'bold'
              }}>
                {getAnswerFeedback(option.id)}
              </div>
            )}
          </div>
        ))}
      </div>

      {answerResult && (
        <div className="text-center">
          <p style={{ 
            color: answerResult.isCorrect ? '#28a745' : '#dc3545', 
            fontWeight: 'bold',
            marginTop: '1rem'
          }}>
            {answerResult.isCorrect ? (
              `✅ Correct! +${answerResult.points} points`
            ) : (
              '❌ Incorrect!'
            )}
          </p>
        </div>
      )}

      {timeLeft <= 0 && !selectedAnswer && (
        <div className="text-center">
          <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
            ⏰ Time's up!
          </p>
        </div>
      )}
    </div>
  );
}

export default Question;