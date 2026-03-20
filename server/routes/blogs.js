const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route GET /api/blogs - Get all blogs
router.get('/', auth, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { published: true };
    if (category) query.category = category;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];

    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
      .select('-content')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/blogs - Create blog
router.post('/', auth, upload.single('coverImage'), async (req, res) => {
  try {
    const coverImage = req.file ? `/uploads/${req.file.filename}` : '';
    const { title, content, category, tags, excerpt } = req.body;
    const blog = await Blog.create({
      author: req.user._id,
      title,
      content,
      category,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      excerpt: excerpt || content.substring(0, 150) + '...',
      coverImage,
    });
    await blog.populate('author', 'name avatar');
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/blogs/:id - Get single blog
router.get('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name avatar bio');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    blog.views += 1;
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/blogs/:id/like - Like/unlike blog
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    const liked = blog.likes.includes(req.user._id);
    if (liked) blog.likes.pull(req.user._id);
    else blog.likes.push(req.user._id);
    await blog.save();
    res.json({ liked: !liked, likesCount: blog.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/blogs/:id - Delete blog
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (blog.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await blog.deleteOne();
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
