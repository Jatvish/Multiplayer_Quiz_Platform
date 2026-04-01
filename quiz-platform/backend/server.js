// Import database functions
const { testConnection, initializeDatabase } = require('./config/database');

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const roomRoutes = require('./routes/room');

// Import socket handlers
const socketHandlers = require('./socket/socketHandlers');

// Load environment variables
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Health check (used by UptimeRobot to keep Render awake)
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/rooms', roomRoutes);

// Socket.io events
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);
  socketHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  let retries = 0;
  const maxRetries = 30;
  const retryDelay = 1000; // 1 second

  while (retries < maxRetries) {
    try {
      console.log(`🔁 Testing DB connection (attempt ${retries + 1}/${maxRetries})...`);
      const connected = await testConnection();
      
      if (connected) {
        console.log("🔧 Initializing DB schema...");
        await initializeDatabase();
        console.log('✅ Database initialized successfully');
        break;
      }
    } catch (err) {
      console.error(`Connection attempt ${retries + 1} failed:`, err.message);
    }
    
    retries++;
    if (retries < maxRetries) {
      console.log(`⏳ Retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  if (retries === maxRetries) {
    console.error('❌ Failed to connect to database after maximum retries');
  }
}

server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await startServer();
});