#!/bin/bash

echo "🚀 Quiz Platform - Quick Setup Script"
echo ""

echo "📦 Step 1: Installing Backend Dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed!"
    exit 1
fi

echo "⚙️  Step 2: Setting up Backend environment..."
if [ ! -f .env ]; then
    cp config/.env.example .env
    echo "✅ Created backend/.env from .env.example"
    echo "⚠️  Please edit backend/.env and set your MySQL password!"
else
    echo "ℹ️  backend/.env already exists, skipping..."
fi

echo "📦 Step 3: Installing Frontend Dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed!"
    exit 1
fi

echo "⚙️  Step 4: Setting up Frontend environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created frontend/.env from .env.example"
else
    echo "ℹ️  frontend/.env already exists, skipping..."
fi

echo "✅ Installation Complete!"
echo ""
cd ..
echo "📋 Next Steps:"
echo "1. Install MySQL and create database 'quiz_platform'"
echo "2. Edit backend/.env with your MySQL password"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm start"
echo ""
echo "📖 For detailed instructions, see SETUP-GUIDE.md"
