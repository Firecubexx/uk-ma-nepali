const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ['full-time', 'part-time', 'contract', 'temporary', 'zero-hours'], default: 'full-time' },
    salary: { type: String },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    contactEmail: { type: String },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
