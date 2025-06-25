@echo off
echo 🚀 Quiz Platform - Quick Setup Script
echo.

echo 📦 Step 1: Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend installation failed!
    pause
    exit /b 1
)

echo 📦 Step 2: Installing Frontend Dependencies...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend installation failed!
    pause
    exit /b 1
)

echo ✅ Installation Complete!
echo.
echo 📋 Next Steps:
echo 1. Install MySQL and create database 'quiz_platform'
echo 2. Copy backend/config/.env.example to backend/.env
echo 3. Edit .env file with your database credentials
echo 4. Start backend: cd backend && npm run dev
echo 5. Start frontend: cd frontend && npm start
echo.
echo 📖 For detailed instructions, see SETUP-GUIDE.md
pause
