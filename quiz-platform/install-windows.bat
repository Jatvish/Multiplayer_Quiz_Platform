@echo off
echo Quiz Platform - Quick Setup Script
echo.

echo Step 1: Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Backend installation failed!
    pause
    exit /b 1
)

echo Step 2: Setting up Backend environment...
if not exist .env (
    copy config\.env.example .env
    echo Created backend\.env from .env.example
    echo Please edit backend\.env and set your MySQL password!
) else (
    echo backend\.env already exists, skipping...
)

echo Step 3: Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Frontend installation failed!
    pause
    exit /b 1
)

echo Step 4: Setting up Frontend environment...
if not exist .env (
    copy .env.example .env
    echo Created frontend\.env from .env.example
) else (
    echo frontend\.env already exists, skipping...
)

echo Installation Complete!
echo.
cd ..
echo Next Steps:
echo 1. Install MySQL and create database 'quiz_platform'
echo 2. Edit backend\.env with your MySQL password
echo 3. Start backend: cd backend ^&^& npm run dev
echo 4. Start frontend: cd frontend ^&^& npm start
echo.
echo For detailed instructions, see SETUP-GUIDE.md
pause
