const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

/**
 * Generates a simple activity feed of notifications for the current user:
 * - Likes on their posts
 * - Comments on their posts
 * - New followers
 *
 * For a production app you'd store these in a dedicated Notification model
 * and push them via Socket.io. This implementation derives them on-the-fly
 * from existing data so no extra schema is needed for the MVP.
 */
router.get('/', auth, async (req, res) => {
  try {
    const notifications = [];

    // 1. Likes & comments on the current user's posts (last 30 days)
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const myPosts = await Post.find({ author: req.user._id, createdAt: { $gte: since } })
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    for (const post of myPosts) {
      // Most recent liker (skip self-likes)
      const likers = (post.likes || []).filter(
        (l) => l._id && l._id.toString() !== req.user._id.toString()
      );
      if (likers.length > 0) {
        const latest = likers[likers.length - 1];
        notifications.push({
          type: 'like',
          message: likers.length === 1
            ? `${latest.name} liked your post`
            : `${latest.name} and ${likers.length - 1} others liked your post`,
          actor: latest,
          postId: post._id,
          excerpt: post.text?.slice(0, 60),
          createdAt: post.updatedAt || post.createdAt,
        });
      }

      // Each comment (skip self-comments)
      for (const c of [...(post.comments || [])].reverse().slice(0, 3)) {
        if (c.user?._id?.toString() === req.user._id.toString()) continue;
        notifications.push({
          type: 'comment',
          message: `${c.user?.name} commented on your post`,
          actor: c.user,
          postId: post._id,
          excerpt: c.text?.slice(0, 60),
          createdAt: c.createdAt || post.updatedAt || post.createdAt,
        });
      }
    }

    // 2. New followers
    const me = await User.findById(req.user._id).populate('followers', 'name avatar createdAt');
    const recentFollowers = (me.followers || []).slice(-5).reverse();
    for (const f of recentFollowers) {
      notifications.push({
        type: 'follow',
        message: `${f.name} started following you`,
        actor: f,
        createdAt: f.createdAt,
      });
    }

    // Sort newest first, cap at 30
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notifications.slice(0, 30));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
