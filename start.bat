@echo off
REM ──────────────────────────────────────────────────────────────────────────────
REM UK ma Nepali — Windows Startup Script
REM Double-click this file or run from cmd in the project root
REM ──────────────────────────────────────────────────────────────────────────────

echo.
echo   Nepal UK ma Nepali - Startup
echo   ==============================
echo.

REM Check Node.js
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo   ERROR: Node.js not found.
    echo   Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo   Node.js found. Continuing...
echo.

REM Server setup
cd server
IF NOT EXIST .env (
    copy .env.example .env
    echo   Created server\.env from example
)

echo   Installing server dependencies...
call npm install --silent

echo   Starting backend server...
start "UK ma Nepali - Backend" cmd /k "npm run dev"

cd ..\client

echo   Installing client dependencies...
call npm install --silent

echo   Starting frontend...
start "UK ma Nepali - Frontend" cmd /k "npm run dev"

cd ..

echo.
echo   Both servers starting in separate windows!
echo.
echo   Backend  --^> http://localhost:5000
echo   Frontend --^> http://localhost:5173
echo.
echo   Open http://localhost:5173 in your browser.
echo.
pause
