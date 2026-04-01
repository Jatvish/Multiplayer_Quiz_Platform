import { useRef, useCallback, useEffect } from 'react';

export const useSound = () => {
  const ctxRef = useRef(null);

  useEffect(() => {
    const resume = () => {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    };
    document.addEventListener('click', resume, { once: true });
    return () => document.removeEventListener('click', resume);
  }, []);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const tone = useCallback((freq, dur, type = 'sine', vol = 0.25, delay = 0) => {
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
      gain.gain.setValueAtTime(0.001, ac.currentTime + delay);
      gain.gain.linearRampToValueAtTime(vol, ac.currentTime + delay + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur);
      osc.start(ac.currentTime + delay);
      osc.stop(ac.currentTime + delay + dur + 0.05);
    } catch (e) { /* silently fail */ }
  }, [getCtx]);

  // Normal tick — short low square click
  const tick = useCallback(() => {
    tone(700, 0.055, 'square', 0.1);
  }, [tone]);

  // Urgent tick (≤5 s) — higher pitch, double pulse
  const urgentTick = useCallback(() => {
    tone(1100, 0.045, 'square', 0.18);
    tone(1350, 0.03, 'square', 0.12, 0.06);
  }, [tone]);

  // Correct — ascending chime C5 E5 G5 C6
  const correctSound = useCallback(() => {
    [[523.25, 0], [659.25, 0.1], [783.99, 0.2], [1046.5, 0.32]].forEach(([f, d]) => {
      tone(f, 0.22, 'sine', 0.32, d);
    });
  }, [tone]);

  // Wrong — descending sawtooth buzz
  const wrongSound = useCallback(() => {
    tone(260, 0.12, 'sawtooth', 0.35);
    tone(200, 0.12, 'sawtooth', 0.28, 0.11);
    tone(155, 0.18, 'sawtooth', 0.22, 0.22);
  }, [tone]);

  return { tick, urgentTick, correctSound, wrongSound };
};
