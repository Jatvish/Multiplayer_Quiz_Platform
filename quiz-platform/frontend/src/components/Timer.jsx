import React, { useEffect, useState } from 'react';

function Timer({ timeLeft }) {
  const [displayTime, setDisplayTime] = useState(timeLeft);
  const isUrgent = displayTime <= 5;

  useEffect(() => {
    setDisplayTime(timeLeft);
    
    if (timeLeft <= 5) {
      const timer = setTimeout(() => {
        setDisplayTime(prev => prev);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  return (
    <div className={`timer ${isUrgent ? 'urgent' : ''}`}>
      ⏱️ {displayTime}s
    </div>
  );
}

export default Timer;