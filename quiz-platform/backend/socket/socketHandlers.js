const { pool } = require('../config/database');
const roomTimers = {};

module.exports = (io, socket) => {

  socket.on('join_room', async (data) => {
    try {
      const { roomCode, username, userId } = data;
      socket.userId = userId;

      const roomRes = await pool.query('SELECT * FROM rooms WHERE code = $1', [roomCode]);
      if (roomRes.rows.length === 0) return socket.emit('error', { message: 'Room not found' });

      const room = roomRes.rows[0];
      if (room.status === 'completed') return socket.emit('error', { message: 'Quiz already ended' });

      const roomId = room.id;

      const existing = await pool.query(
        'SELECT * FROM room_participants WHERE room_id = $1 AND user_id = $2',
        [roomId, userId]
      );
      if (existing.rows.length === 0) {
        await pool.query(
          'INSERT INTO room_participants (room_id, user_id, status) VALUES ($1, $2, $3)',
          [roomId, userId, 'active']
        );
      } else if (existing.rows[0].status === 'left') {
        await pool.query(
          'UPDATE room_participants SET status = $1 WHERE room_id = $2 AND user_id = $3',
          ['active', roomId, userId]
        );
      }

      socket.join(roomCode);

      const participants = await pool.query(
        `SELECT rp.user_id, u.username
         FROM room_participants rp JOIN users u ON rp.user_id = u.id
         WHERE rp.room_id = $1 AND rp.status = 'active'`,
        [roomId]
      );

      console.log(`📊 Room ${roomCode}: ${participants.rows.length} active participants`);

      io.to(roomCode).emit('user_joined', { userId, username, participants: participants.rows });
      socket.emit('room_joined', {
        roomId, roomCode,
        participants: participants.rows,
        isHost: Number(room.host_id) === Number(userId),
        hostId: room.host_id,
        roomStatus: room.status,
      });
    } catch (err) {
      console.error('join_room error:', err);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('start_quiz', async ({ roomCode, userId }) => {
    try {
      const roomRes = await pool.query('SELECT * FROM rooms WHERE code = $1', [roomCode]);
      if (roomRes.rows.length === 0) return socket.emit('error', { message: 'Room not found' });

      const room = roomRes.rows[0];
      if (Number(room.host_id) !== Number(userId))
        return socket.emit('error', { message: 'Only host can start the quiz' });

      const roomId = room.id;
      await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', ['active', roomId]);
      await pool.query('DELETE FROM room_questions WHERE room_id = $1', [roomId]);

      const qCount = room.question_count || 5;
      const diffs = room.difficulties ? room.difficulties.split(',') : ['easy', 'medium', 'hard'];
      const cats  = room.categories   ? room.categories.split(',')   : ['Geography', 'Science', 'Math'];

      const diffPlaceholders = diffs.map((_, i) => `$${i + 1}`).join(',');
      const catPlaceholders  = cats.map((_, i)  => `$${diffs.length + i + 1}`).join(',');
      const limitPlaceholder = `$${diffs.length + cats.length + 1}`;

      const questions = await pool.query(
        `SELECT * FROM questions
         WHERE difficulty = ANY(ARRAY[${diffPlaceholders}]::text[])
           AND category   = ANY(ARRAY[${catPlaceholders}]::text[])
         ORDER BY RANDOM()
         LIMIT ${limitPlaceholder}`,
        [...diffs, ...cats, qCount]
      );

      if (questions.rows.length === 0)
        return socket.emit('error', { message: 'No questions match filters' });

      for (const q of questions.rows) {
        await pool.query(
          'INSERT INTO room_questions (room_id, question_id, status) VALUES ($1, $2, $3)',
          [roomId, q.id, 'pending']
        );
      }

      const totalRes = await pool.query('SELECT COUNT(*) AS count FROM room_questions WHERE room_id = $1', [roomId]);
      const totalQuestions = parseInt(totalRes.rows[0].count, 10);

      const firstQ = await pool.query(
        `SELECT rq.*, q.question_text, q.category, q.difficulty
         FROM room_questions rq JOIN questions q ON rq.question_id = q.id
         WHERE rq.room_id = $1 AND rq.status = 'pending'
         ORDER BY rq.id ASC LIMIT 1`,
        [roomId]
      );
      if (firstQ.rows.length === 0) return socket.emit('error', { message: 'No question found' });

      const rq = firstQ.rows[0];
      await pool.query(
        'UPDATE room_questions SET status = $1, start_time = NOW() WHERE id = $2',
        ['active', rq.id]
      );

      const options = await pool.query(
        'SELECT id, option_text FROM answer_options WHERE question_id = $1 ORDER BY RANDOM()',
        [rq.question_id]
      );

      io.to(roomCode).emit('new_question', {
        roomQuestionId: rq.id,
        questionText: rq.question_text,
        category: rq.category,
        difficulty: rq.difficulty,
        options: options.rows,
        timeLimit: 10,
        currentQuestionNumber: 1,
        totalQuestions,
      });

      roomTimers[roomCode] = setTimeout(() => {
        handleQuestionEnd(io, roomCode, rq.id, rq.question_id, roomId);
      }, 10000);

    } catch (err) {
      console.error('start_quiz error:', err);
      socket.emit('error', { message: 'Error starting quiz' });
    }
  });

  // Play Again — host only: resets room back to waiting with same settings
  socket.on('reset_room', async ({ roomCode, userId }) => {
    try {
      const roomRes = await pool.query('SELECT * FROM rooms WHERE code = $1', [roomCode]);
      if (roomRes.rows.length === 0) return socket.emit('error', { message: 'Room not found' });

      const room = roomRes.rows[0];
      if (Number(room.host_id) !== Number(userId))
        return socket.emit('error', { message: 'Only host can restart the quiz' });

      const roomId = room.id;

      // Cancel any running question timer
      if (roomTimers[roomCode]) {
        clearTimeout(roomTimers[roomCode]);
        delete roomTimers[roomCode];
      }

      // Reset room state
      await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', ['waiting', roomId]);
      await pool.query('DELETE FROM room_questions WHERE room_id = $1', [roomId]);
      await pool.query('UPDATE room_participants SET score = 0 WHERE room_id = $1', [roomId]);

      const participants = await pool.query(
        `SELECT rp.user_id, u.username
         FROM room_participants rp JOIN users u ON rp.user_id = u.id
         WHERE rp.room_id = $1 AND rp.status = 'active'`,
        [roomId]
      );

      console.log(`🔄 Room ${roomCode} reset by host ${userId}`);

      io.to(roomCode).emit('room_reset', {
        participants: participants.rows,
        hostId: room.host_id,
      });
    } catch (err) {
      console.error('reset_room error:', err);
      socket.emit('error', { message: 'Failed to restart room' });
    }
  });

  async function handleQuestionEnd(io, roomCode, roomQuestionId, questionId, roomId) {
    try {
      await pool.query(
        'UPDATE room_questions SET status = $1, end_time = NOW() WHERE id = $2',
        ['completed', roomQuestionId]
      );

      const correctRes = await pool.query(
        'SELECT id, option_text FROM answer_options WHERE question_id = $1 AND is_correct = TRUE',
        [questionId]
      );
      const answersRes = await pool.query(
        `SELECT ua.*, u.username
         FROM user_answers ua JOIN users u ON ua.user_id = u.id
         WHERE ua.room_question_id = $1`,
        [roomQuestionId]
      );

      io.to(roomCode).emit('question_ended', {
        roomQuestionId,
        correctAnswerId: correctRes.rows[0].id,
        correctAnswerText: correctRes.rows[0].option_text,
        userAnswers: answersRes.rows,
      });

      const lbRes = await pool.query(
        `SELECT rp.user_id, u.username, rp.score
         FROM room_participants rp JOIN users u ON rp.user_id = u.id
         WHERE rp.room_id = $1 ORDER BY rp.score DESC`,
        [roomId]
      );
      io.to(roomCode).emit('leaderboard_updated', { leaderboard: lbRes.rows });

      const pendingRes = await pool.query(
        `SELECT rq.*, q.question_text, q.category, q.difficulty
         FROM room_questions rq JOIN questions q ON rq.question_id = q.id
         WHERE rq.room_id = $1 AND rq.status = 'pending'
         ORDER BY rq.id ASC LIMIT 1`,
        [roomId]
      );

      if (pendingRes.rows.length === 0) {
        await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', ['completed', roomId]);
        io.to(roomCode).emit('quiz_ended', { leaderboard: lbRes.rows });
        return;
      }

      const totalRes = await pool.query('SELECT COUNT(*) AS count FROM room_questions WHERE room_id = $1', [roomId]);
      const doneRes  = await pool.query(
        "SELECT COUNT(*) AS count FROM room_questions WHERE room_id = $1 AND status = 'completed'",
        [roomId]
      );
      const totalQuestions = parseInt(totalRes.rows[0].count, 10);
      const current = parseInt(doneRes.rows[0].count, 10) + 1;

      const next = pendingRes.rows[0];
      await pool.query(
        'UPDATE room_questions SET status = $1, start_time = NOW() WHERE id = $2',
        ['active', next.id]
      );

      const options = await pool.query(
        'SELECT id, option_text FROM answer_options WHERE question_id = $1 ORDER BY RANDOM()',
        [next.question_id]
      );

      io.to(roomCode).emit('new_question', {
        roomQuestionId: next.id,
        questionText: next.question_text,
        category: next.category,
        difficulty: next.difficulty,
        options: options.rows,
        timeLimit: 10,
        currentQuestionNumber: current,
        totalQuestions,
      });

      roomTimers[roomCode] = setTimeout(() => {
        handleQuestionEnd(io, roomCode, next.id, next.question_id, roomId);
      }, 10000);

    } catch (err) {
      console.error('handleQuestionEnd error:', err);
      io.to(roomCode).emit('error', { message: 'Failed to process question' });
    }
  }

  socket.on('submit_answer', async ({ roomQuestionId, userId, answerId }) => {
    try {
      const rqRes = await pool.query('SELECT * FROM room_questions WHERE id = $1', [roomQuestionId]);
      if (rqRes.rows.length === 0) return;

      const rq = rqRes.rows[0];
      const correctRes = await pool.query(
        'SELECT id FROM answer_options WHERE question_id = $1 AND is_correct = TRUE',
        [rq.question_id]
      );

      const isCorrect = correctRes.rows[0].id === answerId;
      const start = new Date(rq.start_time).getTime();
      const elapsed = Date.now() - start;
      const points = isCorrect ? Math.max(0, Math.floor(1000 * (1 - elapsed / 10000))) : 0;

      await pool.query(
        `INSERT INTO user_answers (room_question_id, user_id, answer_option_id, is_correct, response_time, points)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [roomQuestionId, userId, answerId, isCorrect, elapsed, points]
      );
      await pool.query(
        'UPDATE room_participants SET score = score + $1 WHERE room_id = $2 AND user_id = $3',
        [points, rq.room_id, userId]
      );

      const lbRes = await pool.query(
        `SELECT rp.user_id, u.username, rp.score
         FROM room_participants rp JOIN users u ON rp.user_id = u.id
         WHERE rp.room_id = $1 ORDER BY rp.score DESC`,
        [rq.room_id]
      );

      socket.emit('answer_submitted', {
        isCorrect, points, responseTime: elapsed, correctAnswerId: correctRes.rows[0].id,
      });

      const roomRes = await pool.query('SELECT code FROM rooms WHERE id = $1', [rq.room_id]);
      io.to(roomRes.rows[0].code).emit('leaderboard_updated', { leaderboard: lbRes.rows });

    } catch (err) {
      console.error('submit_answer error:', err);
    }
  });

  socket.on('leave_room', async ({ roomCode, userId }) => {
    try {
      const roomRes = await pool.query('SELECT id FROM rooms WHERE code = $1', [roomCode]);
      if (roomRes.rows.length === 0) return;

      const roomId = roomRes.rows[0].id;
      await pool.query(
        'UPDATE room_participants SET status = $1 WHERE room_id = $2 AND user_id = $3',
        ['left', roomId, userId]
      );
      socket.leave(roomCode);

      const participants = await pool.query(
        `SELECT rp.user_id, u.username
         FROM room_participants rp JOIN users u ON rp.user_id = u.id
         WHERE rp.room_id = $1 AND rp.status = 'active'`,
        [roomId]
      );
      io.to(roomCode).emit('user_left', { userId, participants: participants.rows });
    } catch (err) {
      console.error('leave_room error:', err);
    }
  });

  socket.on('disconnect', async () => {
    try {
      const rooms = [...socket.rooms].filter(r => r !== socket.id);
      for (const roomCode of rooms) {
        const roomRes = await pool.query('SELECT id FROM rooms WHERE code = $1', [roomCode]);
        if (roomRes.rows.length === 0) continue;

        const roomId = roomRes.rows[0].id;
        await pool.query(
          'UPDATE room_participants SET status = $1 WHERE user_id = $2 AND room_id = $3',
          ['left', socket.userId, roomId]
        );

        const participants = await pool.query(
          `SELECT rp.user_id, u.username
           FROM room_participants rp JOIN users u ON rp.user_id = u.id
           WHERE rp.room_id = $1 AND rp.status = 'active'`,
          [roomId]
        );
        io.to(roomCode).emit('user_left', { userId: socket.userId, participants: participants.rows });
      }
    } catch (err) {
      console.error('disconnect handler error:', err);
    }
  });
};
