const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// @route GET /api/jobs - Get all jobs
router.get('/', auth, async (req, res) => {
  try {
    const { city, type, search } = req.query;
    let query = { isActive: true };
    if (city) query.location = { $regex: city, $options: 'i' };
    if (type) query.type = type;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];

    const jobs = await Job.find(query)
      .populate('postedBy', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/jobs - Create job
router.post('/', auth, async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    await job.populate('postedBy', 'name avatar');
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/jobs/:id - Get single job
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name avatar email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/jobs/:id/apply - Apply for job
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.applicants.includes(req.user._id))
      return res.status(400).json({ message: 'Already applied' });
    job.applicants.push(req.user._id);
    await job.save();
    res.json({ message: 'Applied successfully', applicantsCount: job.applicants.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/jobs/:id - Delete job
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
