const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Helper: generate consistent room ID from two user IDs
const getRoomId = (id1, id2) => [id1, id2].sort().join('_');

// @route GET /api/messages/conversations - Get all conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    // Get all unique conversations for current user
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('sender receiver', 'name avatar');

    // Group by conversation partner
    const conversationsMap = new Map();
    messages.forEach((msg) => {
      const partner = msg.sender._id.toString() === req.user._id.toString()
        ? msg.receiver
        : msg.sender;
      if (!conversationsMap.has(partner._id.toString())) {
        conversationsMap.set(partner._id.toString(), {
          partner,
          lastMessage: msg,
          unread: !msg.read && msg.receiver._id.toString() === req.user._id.toString() ? 1 : 0,
        });
      }
    });

    res.json(Array.from(conversationsMap.values()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/messages/:userId - Get messages with a user
router.get('/:userId', auth, async (req, res) => {
  try {
    const roomId = getRoomId(req.user._id.toString(), req.params.userId);
    const messages = await Message.find({ roomId })
      .populate('sender receiver', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { roomId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/messages/:userId - Send message
router.post('/:userId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Message text required' });

    const roomId = getRoomId(req.user._id.toString(), req.params.userId);
    const message = await Message.create({
      roomId,
      sender: req.user._id,
      receiver: req.params.userId,
      text,
    });
    await message.populate('sender receiver', 'name avatar');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
