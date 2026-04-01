import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useSound } from '../hooks/useSound';
import Leaderboard from './Leaderboard';
import Question from './Question';
import Timer from './Timer';

function QuizRoom({ user }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { tick, urgentTick, correctSound, wrongSound } = useSound();

  const [gameState, setGameState] = useState('waiting'); // waiting | playing | ended
  const [participants, setParticipants] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [userAnswer, setUserAnswer] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState('');
  const [roomInfo, setRoomInfo] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Play-again states:
  // null           = not in play-again flow
  // 'waiting'      = non-host clicked Play Again, waiting for host to reset
  // 'host_left'    = was waiting for host, but host disconnected
  const [playAgainState, setPlayAgainState] = useState(null);

  const timerRef = useRef(null);
  const soundRef = useRef({ tick, urgentTick, correctSound, wrongSound });

  useEffect(() => {
    soundRef.current = { tick, urgentTick, correctSound, wrongSound };
  }, [tick, urgentTick, correctSound, wrongSound]);

  // Derived: is the host currently in the participants list?
  const hostInRoom = useMemo(() => {
    if (!roomInfo?.hostId) return true; // unknown — assume yes
    return participants.some(p => Number(p.user_id) === Number(roomInfo.hostId));
  }, [participants, roomInfo]);

  const resetGameState = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setCurrentQuestion(null);
    setUserAnswer(null);
    setAnswerResult(null);
    setLeaderboard([]);
    setTimeLeft(0);
    setQuestionNumber(0);
    setTotalQuestions(0);
    setPlayAgainState(null);
    setGameState('waiting');
  };

  useEffect(() => {
    if (!socket) return;

    const cleanupTimer = () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };

    const joinRoom = () => {
      socket.emit('join_room', { roomCode, username: user.username, userId: user.id });
    };

    if (socket.connected) joinRoom();
    else socket.once('connect', joinRoom);

    socket.on('room_joined', (data) => {
      setParticipants(data.participants);
      setIsHost(data.isHost);
      setRoomInfo(data);
      setGameState(data.roomStatus === 'active' ? 'playing' : 'waiting');
    });

    socket.on('user_joined', (data) => setParticipants(data.participants));

    socket.on('user_left', (data) => {
      setParticipants(data.participants);
      // If we were waiting for host to restart and host just left — surface that
      setPlayAgainState(prev => {
        if (prev === 'waiting') {
          const hostStillIn = data.participants.some(
            p => Number(p.user_id) === Number(roomInfo?.hostId)
          );
          if (!hostStillIn) return 'host_left';
        }
        return prev;
      });
    });

    socket.on('new_question', (data) => {
      cleanupTimer();
      setCurrentQuestion(data);
      setTimeLeft(data.timeLimit);
      setUserAnswer(null);
      setAnswerResult(null);
      setGameState('playing');
      setQuestionNumber(data.currentQuestionNumber);
      setTotalQuestions(data.totalQuestions || 5);

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { cleanupTimer(); return 0; }
          const next = prev - 1;
          if (next <= 5) soundRef.current.urgentTick();
          else soundRef.current.tick();
          return next;
        });
      }, 1000);
    });

    socket.on('question_ended', () => { cleanupTimer(); setGameState('waiting'); });

    socket.on('quiz_ended', (data) => {
      cleanupTimer();
      setGameState('ended');
      setLeaderboard(data.leaderboard);
    });

    socket.on('leaderboard_updated', (data) => setLeaderboard(data.leaderboard));

    socket.on('answer_submitted', (data) => {
      if (data.isCorrect) soundRef.current.correctSound();
      else soundRef.current.wrongSound();
      setAnswerResult({ isCorrect: data.isCorrect, points: data.points, correctAnswerId: data.correctAnswerId });
    });

    // Host clicked Play Again — everyone resets to waiting lobby
    socket.on('room_reset', (data) => {
      setParticipants(data.participants);
      resetGameState();
    });

    socket.on('error', (data) => setError(data.message));

    return () => {
      cleanupTimer();
      socket.off('connect', joinRoom);
      socket.off('room_joined');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('new_question');
      socket.off('question_ended');
      socket.off('quiz_ended');
      socket.off('leaderboard_updated');
      socket.off('answer_submitted');
      socket.off('room_reset');
      socket.off('error');
    };
  }, [socket, roomCode, user]); // eslint-disable-line

  const handleStartQuiz = () => {
    if (socket && isHost) {
      socket.emit('start_quiz', { roomCode, userId: user.id });
      setQuestionNumber(0);
    }
  };

  // Host: tell server to reset room for everyone
  const handlePlayAgainHost = () => {
    if (socket && isHost) {
      socket.emit('reset_room', { roomCode, userId: user.id });
    }
  };

  // Non-host: enter waiting state (server doesn't need notifying yet)
  const handlePlayAgainPlayer = () => {
    setPlayAgainState('waiting');
  };

  const handleAnswerSelect = (answerId) => {
    if (userAnswer || timeLeft <= 0) return;
    setUserAnswer(answerId);
    if (socket && currentQuestion) {
      socket.emit('submit_answer', {
        roomQuestionId: currentQuestion.roomQuestionId,
        userId: user.id,
        answerId,
      });
    }
  };

  const handleLeaveRoom = () => {
    if (socket) socket.emit('leave_room', { roomCode, userId: user.id });
    navigate('/');
  };

  if (error) {
    return (
      <div className="game-page">
        <div className="glass" style={{ padding: '2rem', maxWidth: 480, margin: '2rem auto', textAlign: 'center' }}>
          <div className="error-message">{error}</div>
          <button onClick={handleLeaveRoom} className="btn btn-secondary mt-1">← Back to Home</button>
        </div>
      </div>
    );
  }

  // Non-host clicked Play Again — waiting for host to reset
  if (playAgainState === 'waiting' || playAgainState === 'host_left') {
    return (
      <div className="game-page">
        <div className="game-header">
          <div className="room-badge">
            <span className="room-label">Room</span>
            <span className="room-code">{roomCode}</span>
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleLeaveRoom}>✕ Leave</button>
        </div>

        <div className="glass lobby-status-card" style={{ maxWidth: 520, margin: '2rem auto' }}>
          {playAgainState === 'host_left' ? (
            <>
              <div className="lobby-icon">😕</div>
              <h2 className="lobby-title">Host left the room</h2>
              <p className="lobby-subtitle">The quiz can't be restarted without the host.</p>
              <button onClick={handleLeaveRoom} className="btn btn-primary btn-lg">🏠 Back to Home</button>
            </>
          ) : (
            <>
              <div className="lobby-icon">⏳</div>
              <h2 className="lobby-title">Waiting for host to restart...</h2>
              <p className="lobby-subtitle">The host needs to click Play Again to reset the room.</p>
              <div className="waiting-dots"><span /><span /><span /></div>
              <button onClick={handleLeaveRoom} className="btn btn-ghost mt-1">← Back to Home</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="game-page">
      {/* Header bar */}
      <div className="game-header">
        <div className="room-badge">
          <span className="room-label">Room</span>
          <span className="room-code">{roomCode}</span>
        </div>

        {gameState === 'playing' && totalQuestions > 0 && (
          <div className="progress-wrap">
            <span className="progress-label">Question {questionNumber} / {totalQuestions}</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
            </div>
          </div>
        )}

        <button className="btn btn-danger btn-sm" onClick={handleLeaveRoom}>✕ Leave</button>
      </div>

      {/* Waiting lobby */}
      {gameState === 'waiting' && !currentQuestion && (
        <div className="lobby-container">
          <div className="glass lobby-status-card">
            <div className="lobby-icon">{isHost ? '🎮' : '⏳'}</div>
            <h2 className="lobby-title">
              {isHost ? 'Your room is ready!' : 'Waiting for host...'}
            </h2>
            <p className="lobby-subtitle">
              {isHost ? 'Start whenever everyone has joined' : 'The host will start the quiz shortly'}
            </p>
            {isHost ? (
              <button onClick={handleStartQuiz} className="btn btn-primary btn-lg btn-glow">
                🚀 Start Quiz
              </button>
            ) : (
              <div className="waiting-dots"><span /><span /><span /></div>
            )}
          </div>

          <div className="glass players-panel">
            <p className="panel-title">Players ({participants.length})</p>
            <div className="players-grid">
              {participants.map(p => (
                <div key={p.user_id} className={`player-chip${p.user_id === user.id ? ' you' : ''}`}>
                  <div className="player-avatar">{p.username[0].toUpperCase()}</div>
                  <span className="player-name">{p.username}</span>
                  {p.user_id === roomInfo?.hostId && <span className="host-badge">HOST</span>}
                  {p.user_id === user.id && <span className="you-badge">YOU</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Playing */}
      {gameState === 'playing' && currentQuestion && (
        <div className="playing-container">
          <div className="timer-area">
            <Timer timeLeft={timeLeft} totalTime={10} />
          </div>
          <Question
            question={currentQuestion}
            onAnswerSelect={handleAnswerSelect}
            selectedAnswer={userAnswer}
            timeLeft={timeLeft}
            answerResult={answerResult}
          />
        </div>
      )}

      {/* Game ended */}
      {gameState === 'ended' && (
        <div className="glass game-ended">
          <span className="trophy">🏆</span>
          <h2>Quiz Complete!</h2>
          <p>Amazing game! Check out the final scores below.</p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* HOST: direct reset button */}
            {isHost && (
              <button onClick={handlePlayAgainHost} className="btn btn-primary btn-lg btn-glow">
                🔄 Play Again
              </button>
            )}

            {/* NON-HOST: play again only if host is still in room */}
            {!isHost && hostInRoom && (
              <button onClick={handlePlayAgainPlayer} className="btn btn-glass btn-lg">
                🔄 Play Again
              </button>
            )}

            {/* NON-HOST: host has already left, can't restart */}
            {!isHost && !hostInRoom && (
              <button className="btn btn-glass btn-lg" disabled title="Host has left the room">
                🔄 Play Again
              </button>
            )}

            <button onClick={handleLeaveRoom} className="btn btn-secondary btn-lg">
              🏠 Back to Home
            </button>
          </div>

          {/* Hint for non-host about what Play Again does */}
          {!isHost && hostInRoom && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Clicking Play Again lets the host know you want to replay. The host must confirm.
            </p>
          )}
          {!isHost && !hostInRoom && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--danger-lt)' }}>
              Host has left — can't restart without them.
            </p>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="glass leaderboard-panel">
          <Leaderboard
            leaderboard={leaderboard}
            currentUserId={user.id}
            isGameEnded={gameState === 'ended'}
          />
        </div>
      )}
    </div>
  );
}

export default QuizRoom;
