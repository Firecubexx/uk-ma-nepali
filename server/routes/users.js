const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route PUT /api/users/password - Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword; // pre-save hook will hash it
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/users/account - Delete account
router.delete('/account', auth, async (req, res) => {
  try {
    const Post    = require('../models/Post');
    const Message = require('../models/Message');
    const Story   = require('../models/Story');
    // Delete all user content
    await Promise.all([
      Post.deleteMany({ author: req.user._id }),
      Message.deleteMany({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] }),
      Story.deleteMany({ author: req.user._id }),
      User.findByIdAndDelete(req.user._id),
    ]);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/users/:id - Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('followers following', 'name avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/users/profile - Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, location, hometown, occupation, gender, age, datingActive, interestedIn } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, location, hometown, occupation, gender, age, datingActive, interestedIn },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/users/avatar - Upload avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true }).select('-password');
    res.json({ avatar: user.avatar, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/users/:id/follow - Follow/unfollow user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot follow yourself' });

    const target = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const isFollowing = target.followers.includes(req.user._id);

    if (isFollowing) {
      // Unfollow
      target.followers.pull(req.user._id);
      currentUser.following.pull(req.params.id);
    } else {
      // Follow
      target.followers.push(req.user._id);
      currentUser.following.push(req.params.id);
    }

    await target.save();
    await currentUser.save();

    res.json({ following: !isFollowing, followersCount: target.followers.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/users/search?q= - Search users
router.get('/search/query', auth, async (req, res) => {
  try {
    const { q } = req.query;
    // If no query, return recently joined users (for suggestions)
    const filter = q && q.trim()
      ? {
          $or: [
            { name: { $regex: q.trim(), $options: 'i' } },
            { location: { $regex: q.trim(), $options: 'i' } },
          ],
          _id: { $ne: req.user._id },
        }
      : { _id: { $ne: req.user._id } };
    const users = await User.find(filter)
      .select('name avatar location bio')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

// @route POST /api/users/:id/block - Block a user
router.post('/:id/block', auth, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot block yourself' });

    // Add blocked field to User model dynamically (or just track in memory for MVP)
    const me = await User.findById(req.user._id);
    if (!me.blocked) me.blocked = [];
    
    const alreadyBlocked = me.blocked.includes(req.params.id);
    if (alreadyBlocked) {
      me.blocked.pull(req.params.id);
    } else {
      me.blocked.push(req.params.id);
      // Also remove follow relationship
      me.following.pull(req.params.id);
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
    }
    
    await me.save();
    res.json({ blocked: !alreadyBlocked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
