# 🇳🇵🇬🇧 UK ma Nepali

A full-stack social platform for Nepali people living in the United Kingdom.

## ✨ Features

| Module | Description |
|--------|-------------|
| 🔐 Auth | Email/password login with JWT |
| 👤 Profiles | Photo, bio, UK city, Nepal hometown |
| 📰 Feed | Posts with text + images, likes, comments |
| 💼 Jobs | Post and apply for jobs across the UK |
| 🏠 Rooms | Room/flat listings with filters |
| 💘 Dating | Tinder-style swipe & match system |
| ✍️ Blogs | Write and read community articles |
| 📖 Stories | 24-hour ephemeral stories |
| 💬 Chat | Real-time 1-to-1 messaging via Socket.io |
| 🌙 Dark Mode | Full dark/light theme toggle |

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Socket.io Client  
**Backend:** Node.js, Express, Socket.io  
**Database:** MongoDB with Mongoose  
**Auth:** JWT + bcrypt  
**File uploads:** Multer (local disk)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:
- [Node.js](https://nodejs.org/) v16 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port 27017
- npm (comes with Node.js)

### Step 1 — Clone and open the project

```bash
# If you downloaded the zip, just unzip it
# Then open a terminal in the uk-ma-nepali folder
cd uk-ma-nepali
```

### Step 2 — Install backend dependencies

```bash
cd server
npm install
```

### Step 3 — Configure the backend environment

```bash
# Copy the example .env file
cp .env.example .env
```

Open `server/.env` in any text editor. It looks like this:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/uk-ma-nepali
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLIENT_URL=http://localhost:5173
```

- **MONGO_URI**: If MongoDB is running locally, the default value works fine.
- **JWT_SECRET**: Change this to a long random string in production.
- **CLIENT_URL**: Leave as-is for local development.

### Step 4 — Start the backend server

```bash
# Make sure you are inside the server/ folder
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

### Step 5 — Install frontend dependencies (new terminal)

Open a **new terminal window**, then:

```bash
cd uk-ma-nepali/client
npm install
```

### Step 6 — Start the frontend

```bash
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 7 — Open the app

Visit **http://localhost:5173** in your browser.

Click **"Join the community"** to create an account, then explore all the features!

---

## 📁 Project Structure

```
uk-ma-nepali/
├── server/                   # Node.js + Express backend
│   ├── index.js              # Entry point + Socket.io
│   ├── .env.example          # Environment variable template
│   ├── models/
│   │   ├── User.js           # User schema (auth + dating)
│   │   ├── Post.js           # Posts with likes & comments
│   │   ├── Job.js            # Job listings
│   │   ├── Room.js           # Room/accommodation listings
│   │   ├── Blog.js           # Blog articles
│   │   ├── Story.js          # 24-hour stories
│   │   └── Message.js        # Chat messages
│   ├── routes/
│   │   ├── auth.js           # Register, login, /me
│   │   ├── users.js          # Profile, follow, avatar, search
│   │   ├── posts.js          # CRUD, like, comment
│   │   ├── jobs.js           # CRUD, apply
│   │   ├── rooms.js          # CRUD with image upload
│   │   ├── dating.js         # Profiles, swipe, matches
│   │   ├── blogs.js          # CRUD, like
│   │   ├── stories.js        # CRUD, view tracking
│   │   └── messages.js       # Conversations, send/receive
│   ├── middleware/
│   │   ├── auth.js           # JWT verification middleware
│   │   └── upload.js         # Multer file upload config
│   └── uploads/              # Uploaded files (auto-created)
│
└── client/                   # React + Vite frontend
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx            # Routes + providers
        ├── main.jsx
        ├── index.css          # Tailwind + custom animations
        ├── context/
        │   ├── AuthContext.jsx    # User auth state
        │   ├── ThemeContext.jsx   # Dark/light mode
        │   └── SocketContext.jsx  # Socket.io connection
        ├── utils/
        │   └── api.js            # Axios instance with JWT
        ├── components/
        │   ├── common/
        │   │   ├── Layout.jsx    # Sidebar + topbar
        │   │   ├── Avatar.jsx    # Reusable avatar with fallback
        │   │   └── UI.jsx        # Spinner, Modal, EmptyState
        │   ├── feed/
        │   │   ├── PostCard.jsx  # Post with like/comment/share
        │   │   └── CreatePost.jsx
        │   └── stories/
        │       └── StoriesBar.jsx # Story creation + viewer
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── FeedPage.jsx
            ├── JobsPage.jsx
            ├── RoomsPage.jsx
            ├── DatingPage.jsx
            ├── BlogsPage.jsx
            ├── BlogDetailPage.jsx
            ├── ChatPage.jsx
            └── ProfilePage.jsx
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get feed (paginated) |
| POST | `/api/posts` | Create post (with images) |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/:id/like` | Like/unlike |
| POST | `/api/posts/:id/comment` | Add comment |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/avatar` | Upload avatar |
| POST | `/api/users/:id/follow` | Follow/unfollow |
| GET | `/api/users/search/query?q=` | Search users |

### Jobs, Rooms, Blogs, Stories, Dating, Messages
All follow standard REST patterns — see route files for full details.

---

## 🌐 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `userOnline` | Client → Server | User comes online |
| `joinRoom` | Client → Server | Join a chat room |
| `sendMessage` | Client → Server | Send a message |
| `newMessage` | Server → Client | Receive a message |
| `typing` | Client → Server | Typing indicator |
| `userTyping` | Server → Client | Typing notification |
| `onlineUsers` | Server → Client | List of online users |

---

## 🛡️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGO_URI` | `mongodb://localhost:27017/uk-ma-nepali` | MongoDB connection |
| `JWT_SECRET` | — | **Change this!** Secret for JWT signing |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |

---

## 🐛 Common Issues

**MongoDB not connecting?**
- Make sure MongoDB is running: `mongod` or start the MongoDB service
- Check your `MONGO_URI` in `.env`

**Port already in use?**
- Change `PORT` in `server/.env` to another number (e.g. 5001)
- Update the Vite proxy in `client/vite.config.js` to match

**Images not loading?**
- Make sure the backend is running — images are served from `http://localhost:5000/uploads/`

**Socket.io not connecting?**
- Both frontend and backend must be running simultaneously

---

## 🚀 Deploying to Production

1. **Database**: Use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier available)
2. **Backend**: Deploy to [Railway](https://railway.app), [Render](https://render.com), or [Heroku](https://heroku.com)
3. **Frontend**: Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
4. **File uploads**: For production, replace Multer with [Cloudinary](https://cloudinary.com) or AWS S3

---

## 💡 Tips

- Register multiple accounts to test follow, dating swipe, and chat features
- Enable the dating profile in Settings on the Dating page to see profiles
- Stories expire automatically after 24 hours (MongoDB TTL index)
- The app is fully responsive — try it on mobile too!

---

Built with ❤️ for the UK Nepali community 🇳🇵🇬🇧
