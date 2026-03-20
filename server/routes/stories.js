const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route GET /api/stories - Get all active stories
router.get('/', auth, async (req, res) => {
  try {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/stories - Create story
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const { text, backgroundColor } = req.body;
    const media = req.file ? `/uploads/${req.file.filename}` : '';
    if (!media && !text)
      return res.status(400).json({ message: 'Story must have media or text' });

    const story = await Story.create({
      author: req.user._id,
      media,
      text,
      backgroundColor: backgroundColor || '#FF6B35',
    });
    await story.populate('author', 'name avatar');
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/stories/:id/view - Mark story as viewed
router.post('/:id/view', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (!story.viewers.includes(req.user._id)) {
      story.viewers.push(req.user._id);
      await story.save();
    }
    res.json({ viewsCount: story.viewers.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/stories/:id - Delete story
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await story.deleteOne();
    res.json({ message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
