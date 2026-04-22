const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['notice', 'update', 'result'], default: 'notice' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postedByName: { type: String },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', noticeSchema);
