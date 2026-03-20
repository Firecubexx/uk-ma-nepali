const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Generate JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, location, gender, age } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, location, gender, age });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, location: user.location },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        location: user.location,
        bio: user.bio,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
