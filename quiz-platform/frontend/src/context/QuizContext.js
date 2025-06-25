
import React, { createContext, useContext, useReducer } from 'react';

const QuizContext = createContext();

const initialState = {
  currentRoom: null,
  participants: [],
  currentQuestion: null,
  leaderboard: [],
  gameState: 'waiting', // waiting, playing, ended
  isHost: false,
  error: null
};

function quizReducer(state, action) {
  switch (action.type) {
    case 'SET_ROOM':
      return {
        ...state,
        currentRoom: action.payload,
        error: null
      };

    case 'SET_PARTICIPANTS':
      return {
        ...state,
        participants: action.payload
      };

    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        currentQuestion: action.payload,
        gameState: 'playing'
      };

    case 'SET_LEADERBOARD':
      return {
        ...state,
        leaderboard: action.payload
      };

    case 'SET_GAME_STATE':
      return {
        ...state,
        gameState: action.payload
      };

    case 'SET_IS_HOST':
      return {
        ...state,
        isHost: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'RESET_QUIZ':
      return initialState;

    default:
      return state;
  }
}

export const QuizProvider = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const value = {
    ...state,
    dispatch
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
