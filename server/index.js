const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/dating', require('./routes/dating'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UK ma Nepali API is running!' });
});

// Socket.io for real-time chat
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('userOnline', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.roomId).emit('newMessage', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('userTyping', data);
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) onlineUsers.delete(key);
    });
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });
});

// ✅ MongoDB Atlas Connection
const PORT = 5000;

mongoose
  .connect("mongodb+srv://uttamwolisharma_db_user:Passwards1@ukmanepali.juvjgqe.mongodb.net/ukmanepali?retryWrites=true&w=majority")
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});