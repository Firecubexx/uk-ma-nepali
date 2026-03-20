const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    coverImage: { type: String },
    content: { type: String, required: true },
    excerpt: { type: String },
    category: {
      type: String,
      enum: ['life-in-uk', 'culture', 'travel', 'food', 'career', 'education', 'news', 'health', 'other'],
      default: 'other',
    },
    tags: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate slug from title
blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
