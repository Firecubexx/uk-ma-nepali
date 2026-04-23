const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, location, gender, age } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email, password required' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const otp = generateOTP();
    const otpExpire = Date.now() + 10 * 60 * 1000;
    let user;
    let createdUser = false;

    console.log('OTP for', normalizedEmail, 'is:', otp);

    if (existingUser) {
      existingUser.name = name;
      existingUser.email = normalizedEmail;
      existingUser.password = password;
      existingUser.location = location;
      existingUser.gender = gender;
      existingUser.age = age;
      existingUser.otp = otp;
      existingUser.otpExpire = otpExpire;
      existingUser.isVerified = false;
      user = await existingUser.save();
    } else {
      user = await User.create({
        name,
        email: normalizedEmail,
        password,
        location,
        gender,
        age,
        otp,
        otpExpire,
        isVerified: false,
      });
      createdUser = true;
    }

    try {
      await sendEmail(normalizedEmail, 'Your OTP Code', `Your OTP is: ${otp}`);
    } catch (emailError) {
      if (createdUser) {
        await User.findByIdAndDelete(user._id);
      }

      return res.status(502).json({
        message: emailError.message || 'Failed to send OTP email. Please try again.',
      });
    }

    res.json({ message: 'OTP sent to your email', email: normalizedEmail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

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

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

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

router.post('/resend-otp', async (req, res) => {
  try {
    const normalizedEmail = req.body.email?.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

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

    console.log('New OTP for', normalizedEmail, 'is:', otp);
    await sendEmail(normalizedEmail, 'Your OTP Code', `Your OTP is: ${otp}`);

    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
