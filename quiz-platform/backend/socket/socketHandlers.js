const db = require('../config/database');
const roomTimers = {};

module.exports = (io, socket) => {
  // Join room and track userId for disconnects
  socket.on('join_room', async (data) => {
    try {
      const { roomCode, username, userId } = data;
      socket.userId = userId;

      const [rooms] = await db.pool.query('SELECT * FROM rooms WHERE code = ?', [roomCode]);
      if (rooms.length === 0) return socket.emit('error', { message: 'Room not found' });

      const room = rooms[0];
      if (room.status === 'completed') return socket.emit('error', { message: 'Quiz already ended' });

      const roomId = room.id;

      const [existing] = await db.pool.query('SELECT * FROM room_participants WHERE room_id = ? AND user_id = ?', [roomId, userId]);
      if (existing.length === 0) {
        await db.pool.query('INSERT INTO room_participants (room_id, user_id) VALUES (?, ?)', [roomId, userId]);
      } else if (existing[0].status === 'left') {
        await db.pool.query('UPDATE room_participants SET status = "active" WHERE room_id = ? AND user_id = ?', [roomId, userId]);
      }

      socket.join(roomCode);
      const [participants] = await db.pool.query(
        `SELECT rp.user_id, u.username 
         FROM room_participants rp JOIN users u ON rp.user_id = u.id 
         WHERE rp.room_id = ? AND rp.status = 'active'`, [roomId]
      );

      io.to(roomCode).emit('user_joined', { userId, username, participants });
      socket.emit('room_joined', {
        roomId, roomCode, participants,
        isHost: room.host_id === userId,
        hostId: room.host_id,
        roomStatus: room.status
      });
    } catch (err) {
      console.error('join_room error:', err);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Start quiz
  socket.on('start_quiz', async ({ roomCode, userId }) => {
    try {
      const [rooms] = await db.pool.query('SELECT * FROM rooms WHERE code = ?', [roomCode]);
      if (rooms.length === 0) return socket.emit('error', { message: 'Room not found' });

      const room = rooms[0];
      if (room.host_id !== userId) return socket.emit('error', { message: 'Only host can start the quiz' });

      const roomId = room.id;
      await db.pool.query('UPDATE rooms SET status = "active" WHERE id = ?', [roomId]);
      await db.pool.query('DELETE FROM room_questions WHERE room_id = ?', [roomId]);

      // Apply settings
      const qCount = room.question_count || 5;
      const diffs = room.difficulties ? room.difficulties.split(',') : ['easy', 'medium', 'hard'];
      const cats  = room.categories   ? room.categories.split(',') : ['Geography', 'Science', 'Math'];

      const placeholder = arr => arr.map(() => '?').join(',');
      const params = [...diffs, ...cats, qCount];

      const [questions] = await db.pool.query(
        `SELECT * FROM questions
         WHERE difficulty IN (${placeholder(diffs)})
           AND category IN (${placeholder(cats)})
         ORDER BY RAND()
         LIMIT ?`,
        params
      );

      if (questions.length === 0) return socket.emit('error', { message: 'No questions match filters' });

      for (const q of questions) {
        await db.pool.query('INSERT INTO room_questions (room_id, question_id, status) VALUES (?, ?, "pending")', [roomId, q.id]);
      }

      const [totalObj] = await db.pool.query('SELECT COUNT(*) as count FROM room_questions WHERE room_id = ?', [roomId]);
      const totalQuestions = totalObj[0].count;

      const [firstQ] = await db.pool.query(
        `SELECT rq.*, q.question_text, q.category, q.difficulty
         FROM room_questions rq JOIN questions q ON rq.question_id = q.id
         WHERE rq.room_id = ? AND rq.status = "pending"
         ORDER BY rq.id ASC LIMIT 1`, [roomId]
      );
      if (firstQ.length === 0) return socket.emit('error', { message: 'No question found' });

      const rqId = firstQ[0].id;
      const qId = firstQ[0].question_id;

      await db.pool.query('UPDATE room_questions SET status = "active", start_time = NOW() WHERE id = ?', [rqId]);

      const [options] = await db.pool.query('SELECT id, option_text FROM answer_options WHERE question_id = ? ORDER BY RAND()', [qId]);

      io.to(roomCode).emit('new_question', {
        roomQuestionId: rqId,
        questionText: firstQ[0].question_text,
        category: firstQ[0].category,
        difficulty: firstQ[0].difficulty,
        options,
        timeLimit: 10,
        currentQuestionNumber: 1,
        totalQuestions
      });

      roomTimers[roomCode] = setTimeout(() => {
        handleQuestionEnd(io, roomCode, rqId, qId, roomId);
      }, 10000);

    } catch (err) {
      console.error('start_quiz error:', err);
      socket.emit('error', { message: 'Error starting quiz' });
    }
  });

  // Handle question complete and next
  async function handleQuestionEnd(io, roomCode, roomQuestionId, questionId, roomId) {
    try {
      await db.pool.query('UPDATE room_questions SET status = "completed", end_time = NOW() WHERE id = ?', [roomQuestionId]);

      const [correct] = await db.pool.query('SELECT id, option_text FROM answer_options WHERE question_id = ? AND is_correct = TRUE', [questionId]);
      const [answers] = await db.pool.query(`
        SELECT ua.*, u.username
        FROM user_answers ua JOIN users u ON ua.user_id = u.id
        WHERE ua.room_question_id = ?`, [roomQuestionId]);

      io.to(roomCode).emit('question_ended', {
        roomQuestionId,
        correctAnswerId: correct[0].id,
        correctAnswerText: correct[0].option_text,
        userAnswers: answers
      });

      const [lb] = await db.pool.query(`
        SELECT rp.user_id, u.username, rp.score
        FROM room_participants rp JOIN users u ON rp.user_id = u.id
        WHERE rp.room_id = ? ORDER BY rp.score DESC`, [roomId]);
      io.to(roomCode).emit('leaderboard_updated', { leaderboard: lb });

      const [pending] = await db.pool.query(`
        SELECT rq.*, q.question_text, q.category, q.difficulty
        FROM room_questions rq JOIN questions q ON rq.question_id = q.id
        WHERE rq.room_id = ? AND rq.status = "pending"
        ORDER BY rq.id ASC LIMIT 1`, [roomId]);

      if (pending.length === 0) {
        await db.pool.query('UPDATE rooms SET status = "completed" WHERE id = ?', [roomId]);
        io.to(roomCode).emit('quiz_ended', { leaderboard: lb });
        return;
      }

      const [totalObj] = await db.pool.query('SELECT COUNT(*) as count FROM room_questions WHERE room_id = ?', [roomId]);
      const totalQuestions = totalObj[0].count;
      const [doneObj]  = await db.pool.query('SELECT COUNT(*) as count FROM room_questions WHERE room_id = ? AND status = "completed"', [roomId]);
      const current = doneObj[0].count + 1;

      const next = pending[0];
      await db.pool.query('UPDATE room_questions SET status = "active", start_time = NOW() WHERE id = ?', [next.id]);
      const [options2] = await db.pool.query('SELECT id, option_text FROM answer_options WHERE question_id = ? ORDER BY RAND()', [next.question_id]);

      io.to(roomCode).emit('new_question', {
        roomQuestionId: next.id,
        questionText: next.question_text,
        category: next.category,
        difficulty: next.difficulty,
        options: options2,
        timeLimit: 10,
        currentQuestionNumber: current,
        totalQuestions
      });

      roomTimers[roomCode] = setTimeout(() => {
        handleQuestionEnd(io, roomCode, next.id, next.question_id, roomId);
      }, 10000);

    } catch (err) {
      console.error('handleQuestionEnd error:', err);
      io.to(roomCode).emit('error', { message: 'Failed to process question' });
    }
  }

  // Submit answer
  socket.on('submit_answer', async ({ roomQuestionId, userId, answerId }) => {
    try {
      const [rq] = await db.pool.query('SELECT * FROM room_questions WHERE id = ?', [roomQuestionId]);
      if (rq.length === 0) return;

      const questionId = rq[0].question_id;
      const [correct] = await db.pool.query('SELECT id FROM answer_options WHERE question_id = ? AND is_correct = TRUE', [questionId]);

      const isCorrect = correct[0].id === answerId;
      const start = new Date(rq[0].start_time).getTime();
      const now = Date.now();
      const elapsed = now - start;
      const points = isCorrect ? Math.max(0, Math.floor(1000 * (1 - elapsed / 10000))) : 0;

      await db.pool.query(`
        INSERT INTO user_answers (room_question_id, user_id, answer_option_id, is_correct, response_time, points)
        VALUES (?, ?, ?, ?, ?, ?)`, [roomQuestionId, userId, answerId, isCorrect, elapsed, points]);

      await db.pool.query('UPDATE room_participants SET score = score + ? WHERE room_id = ? AND user_id = ?', [points, rq[0].room_id, userId]);

      const [lb] = await db.pool.query(`
        SELECT rp.user_id, u.username, rp.score
        FROM room_participants rp JOIN users u ON rp.user_id = u.id
        WHERE rp.room_id = ? ORDER BY rp.score DESC`, [rq[0].room_id]);

      socket.emit('answer_submitted', { isCorrect, points, responseTime: elapsed, correctAnswerId: correct[0].id });

      const [room] = await db.pool.query('SELECT code FROM rooms WHERE id = ?', [rq[0].room_id]);
      io.to(room[0].code).emit('leaderboard_updated', { leaderboard: lb });

    } catch (err) {
      console.error('submit_answer error:', err);
    }
  });

  // Leave room manually
  socket.on('leave_room', async ({ roomCode, userId }) => {
    try {
      const [rooms] = await db.pool.query('SELECT id FROM rooms WHERE code = ?', [roomCode]);
      if (rooms.length === 0) return;

      const roomId = rooms[0].id;
      await db.pool.query('UPDATE room_participants SET status = "left" WHERE room_id = ? AND user_id = ?', [roomId, userId]);

      socket.leave(roomCode);
      const [participants] = await db.pool.query(`
        SELECT rp.user_id, u.username
        FROM room_participants rp JOIN users u ON rp.user_id = u.id
        WHERE rp.room_id = ? AND rp.status = 'active'`, [roomId]);

      io.to(roomCode).emit('user_left', { userId, participants });

    } catch (err) {
      console.error('leave_room error:', err);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    try {
      const rooms = [...socket.rooms].filter(r => r !== socket.id);
      for (const roomCode of rooms) {
        const [rs] = await db.pool.query('SELECT id FROM rooms WHERE code = ?', [roomCode]);
        if (rs.length === 0) continue;

        const roomId = rs[0].id;
        await db.pool.query('UPDATE room_participants SET status = "left" WHERE user_id = ? AND room_id = ?', [socket.userId, roomId]);

        const [participants] = await db.pool.query(`
          SELECT rp.user_id, u.username
          FROM room_participants rp JOIN users u ON rp.user_id = u.id
          WHERE rp.room_id = ? AND rp.status = 'active'`, [roomId]);

        io.to(roomCode).emit('user_left', { userId: socket.userId, participants });
      }
    } catch (err) {
      console.error('disconnect handler error:', err);
    }
  });
};
 