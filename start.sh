#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# UK ma Nepali — Start Script
# Run this from the project root: bash start.sh
# ──────────────────────────────────────────────────────────────────────────────

set -e

echo ""
echo "  🇳🇵  UK ma Nepali — Startup"
echo "  ══════════════════════════════"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "  ❌ Node.js not found. Install from https://nodejs.org/"
  exit 1
fi

echo "  ✅ Node.js $(node -v) found"

# Check MongoDB
if ! command -v mongod &> /dev/null && ! pgrep -x "mongod" > /dev/null; then
  echo ""
  echo "  ⚠️  MongoDB does not appear to be running."
  echo "  Please start MongoDB first: mongod"
  echo "  Or install it: https://www.mongodb.com/try/download/community"
  echo ""
  read -p "  Press Enter to continue anyway, or Ctrl+C to exit..."
fi

# Server setup
echo ""
echo "  📦 Installing server dependencies..."
cd server
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  ✅ Created server/.env from example"
fi
npm install --silent
cd ..

# Client setup
echo "  📦 Installing client dependencies..."
cd client
npm install --silent
cd ..

echo ""
echo "  🚀 Starting UK ma Nepali..."
echo ""
echo "  Backend  → http://localhost:5000"
echo "  Frontend → http://localhost:5173"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo ""

# Start both in parallel
(cd server && npm run dev) &
SERVER_PID=$!

sleep 2

(cd client && npm run dev) &
CLIENT_PID=$!

# Trap Ctrl+C
trap "echo ''; echo '  👋 Shutting down...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT

wait
