const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    postcode: { type: String },
    price: { type: Number, required: true }, // per month
    billsIncluded: { type: Boolean, default: false },
    type: { type: String, enum: ['single-room', 'double-room', 'studio', 'flat', 'house-share', 'en-suite'], default: 'single-room' },
    available: { type: Date },
    images: [{ type: String }],
    amenities: [{ type: String }], // e.g. ['WiFi', 'Parking', 'Garden']
    preferredTenant: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
    contactNumber: { type: String },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
