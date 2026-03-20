const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route GET /api/dating/profiles - Get potential matches
router.get('/profiles', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const excludeIds = [
      req.user._id,
      ...currentUser.swipedRight,
      ...currentUser.swipedLeft,
      ...currentUser.matches,
    ];

    let genderFilter = {};
    if (currentUser.interestedIn && currentUser.interestedIn !== 'both') {
      genderFilter = { gender: currentUser.interestedIn };
    }

    const profiles = await User.find({
      _id: { $nin: excludeIds },
      datingActive: true,
      ...genderFilter,
    })
      .select('name avatar bio location age gender occupation hometown')
      .limit(20);

    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/dating/swipe - Swipe right or left
router.post('/swipe', auth, async (req, res) => {
  try {
    const { targetId, direction } = req.body; // direction: 'right' or 'left'
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(targetId);

    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    let matched = false;

    if (direction === 'right') {
      currentUser.swipedRight.push(targetId);
      // Check if target also swiped right on current user => MATCH!
      if (targetUser.swipedRight.includes(req.user._id)) {
        currentUser.matches.push(targetId);
        targetUser.matches.push(req.user._id);
        matched = true;
        await targetUser.save();
      }
    } else {
      currentUser.swipedLeft.push(targetId);
    }

    await currentUser.save();
    res.json({ matched, message: matched ? "It's a match! 🎉" : direction === 'right' ? 'Liked!' : 'Passed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/dating/matches - Get all matches
router.get('/matches', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('matches', 'name avatar bio location age');
    res.json(user.matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
