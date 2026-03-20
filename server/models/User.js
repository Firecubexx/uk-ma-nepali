const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 300 },
    location: { type: String, default: '' }, // UK city
    hometown: { type: String, default: '' }, // Nepal district
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    age: { type: Number },
    occupation: { type: String, default: '' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Dating-specific
    datingActive: { type: Boolean, default: false },
    interestedIn: { type: String, enum: ['male', 'female', 'both', ''], default: '' },
    swipedRight: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    swipedLeft: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
