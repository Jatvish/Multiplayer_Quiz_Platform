
const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Get leaderboard for a room
router.get('/leaderboard/:roomCode', auth, async (req, res) => {
  try {
    const { roomCode } = req.params;

    // Get room
    const [rooms] = await db.pool.query(
      'SELECT * FROM rooms WHERE code = ?',
      [roomCode]
    );

    if (rooms.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    const roomId = rooms[0].id;

    // Get leaderboard
    const [leaderboard] = await db.pool.query(
      `SELECT rp.user_id, u.username, rp.score 
       FROM room_participants rp 
       JOIN users u ON rp.user_id = u.id 
       WHERE rp.room_id = ? 
       ORDER BY rp.score DESC`,
      [roomId]
    );

    res.json({
      status: 'success',
      data: {
        leaderboard
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get leaderboard'
    });
  }
});

// Get quiz history for a user
router.get('/history', auth, async (req, res) => {
  try {
    const [history] = await db.pool.query(
      `SELECT r.code, r.status, rp.score, r.created_at 
       FROM room_participants rp 
       JOIN rooms r ON rp.room_id = r.id 
       WHERE rp.user_id = ? 
       ORDER BY r.created_at DESC 
       LIMIT 10`,
      [req.userId]
    );

    res.json({
      status: 'success',
      data: {
        history
      }
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get quiz history'
    });
  }
});

module.exports = router;
