function Timer({ timeLeft, totalTime = 10 }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, timeLeft / totalTime);
  const offset = circumference * (1 - progress);
  const isUrgent = timeLeft <= 5;

  const hue = isUrgent ? Math.max(0, timeLeft * 12) : 162;
  const color = isUrgent ? `hsl(${hue}, 96%, 58%)` : `hsl(162, 80%, 52%)`;
  const glowColor = isUrgent ? `rgba(239,68,68,0.75)` : `rgba(16,185,129,0.65)`;

  return (
    <div className={`timer-wrapper${isUrgent ? ' urgent' : ''}`}>
      <svg className="timer-svg" viewBox="0 0 96 96" width="96" height="96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.95s linear, stroke 0.4s ease',
            filter: `drop-shadow(0 0 9px ${glowColor}) drop-shadow(0 0 4px ${glowColor})`,
          }}
        />
      </svg>
      <div className="timer-number" style={{ color }}>
        {timeLeft}
      </div>
    </div>
  );
}

export default Timer;
