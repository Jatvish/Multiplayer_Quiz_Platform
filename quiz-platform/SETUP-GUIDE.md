
# 🚀 Complete Setup Guide - Multiplayer Quiz Platform

This guide will walk you through setting up and running the multiplayer quiz platform step by step, even if you're a complete beginner!

## 📋 Table of Contents
1. [Prerequisites Installation](#prerequisites-installation)
2. [Project Setup](#project-setup)
3. [Database Configuration](#database-configuration)
4. [Running the Application](#running-the-application)
5. [Testing the Application](#testing-the-application)
6. [Deployment Guide](#deployment-guide)
7. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites Installation

### Step 1.1: Install Node.js
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (recommended for most users)
3. Run the installer and follow the installation wizard
4. Verify installation by opening terminal/command prompt and running:
   ```bash
   node --version
   npm --version
   ```

### Step 1.2: Install MySQL
1. Go to [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
2. Download **MySQL Community Server**
3. During installation:
   - Choose "Developer Default" setup type
   - Set a **root password** (remember this!)
   - Choose "Legacy Authentication Method"
4. Verify installation by running:
   ```bash
   mysql --version
   ```

### Step 1.3: Install Git (Optional but recommended)
1. Go to [git-scm.com](https://git-scm.com/)
2. Download and install Git
3. Verify installation:
   ```bash
   git --version
   ```

### Step 1.4: Choose a Code Editor
We recommend **Visual Studio Code**:
1. Go to [code.visualstudio.com](https://code.visualstudio.com/)
2. Download and install VS Code
3. Install useful extensions:
   - JavaScript (ES6) code snippets
   - React snippets
   - MySQL (for database management)

---

## 2. Project Setup

### Step 2.1: Extract the Project
1. Extract the provided zip file to your desired location
2. You should see a folder structure like this:
   ```
   quiz-platform/
   ├── backend/
   ├── frontend/
   ├── docker-compose.yml
   └── README.md
   ```

### Step 2.2: Navigate to Project Directory
Open terminal/command prompt and navigate to your project:
```bash
cd path/to/quiz-platform
```

### Step 2.3: Setup Backend
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment file
cp config/.env.example .env
```

### Step 2.4: Setup Frontend
Open a **new terminal window** and run:
```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install
```

---

## 3. Database Configuration

### Step 3.1: Start MySQL Server
**Windows:**
- MySQL should start automatically after installation
- If not, open "Services" and start "MySQL80" service

**macOS:**
- Open System Preferences > MySQL
- Click "Start MySQL Server"

**Linux:**
```bash
sudo service mysql start
```

### Step 3.2: Create Database
1. Open terminal and connect to MySQL:
   ```bash
   mysql -u root -p
   ```
2. Enter your root password when prompted
3. Create the database:
   ```sql
   CREATE DATABASE quiz_platform;
   USE quiz_platform;
   exit;
   ```

### Step 3.3: Configure Environment Variables
Edit the `.env` file in the `backend` folder:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=1d

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=quiz_platform
DB_PORT=3306
```

**Important:** Replace `your_mysql_password_here` with your actual MySQL root password!

---

## 4. Running the Application

### Step 4.1: Start the Backend Server
In the terminal where you're in the `backend` folder:
```bash
npm run dev
```

You should see:
- "Server running on port 5000"
- "Database connection established successfully"
- "Database tables created successfully"

If you see errors, check the [Troubleshooting](#troubleshooting) section.

### Step 4.2: Start the Frontend Application
In the **second terminal** where you're in the `frontend` folder:
```bash
npm start
```

This will:
- Start the React development server
- Automatically open http://localhost:3000 in your browser

### Step 4.3: Verify Everything is Working
You should see:
- Backend running on http://localhost:5000
- Frontend running on http://localhost:3000
- A login/register page when you visit the frontend

---

## 5. Testing the Application

### Step 5.1: Create User Accounts
1. Visit http://localhost:3000
2. Click "Register here"
3. Create at least 2 user accounts:
   - Username: player1, Email: player1@test.com, Password: test123
   - Username: player2, Email: player2@test.com, Password: test123

### Step 5.2: Test Room Creation
1. Login with player1
2. Click "Create New Quiz Room"
3. Click "Create Room"
4. Note the room code (e.g., ABC123)

### Step 5.3: Test Joining Room
1. Open a new browser window/tab
2. Go to http://localhost:3000
3. Login with player2
4. Click "Join Existing Room"
5. Enter the room code from Step 5.2
6. You should see both players in the room

### Step 5.4: Test Quiz Gameplay
1. As player1 (host), click "Start Quiz"
2. Both players should see the first question
3. Select answers quickly (you have 30 seconds)
4. Check the leaderboard updates
5. Continue through all 5 questions

---

## 6. Deployment Guide

### Option 1: Free Hosting (Recommended for Beginners)

#### Frontend Deployment (Netlify)
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Go to [netlify.com](https://netlify.com) and sign up
3. Drag and drop the `build` folder to deploy
4. Note your site URL (e.g., https://amazing-quiz-app.netlify.app)

#### Backend Deployment (Railway)
1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" > "Deploy from GitHub repo"
3. Connect your GitHub account and select your repository
4. Choose the backend folder
5. Add environment variables in Railway dashboard
6. Note your backend URL (e.g., https://quiz-backend.railway.app)

#### Database (Railway MySQL)
1. In Railway project, click "New" > "Database" > "MySQL"
2. Copy the connection details to your backend environment variables
3. The database will be created automatically

### Option 2: Docker Deployment
If you have Docker installed:
```bash
# From project root
docker-compose up -d
```

This will start everything automatically!

---

## 7. Troubleshooting

### Common Issues and Solutions

#### Issue: "Cannot connect to database"
**Solution:**
1. Check if MySQL is running: `brew services start mysql` (macOS) or start MySQL service (Windows)
2. Verify credentials in `.env` file
3. Try creating database manually: `mysql -u root -p`, then `CREATE DATABASE quiz_platform;`

#### Issue: "Port 3000 is already in use"
**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000
```

#### Issue: "npm install fails"
**Solution:**
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again

#### Issue: "Cannot find module" errors
**Solution:**
1. Make sure you're in the correct directory (`backend` or `frontend`)
2. Run `npm install` again
3. Check if the file path is correct

#### Issue: Socket connection fails
**Solution:**
1. Check if backend is running on port 5000
2. Verify CORS settings in backend
3. Check browser console for specific error messages

#### Issue: Questions don't load
**Solution:**
1. Check if database schema was created properly
2. Verify sample data was inserted
3. Check backend logs for SQL errors

### Getting Help

If you're still having issues:

1. **Check the console logs:**
   - Backend: Look at terminal where backend is running
   - Frontend: Press F12 in browser, check Console tab

2. **Common file locations:**
   - Backend logs: Terminal where you ran `npm run dev`
   - Database issues: Check `.env` file configuration
   - Frontend issues: Browser Developer Tools (F12)

3. **Reset everything:**
   ```bash
   # Stop all servers (Ctrl+C in terminals)
   # Clear database
   mysql -u root -p
   DROP DATABASE quiz_platform;
   CREATE DATABASE quiz_platform;
   exit;

   # Restart backend
   cd backend
   npm run dev
   ```

### Success Checklist ✅

Before deployment, make sure:
- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] User registration works
- [ ] User login works
- [ ] Room creation works
- [ ] Room joining works
- [ ] Quiz starts properly
- [ ] Questions display correctly
- [ ] Answers can be submitted
- [ ] Leaderboard updates
- [ ] Quiz completes successfully

---

## 🎉 Congratulations!

You now have a fully functional multiplayer quiz platform! 

### Next Steps:
1. **Customize questions:** Add your own questions to the database
2. **Styling:** Modify CSS to match your brand
3. **Features:** Add more question types, categories, or game modes
4. **Deploy:** Share your app with friends!

### Learning Resources:
- [React Documentation](https://reactjs.org/docs)
- [Node.js Guides](https://nodejs.org/en/docs/guides/)
- [MySQL Tutorial](https://dev.mysql.com/doc/mysql-tutorial-excerpt/8.0/en/)
- [Socket.io Documentation](https://socket.io/docs/v4/)

**Happy Coding! 🚀**
