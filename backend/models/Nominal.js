const mongoose = require('mongoose');

const nominalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  collegeId: { type: String, required: true },
  photo: { type: String },
  description: { type: String },
  postType: {
    type: String,
    enum: ['GS', 'VGS', 'president', 'vicePresident', 'secretary', 'treasurer'],
    required: true
  },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', default: null },
  // null for GS/VGS, clubId for club posts
  voteCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Nominal', nominalSchema);
