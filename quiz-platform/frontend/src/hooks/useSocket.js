import { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Set to your deployed backend URL on Render
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://multiplayer-quiz-platform.onrender.com';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      withCredentials: true, // IMPORTANT for CORS + auth cookie
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server via socket');
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message || error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect(); // Clean disconnect
    };
  }, []);

  return socket;
};
