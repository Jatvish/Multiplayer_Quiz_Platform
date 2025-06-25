import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import Leaderboard from './Leaderboard';
import Question from './Question';
import Timer from './Timer';

function QuizRoom({ user }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const [gameState, setGameState] = useState('waiting');
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

  const timerRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const cleanupTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    socket.emit('join_room', {
      roomCode,
      username: user.username,
      userId: user.id
    });

    socket.on('room_joined', (data) => {
      setParticipants(data.participants);
      setIsHost(data.isHost);
      setRoomInfo(data);
      setGameState(data.roomStatus === 'active' ? 'playing' : 'waiting');
    });

    socket.on('user_joined', (data) => {
      setParticipants(data.participants);
    });

    socket.on('user_left', (data) => {
      setParticipants(data.participants);
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
          if (prev <= 1) {
            cleanupTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on('question_ended', () => {
      cleanupTimer();
      setGameState('waiting');
    });

    socket.on('quiz_ended', (data) => {
      cleanupTimer();
      setGameState('ended');
      setLeaderboard(data.leaderboard);
    });

    socket.on('leaderboard_updated', (data) => {
      setLeaderboard(data.leaderboard);
    });

    socket.on('answer_submitted', (data) => {
      setAnswerResult({
        isCorrect: data.isCorrect,
        points: data.points,
        correctAnswerId: data.correctAnswerId
      });
    });

    socket.on('error', (data) => {
      setError(data.message);
    });

    return () => {
      cleanupTimer();
      socket.off('room_joined');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('new_question');
      socket.off('question_ended');
      socket.off('quiz_ended');
      socket.off('leaderboard_updated');
      socket.off('answer_submitted');
      socket.off('error');
    };
  }, [socket, roomCode, user]);

  const handleStartQuiz = () => {
    if (socket && isHost) {
      socket.emit('start_quiz', {
        roomCode,
        userId: user.id
      });
      setQuestionNumber(0); // reset for a new session
    }
  };

  const handleAnswerSelect = (answerId) => {
    if (userAnswer || timeLeft <= 0) return;

    setUserAnswer(answerId);
    if (socket && currentQuestion) {
      socket.emit('submit_answer', {
        roomQuestionId: currentQuestion.roomQuestionId,
        userId: user.id,
        answerId
      });
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave_room', {
        roomCode,
        userId: user.id
      });
    }
    navigate('/');
  };

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <button onClick={handleLeaveRoom} className="btn btn-secondary">
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-room">
      <div className="container mb-1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Room: {roomCode}</h2>
          <button onClick={handleLeaveRoom} className="btn btn-secondary">Leave Room</button>
        </div>

        {gameState === 'waiting' && !currentQuestion && (
          <div className="text-center">
            <h3>Waiting for game to start...</h3>
            {isHost && participants.length > 0 && (
              <button onClick={handleStartQuiz} className="btn btn-primary mt-1">
                🚀 Start Quiz
              </button>
            )}
            {!isHost && <p>Waiting for host to start the quiz</p>}
          </div>
        )}

        <div className="participants-list">
          <h3>Players ({participants.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
            {participants.map((participant) => (
              <div key={participant.user_id} className="participant">
                <span>
                  {participant.username}
                  {participant.user_id === user.id && ' (You)'}
                  {participant.user_id === roomInfo?.hostId && ' (Host)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {gameState === 'playing' && currentQuestion && (
        <div className="container mb-1">
          <p className="text-center mb-2">
            <strong>Question {questionNumber} of {totalQuestions}</strong>
          </p>
          <Timer timeLeft={timeLeft} />
          <Question
            question={currentQuestion}
            onAnswerSelect={handleAnswerSelect}
            selectedAnswer={userAnswer}
            timeLeft={timeLeft}
            answerResult={answerResult}
          />
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className="container">
          <Leaderboard
            leaderboard={leaderboard}
            currentUserId={user.id}
            isGameEnded={gameState === 'ended'}
          />
        </div>
      )}

      {gameState === 'ended' && (
        <div className="container text-center">
          <div className="quiz-results">
            <h2>🎉 Quiz Completed!</h2>
            <p>Thanks for playing! Check out the final leaderboard above.</p>
            <button onClick={() => navigate('/')} className="btn btn-primary mt-2">
              🏠 Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizRoom;
