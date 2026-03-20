const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔐 Generate token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });

// ======================
// 🔐 REGISTER
// ======================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, location, gender, age } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, password required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      location,
      gender,
      age,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        gender: user.gender,
        age: user.age,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ======================
// 🔐 LOGIN
// ======================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        gender: user.gender,
        age: user.age,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ======================
// 🔐 GET CURRENT USER (FIX)
// ======================
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    );

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);

  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;