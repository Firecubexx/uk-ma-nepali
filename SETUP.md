# 🚀 Quick Setup Guide

## 1. Prerequisites

| Tool | Version | Download |
|------|---------|---------|
| Node.js | v16+ | https://nodejs.org |
| MongoDB | v6+ | https://www.mongodb.com/try/download/community |
| npm | v8+ | Comes with Node.js |

---

## 2. Install & Configure

```bash
# Install server dependencies
cd server
npm install
cp .env.example .env     # creates your config file

# Install client dependencies
cd ../client
npm install
```

Open `server/.env` and verify:
```
MONGO_URI=mongodb://localhost:27017/uk-ma-nepali
JWT_SECRET=change-this-to-a-long-random-secret
```

---

## 3. Start MongoDB

**Mac/Linux:**
```bash
mongod
```

**Windows:**
```bash
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

Or use **MongoDB Compass** (GUI) to start it visually.

---

## 4. Run the App

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# ✅ MongoDB connected
# 🚀 Server running on port 5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# ➜ Local: http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## 5. Seed Demo Data (Optional)

To populate with realistic Nepali community data:

```bash
cd server
npm run seed
```

This creates **8 demo users** (all with password `demo1234`):

| Email | Name | City |
|-------|------|------|
| aarav@demo.com | Aarav Sharma | London |
| sita@demo.com | Sita Thapa | Manchester |
| bikash@demo.com | Bikash Rai | Birmingham |
| priya@demo.com | Priya Gurung | Leeds |
| rohan@demo.com | Rohan Magar | Glasgow |
| anita@demo.com | Anita Koirala | Edinburgh |
| dipesh@demo.com | Dipesh Bhattarai | Bristol |
| kamala@demo.com | Kamala Limbu | Cardiff |

---

## 6. One-Click Start (Alternative)

**Mac/Linux:**
```bash
bash start.sh
```

**Windows:**
```
Double-click start.bat
```

---

## 7. Troubleshooting

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED` on port 27017 | MongoDB is not running — start it first |
| `Port 5000 in use` | Change `PORT=5001` in `server/.env` and update `vite.config.js` proxy |
| `Cannot find module` | Run `npm install` inside both `server/` and `client/` |
| Images not showing | Make sure backend is running (serves `/uploads`) |
| Socket not connecting | Both frontend AND backend must run simultaneously |
| Login fails after seed | Use exactly `demo1234` as the password |

---

## 8. API Base URL

All API calls go to `http://localhost:5000/api/`

The Vite dev server proxies `/api/*` and `/uploads/*` to the backend automatically — no CORS issues in development.

---

## 9. Folder Overview

```
uk-ma-nepali/
├── server/          ← Node.js + Express + Socket.io
│   ├── models/      ← MongoDB schemas (7 models)
│   ├── routes/      ← REST API endpoints (10 route files)
│   ├── middleware/  ← JWT auth + Multer upload
│   ├── seed.js      ← Demo data seeder
│   └── index.js     ← Entry point
│
├── client/          ← React 18 + Vite + Tailwind CSS
│   └── src/
│       ├── pages/       ← 12 page components
│       ├── components/  ← Reusable UI components
│       ├── context/     ← Auth, Theme, Socket providers
│       ├── hooks/       ← Custom React hooks
│       └── utils/       ← API client + helpers
│
├── start.sh         ← Mac/Linux one-click start
├── start.bat        ← Windows one-click start
└── README.md        ← Full documentation
```
