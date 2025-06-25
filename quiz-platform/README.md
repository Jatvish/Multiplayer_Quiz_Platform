
# 🧠 Multiplayer Quiz Platform

A real-time multiplayer quiz platform built with React.js (frontend) and Node.js (backend), featuring Socket.io for real-time communication and MySQL for data persistence.

## ✨ Features

- 🎮 **Real-time multiplayer gameplay** - Play with friends in real-time
- 🏆 **Live leaderboards** - See rankings update instantly
- 🚪 **Room-based system** - Create or join quiz rooms with unique codes
- ⏱️ **Timed questions** - 30 seconds per question
- 📊 **Score tracking** - Points based on correctness and speed
- 📱 **Responsive design** - Works on desktop and mobile
- 🔐 **User authentication** - Secure login and registration
- 🎯 **Question categories** - Multiple quiz categories and difficulties

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Socket.io Client** - Real-time communication
- **React Router** - Navigation
- **Axios** - HTTP client
- **Styled Components** - CSS-in-JS

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd quiz-platform
```

### 2. Setup Backend
```bash
cd backend
npm install
cp config/.env.example .env
# Edit .env file with your database credentials
npm run dev
```

### 3. Setup Database
1. Create a MySQL database named `quiz_platform`
2. Import the schema: `mysql -u root -p quiz_platform < database/schema.sql`
3. Or use the automatic initialization when starting the server

### 4. Setup Frontend
```bash
cd frontend
npm install
npm start
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🐳 Docker Setup

Run the entire application with Docker Compose:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MySQL: localhost:3306

## 📁 Project Structure

```
quiz-platform/
├── backend/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── socket/            # Socket.io handlers
│   ├── database/          # Database schema
│   └── server.js          # Main server file
├── frontend/               # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   ├── hooks/         # Custom hooks
│   │   └── App.js         # Main app component
├── docker-compose.yml     # Docker configuration
└── README.md             # This file
```

## 🎮 How to Play

1. **Register/Login** - Create an account or log in
2. **Create Room** - Host a new quiz room and get a room code
3. **Join Room** - Enter a room code to join an existing quiz
4. **Start Quiz** - Host starts the quiz when ready
5. **Answer Questions** - Select answers quickly for more points
6. **View Results** - Check the leaderboard after each question
7. **Final Rankings** - See final results when quiz ends

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quiz_platform
DB_PORT=3306
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🚀 Deployment

### Backend Deployment
1. **Railway** - Connect GitHub repo and deploy
2. **Render** - Easy deployment with database add-ons
3. **DigitalOcean** - App Platform deployment
4. **AWS** - EC2 or Elastic Beanstalk

### Frontend Deployment
1. **Vercel** - Connect GitHub repo for automatic deployments
2. **Netlify** - Drag and drop build folder
3. **AWS S3** - Static website hosting

### Database Options
1. **Railway** - Built-in PostgreSQL/MySQL
2. **PlanetScale** - Serverless MySQL platform
3. **Amazon RDS** - Managed database service

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Rooms
- `POST /api/rooms/create` - Create new room
- `POST /api/rooms/join` - Join existing room
- `GET /api/rooms/:roomCode` - Get room info

### Quiz
- `GET /api/quiz/leaderboard/:roomCode` - Get leaderboard
- `GET /api/quiz/history` - Get user quiz history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce

## 🙏 Acknowledgments

- Socket.io team for real-time communication
- React team for the amazing framework
- Express.js for the web framework
- MySQL for reliable database

---

**Happy Quizzing! 🎉**
