const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  isOpen: { type: Boolean, default: false },
  resultsPublished: { type: Boolean, default: false },
  startTime: { type: Date },
  endTime: { type: Date },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Election', electionSchema);
