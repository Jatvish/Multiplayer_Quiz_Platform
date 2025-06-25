// src/components/Home.jsx

import React from 'react';
import { Link } from 'react-router-dom';

function Home({ user }) {
  return (
    <div className="welcome-screen">
      <div className="container">
        <div className="text-center mb-2">
          <h2>🎯 Welcome to Quiz Platform</h2>
          <p>Test your knowledge and compete with friends!</p>
        </div>

        <div className="text-center mb-2">
          <h3>What would you like to do?</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/create-room" className="btn btn-primary btn-full">
            🎮 Create New Quiz Room
          </Link>

          <Link to="/join-room" className="btn btn-secondary btn-full">
            🚪 Join Existing Room
          </Link>
        </div>

        <div className="text-center mt-2">
          <div className="how-to-play">
            <h4>How to Play:</h4>
            <ul>
              <li>Create a room and share the code with friends</li>
              <li>Answer questions as fast as possible</li>
              <li>Earn points for correct answers</li>
              <li>Check the leaderboard to see who's winning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
