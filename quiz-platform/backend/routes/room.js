const express = require('express');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

// Create a new room
router.post('/create', auth, async (req, res) => {
  try {
    const { questionCount = 5, difficulties = ['easy', 'medium', 'hard'], categories = ['Geography', 'Science', 'Math'] } = req.body;

    let roomCode;
    let isUnique = false;
    while (!isUnique) {
      roomCode = generateRoomCode();
      const existing = await pool.query('SELECT id FROM rooms WHERE code = $1', [roomCode]);
      if (existing.rows.length === 0) isUnique = true;
    }

    const result = await pool.query(
      `INSERT INTO rooms (code, host_id, question_count, difficulties, categories)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [roomCode, req.userId, questionCount, difficulties.join(','), categories.join(',')]
    );

    const roomId = result.rows[0].id;
    await pool.query(
      'INSERT INTO room_participants (room_id, user_id, status) VALUES ($1, $2, $3)',
      [roomId, req.userId, 'active']
    );

    console.log(`✅ Room created: ${roomCode} (ID: ${roomId}) with host ${req.userId}`);
    res.status(201).json({ status: 'success', data: { roomId, roomCode, hostId: req.userId } });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create room' });
  }
});

// Join a room
router.post('/join', auth, async (req, res) => {
  try {
    const { roomCode } = req.body;
    if (!roomCode) return res.status(400).json({ status: 'error', message: 'Room code is required' });

    const roomResult = await pool.query('SELECT * FROM rooms WHERE code = $1', [roomCode]);
    if (roomResult.rows.length === 0)
      return res.status(404).json({ status: 'error', message: 'Room not found' });

    const room = roomResult.rows[0];
    if (room.status === 'completed')
      return res.status(400).json({ status: 'error', message: 'This quiz has already ended' });

    const participantResult = await pool.query(
      'SELECT * FROM room_participants WHERE room_id = $1 AND user_id = $2',
      [room.id, req.userId]
    );

    if (participantResult.rows.length > 0 && participantResult.rows[0].status === 'active') {
      return res.json({ status: 'success', data: { roomId: room.id, roomCode: room.code, isHost: Number(room.host_id) === Number(req.userId), message: 'Already in room' } });
    }

    res.json({ status: 'success', data: { roomId: room.id, roomCode: room.code, isHost: Number(room.host_id) === Number(req.userId) } });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to join room' });
  }
});

// Get room info
router.get('/:roomCode', auth, async (req, res) => {
  try {
    const { roomCode } = req.params;
    const roomResult = await pool.query('SELECT * FROM rooms WHERE code = $1', [roomCode]);
    if (roomResult.rows.length === 0)
      return res.status(404).json({ status: 'error', message: 'Room not found' });

    const room = roomResult.rows[0];
    const participants = await pool.query(
      `SELECT rp.*, u.username FROM room_participants rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = $1 AND rp.status = 'active'`,
      [room.id]
    );

    res.json({ status: 'success', data: { room, participants: participants.rows, isHost: Number(room.host_id) === Number(req.userId) } });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get room info' });
  }
});

module.exports = router;
