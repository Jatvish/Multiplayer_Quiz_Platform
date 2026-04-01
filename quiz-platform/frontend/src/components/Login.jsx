import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', formData);
      const { token, user } = response.data.data;
      onLogin(user, token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🧠</div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue your quiz journey</p>

        {error && <div className="error-message">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              className="form-input"
              type="email" id="email" name="email"
              value={formData.email} onChange={handleChange}
              required placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="form-input"
              type="password" id="password" name="password"
              value={formData.password} onChange={handleChange}
              required placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full mt-1" disabled={loading}>
            {loading ? 'Signing in...' : '→ Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          No account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
