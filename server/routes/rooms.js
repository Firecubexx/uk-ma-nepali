const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route GET /api/rooms - Get all rooms
router.get('/', auth, async (req, res) => {
  try {
    const { city, type, minPrice, maxPrice } = req.query;
    let query = { isAvailable: true };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (type) query.type = type;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    const rooms = await Room.find(query)
      .populate('postedBy', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/rooms - Create room listing
router.post('/', auth, upload.array('images', 8), async (req, res) => {
  try {
    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];
    const room = await Room.create({ ...req.body, images, postedBy: req.user._id });
    await room.populate('postedBy', 'name avatar');
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/rooms/:id - Get single room
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('postedBy', 'name avatar email location');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/rooms/:id - Delete listing
router.delete('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await room.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
