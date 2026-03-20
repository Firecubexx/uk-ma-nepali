const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    media: { type: String }, // image URL
    text: { type: String },
    backgroundColor: { type: String, default: '#FF6B35' },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24 hours
  },
  { timestamps: true }
);

// Auto-delete expired stories
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Story', storySchema);
