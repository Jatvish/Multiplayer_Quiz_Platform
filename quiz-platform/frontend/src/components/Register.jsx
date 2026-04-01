import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Register({ onLogin }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.username.length < 3 || formData.username.length > 20) {
      setError('Username must be between 3 and 20 characters'); setLoading(false); return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores'); setLoading(false); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please provide a valid email address'); setLoading(false); return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters'); setLoading(false); return;
    }
    if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) ||
        !/\d/.test(formData.password)    || !/[@$!%*?&#]/.test(formData.password)) {
      setError('Password needs uppercase, lowercase, number & special char (@$!%*?&#)');
      setLoading(false); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); setLoading(false); return;
    }

    try {
      const response = await api.post('/auth/register', {
        username: formData.username, email: formData.email, password: formData.password,
      });
      const { token, user } = response.data.data;
      onLogin(user, token);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚡</div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join the arena and start competing</p>

        {error && <div className="error-message">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input className="form-input" type="text" id="username" name="username"
              value={formData.username} onChange={handleChange} required placeholder="Pick a cool name" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input className="form-input" type="email" id="email" name="email"
              value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input className="form-input" type="password" id="password" name="password"
              value={formData.password} onChange={handleChange} required placeholder="8+ chars, mixed" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input className="form-input" type="password" id="confirmPassword" name="confirmPassword"
              value={formData.confirmPassword} onChange={handleChange} required placeholder="Repeat password" />
          </div>
          <button type="submit" className="btn btn-primary btn-full mt-1" disabled={loading}>
            {loading ? 'Creating...' : '→ Create Account'}
          </button>
        </form>

        <div className="auth-divider">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
