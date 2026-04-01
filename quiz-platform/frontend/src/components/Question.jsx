import { useEffect, useRef } from 'react';

const LETTERS = ['A', 'B', 'C', 'D'];
const CONFETTI_COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e', '#a78bfa', '#34d399'];

function Confetti({ active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const W = canvas.offsetWidth || 700;
    const H = canvas.offsetHeight || 400;
    canvas.width = W;
    canvas.height = H;

    const pieces = Array.from({ length: 110 }, () => ({
      x: W * 0.3 + Math.random() * W * 0.4,
      y: H * 0.35,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.9) * 16,
      r: Math.random() * 7 + 3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.25,
      gravity: 0.32 + Math.random() * 0.22,
      life: 1,
      decay: 0.007 + Math.random() * 0.008,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      pieces.forEach(p => {
        if (p.life <= 0) return;
        alive = true;
        p.vy += p.gravity;
        p.x += p.vx;
        p.vx *= 0.99;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.life -= p.decay;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        ctx.restore();
      });
      if (alive) animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="confetti-canvas" />;
}

function Question({ question, onAnswerSelect, selectedAnswer, timeLeft, answerResult }) {
  if (!question) return null;
  const { questionText, options, category, difficulty } = question;

  const getOptionClass = (optionId) => {
    const base = 'option-card';
    if (!selectedAnswer && timeLeft > 0) return `${base} hoverable`;
    if (selectedAnswer === optionId) {
      if (answerResult) return `${base} ${answerResult.isCorrect ? 'correct-answer' : 'wrong-answer'}`;
      return `${base} selected`;
    }
    if (answerResult && answerResult.correctAnswerId === optionId) return `${base} reveal-correct`;
    return `${base} dimmed`;
  };

  const isDisabled = !!selectedAnswer || timeLeft <= 0;

  return (
    <div className="question-container">
      <Confetti active={!!answerResult?.isCorrect} />

      <div className="question-meta">
        <span className={`badge badge-${difficulty}`}>{difficulty}</span>
        <span className="badge badge-category">📚 {category}</span>
      </div>

      <div className="question-text">{questionText}</div>

      <div className="options-grid">
        {options.map((option, idx) => (
          <button
            key={option.id}
            className={getOptionClass(option.id)}
            onClick={() => !isDisabled && onAnswerSelect(option.id)}
            disabled={isDisabled}
          >
            <span className="option-letter">{LETTERS[idx] || idx + 1}</span>
            <span className="option-text">{option.option_text}</span>
            {selectedAnswer === option.id && answerResult?.isCorrect && (
              <span className="result-icon">✓</span>
            )}
            {selectedAnswer === option.id && answerResult && !answerResult.isCorrect && (
              <span className="result-icon wrong">✗</span>
            )}
            {answerResult && answerResult.correctAnswerId === option.id && selectedAnswer !== option.id && (
              <span className="result-icon correct-reveal">✓</span>
            )}
          </button>
        ))}
      </div>

      {answerResult && (
        <div className={`answer-feedback ${answerResult.isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
          {answerResult.isCorrect
            ? `🎉 Correct! +${answerResult.points} points`
            : `❌ Wrong! The correct answer is highlighted above`}
        </div>
      )}

      {!selectedAnswer && timeLeft === 0 && (
        <div className="answer-feedback feedback-timeout">⏰ Time's up!</div>
      )}
    </div>
  );
}

export default Question;
