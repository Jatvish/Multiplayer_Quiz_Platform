const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ status: 'error', message: 'Username, email, and password are required' });

    if (username.length < 3 || username.length > 20)
      return res.status(400).json({ status: 'error', message: 'Username must be between 3 and 20 characters' });

    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return res.status(400).json({ status: 'error', message: 'Username can only contain letters, numbers, and underscores' });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ status: 'error', message: 'Please provide a valid email address' });

    if (password.length < 8)
      return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters long' });

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[@$!%*?&#]/.test(password))
      return res.status(400).json({ status: 'error', message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)' });

    const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existing.rows.length > 0)
      return res.status(409).json({ status: 'error', message: 'User with this email or username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );

    const userId = result.rows[0].id;
    const token = jwt.sign({ userId, username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

    res.status(201).json({ status: 'success', data: { token, user: { id: userId, username, email } } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to register user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });

    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

    res.json({ status: 'success', data: { token, user: { id: user.id, username: user.username, email: user.email } } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to login' });
  }
});

module.exports = router;
