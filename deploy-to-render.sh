#!/bin/bash

echo "🚀 Deploying TerminalX Backend to Render"
echo "========================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No Git remote found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/terminalx.git"
    echo "   git push -u origin main"
    exit 1
fi

echo "✅ Git repository ready"
echo ""

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy to Render - $(date)"
git push origin main

echo ""
echo "🎉 Code pushed to GitHub!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://render.com"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Connect your GitHub repository"
echo "5. Configure:"
echo "   - Name: terminalx-backend"
echo "   - Environment: Python 3"
echo "   - Root Directory: backend"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: python run.py"
echo "6. Add Environment Variables:"
echo "   - HOST = 0.0.0.0"
echo "   - PORT = 8000"
echo "   - DEBUG = false"
echo "7. Click 'Create Web Service'"
echo ""
echo "🔗 Your backend will be available at: https://terminalx-backend.onrender.com"
echo "📚 API Documentation: https://terminalx-backend.onrender.com/docs"
echo "🏥 Health Check: https://terminalx-backend.onrender.com/api/health"
