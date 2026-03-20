const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route GET /api/posts - Get feed posts
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const posts = await Post.find({ visibility: 'public' })
      .populate('author', 'name avatar location')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/posts - Create post
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { text, visibility } = req.body;
    if (!text && (!req.files || req.files.length === 0))
      return res.status(400).json({ message: 'Post must have text or images' });

    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];
    const post = await Post.create({ author: req.user._id, text, images, visibility });
    await post.populate('author', 'name avatar location');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/posts/:id - Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/posts/:id/like - Like/unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const liked = post.likes.includes(req.user._id);
    if (liked) post.likes.pull(req.user._id);
    else post.likes.push(req.user._id);

    await post.save();
    res.json({ liked: !liked, likesCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/posts/:id/comment - Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user._id, text });
    await post.save();
    await post.populate('comments.user', 'name avatar');

    res.json(post.comments[post.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/posts/:id - Edit post text
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    post.text = req.body.text ?? post.text;
    await post.save();
    await post.populate('author', 'name avatar location');
    await post.populate('comments.user', 'name avatar');
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/posts/:id/comment/:commentId - Delete a comment
router.delete('/:id/comment/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user._id.toString() &&
        post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    post.comments.pull({ _id: req.params.commentId });
    await post.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/posts/user/:userId - Get user's posts
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
