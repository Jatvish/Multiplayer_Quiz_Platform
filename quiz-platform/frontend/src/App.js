import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import QuizRoom from './components/QuizRoom';
import { QuizProvider } from './context/QuizContext';
import api from './services/api';
import './App.css';


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <QuizProvider>
      <Router>
        <div className="App">
          <header className="app-header">
            <div className="header-content">
              <h1>🧠 Quiz Platform</h1>
              {user && (
                <div className="user-info">
                  <span>Welcome, {user.username}!</span>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="app-main">
            <Routes>
              <Route 
                path="/" 
                element={user ? <Home user={user} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/login" 
                element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
              />
              <Route 
                path="/register" 
                element={user ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} 
              />
              <Route 
                path="/create-room" 
                element={user ? <CreateRoom user={user} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/join-room" 
                element={user ? <JoinRoom user={user} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/room/:roomCode" 
                element={user ? <QuizRoom user={user} /> : <Navigate to="/login" />} 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </QuizProvider>
  );
}

export default App;
