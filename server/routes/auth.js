const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// 🔐 Generate token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });

// 🔢 Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ======================
// 🔐 REGISTER (SEND OTP)
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

    const otp = generateOTP();
    console.log("OTP for", email, "is:", otp);

    const user = await User.create({
      name, email, password, location, gender, age,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000,
      isVerified: false,
    });

    await sendEmail(email, 'Your OTP Code', `Your OTP is: ${otp}`);
    res.json({ message: 'OTP sent to your email', email });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ======================
// 🔐 VERIFY OTP (AUTO LOGIN)
// ======================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
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

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify OTP first' });
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
    res.status(500).json({ message: err.message });
  }
});

// ======================
// 🔐 GET CURRENT USER
// ======================
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).select('-password');

    res.json(user);

  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// ======================
// 🔁 RESEND OTP
// ======================
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log("🔁 NEW OTP:", otp);
    await sendEmail(email, 'Your OTP Code', `Your OTP is: ${otp}`);

    res.json({ message: 'OTP resent successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ module.exports MUST be at the very end
module.exports = router;