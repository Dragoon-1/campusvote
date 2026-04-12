const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  collegeId: { type: String, unique: true, sparse: true },
  username: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['root', 'admin', 'voter', 'nominal'], required: true },
  department: { type: String },
  year: { type: String },
  hasVoted: {
    GS: { type: Boolean, default: false },
    VGS: { type: Boolean, default: false },
    // clubs stored as { clubId: { president: bool, vicePresident: bool, secretary: bool, treasurer: bool } }
    clubs: { type: Map, of: new mongoose.Schema({
      president: { type: Boolean, default: false },
      vicePresident: { type: Boolean, default: false },
      secretary: { type: Boolean, default: false },
      treasurer: { type: Boolean, default: false }
    }, { _id: false }) }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
