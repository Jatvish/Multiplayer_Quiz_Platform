const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Generate random room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new room
router.post('/create', auth, async (req, res) => {
  try {
    const { questionCount = 5, difficulties = ['easy', 'medium', 'hard'], categories = ['Geography', 'Science', 'Math'] } = req.body;

    let roomCode;
    let isUnique = false;

    // Generate unique room code
    while (!isUnique) {
      roomCode = generateRoomCode();
      const [existingRooms] = await db.pool.query(
        'SELECT * FROM rooms WHERE code = ?',
        [roomCode]
      );
      if (existingRooms.length === 0) isUnique = true;
    }

    // Save the selected settings into the DB
    const [result] = await db.pool.query(
      `INSERT INTO rooms (code, host_id, question_count, difficulties, categories)
       VALUES (?, ?, ?, ?, ?)`,
      [
        roomCode,
        req.userId,
        questionCount,
        difficulties.join(','),     // Store as comma-separated string
        categories.join(',')
      ]
    );

    res.status(201).json({
      status: 'success',
      data: {
        roomId: result.insertId,
        roomCode,
        hostId: req.userId
      }
    });

  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create room'
    });
  }
});

// Join a room
router.post('/join', auth, async (req, res) => {
  try {
    const { roomCode } = req.body;

    if (!roomCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Room code is required'
      });
    }

    // Find room
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

    const room = rooms[0];

    // Check if room is still open
    if (room.status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'This quiz has already ended'
      });
    }

    // Check if user is already in the room
    const [participants] = await db.pool.query(
      'SELECT * FROM room_participants WHERE room_id = ? AND user_id = ?',
      [room.id, req.userId]
    );

    if (participants.length > 0 && participants[0].status === 'active') {
      return res.json({
        status: 'success',
        data: {
          roomId: room.id,
          roomCode: room.code,
          isHost: room.host_id === req.userId,
          message: 'Already in room'
        }
      });
    }

    res.json({
      status: 'success',
      data: {
        roomId: room.id,
        roomCode: room.code,
        isHost: room.host_id === req.userId
      }
    });

  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to join room'
    });
  }
});

// Get room info
router.get('/:roomCode', auth, async (req, res) => {
  try {
    const { roomCode } = req.params;

    // Get room info
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

    const room = rooms[0];

    // Get participants
    const [participants] = await db.pool.query(
      `SELECT rp.*, u.username 
       FROM room_participants rp 
       JOIN users u ON rp.user_id = u.id 
       WHERE rp.room_id = ? AND rp.status = 'active'`,
      [room.id]
    );

    res.json({
      status: 'success',
      data: {
        room,
        participants,
        isHost: room.host_id === req.userId
      }
    });

  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get room info'
    });
  }
});

module.exports = router;
