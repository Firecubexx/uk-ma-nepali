const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },

    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 300 },
    location: { type: String, default: '' },
    hometown: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    age: { type: Number },
    occupation: { type: String, default: '' },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ❤️ Dating
    datingActive: { type: Boolean, default: false },
    interestedIn: { type: String, enum: ['male', 'female', 'both', ''], default: '' },
    swipedRight: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    swipedLeft: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // 🔥 STEP 1 ADD THESE (OTP SYSTEM)
    otp: { type: String },
    otpExpire: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔐 Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 🔐 Compare password
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);