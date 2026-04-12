const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Election = require('../models/Election');
const Nominal = require('../models/Nominal');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('root'));

// Get all admins
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.json(admins);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add admin
router.post('/admins', async (req, res) => {
  try {
    const { name, collegeId, email, password, department } = req.body;
    const admin = await User.create({ name, collegeId, email, password, role: 'admin', department });
    res.status(201).json({ message: 'Admin created', id: admin._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Update admin
router.put('/admins/:id', async (req, res) => {
  try {
    const { name, email, department, isActive, password } = req.body;
    const update = { name, email, department, isActive };
    if (password) {
      const bcrypt = require('bcryptjs');
      update.password = await bcrypt.hash(password, 10);
    }
    await User.findByIdAndUpdate(req.params.id, update);
    res.json({ message: 'Admin updated' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Delete admin
router.delete('/admins/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Election control
router.get('/election', async (req, res) => {
  try {
    let election = await Election.findOne();
    if (!election) election = await Election.create({});
    res.json(election);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/election', async (req, res) => {
  try {
    const { isOpen, resultsPublished, startTime, endTime } = req.body;
    let election = await Election.findOne();
    if (!election) election = new Election();
    Object.assign(election, { isOpen, resultsPublished, startTime, endTime, updatedAt: new Date() });
    await election.save();
    res.json({ message: 'Election updated', election });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Stats overview
router.get('/stats', async (req, res) => {
  try {
    const totalVoters = await User.countDocuments({ role: { $in: ['voter', 'nominal'] } });
    const votedGS = await User.countDocuments({ 'hasVoted.GS': true });
    const admins = await User.countDocuments({ role: 'admin' });
    const nominals = await Nominal.countDocuments({ isActive: true });
    res.json({ totalVoters, votedGS, admins, nominals });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get results (with vote counts)
router.get('/results', async (req, res) => {
  try {
    const nominals = await Nominal.find({ isActive: true }).populate('clubId', 'name');
    res.json(nominals);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
