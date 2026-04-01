const express = require('express');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/leaderboard/:roomCode', auth, async (req, res) => {
  try {
    const roomResult = await pool.query('SELECT id FROM rooms WHERE code = $1', [req.params.roomCode]);
    if (roomResult.rows.length === 0)
      return res.status(404).json({ status: 'error', message: 'Room not found' });

    const lb = await pool.query(
      `SELECT rp.user_id, u.username, rp.score
       FROM room_participants rp JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = $1 ORDER BY rp.score DESC`,
      [roomResult.rows[0].id]
    );

    res.json({ status: 'success', data: { leaderboard: lb.rows } });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get leaderboard' });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const history = await pool.query(
      `SELECT r.code, r.status, rp.score, r.created_at
       FROM room_participants rp JOIN rooms r ON rp.room_id = r.id
       WHERE rp.user_id = $1 ORDER BY r.created_at DESC LIMIT 10`,
      [req.userId]
    );
    res.json({ status: 'success', data: { history: history.rows } });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get quiz history' });
  }
});

module.exports = router;
