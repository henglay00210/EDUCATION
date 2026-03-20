@echo off
REM Education App Backend - Quick Start Script for Windows

echo.
echo ================================================
echo   Education App Backend - Quick Start (Windows)
echo ================================================
echo.

cd education-backend

echo [1/3] Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ npm is installed

echo.
echo [2/3] Installing dependencies...
call npm install >nul 2>&1
echo ✅ Dependencies installed

echo.
echo [3/3] Starting server...
echo.
echo ================================================
echo   🚀 Backend Server Starting...
echo ================================================
echo.
echo 📍 Server URL: http://localhost:5000
echo 📊 Health Check: http://localhost:5000/api/health
echo 🗄️  Database: MongoDB (local or Atlas)
echo.
echo ⚠️  IMPORTANT:
echo   • Make sure MongoDB is running!
echo   • Update Flutter app to use: http://localhost:5000/api
echo   • To seed data, run: node seed.js (in another terminal)
echo.
echo Press Ctrl+C to stop the server
echo.
echo ================================================
echo.

call npm run dev

pause
