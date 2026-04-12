const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Club = require('../models/Club');
const Nominal = require('../models/Nominal');
const Notice = require('../models/Notice');
const { protect, requireRole } = require('../middleware/auth');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.use(protect, requireRole('admin', 'root'));

// ---- VOTERS ----
router.get('/voters', async (req, res) => {
  try {
    const voters = await User.find({ role: { $in: ['voter', 'nominal'] } }).select('-password');
    res.json(voters);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/voters', async (req, res) => {
  try {
    const { name, collegeId, password, department, year } = req.body;
    const voter = await User.create({ name, collegeId, password, department, year, role: 'voter' });
    res.status(201).json({ message: 'Voter created', id: voter._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/voters/:id', async (req, res) => {
  try {
    const { name, department, year, isActive } = req.body;
    await User.findByIdAndUpdate(req.params.id, { name, department, year, isActive });
    res.json({ message: 'Voter updated' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/voters/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Voter deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Bulk upload voters via JSON
router.post('/voters/bulk', async (req, res) => {
  try {
    const { voters } = req.body; // [{name, collegeId, password, department, year}]
    const created = [];
    for (const v of voters) {
      try {
        const voter = await User.create({ ...v, role: 'voter' });
        created.push(voter.collegeId);
      } catch {}
    }
    res.json({ message: `${created.length} voters created`, created });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- CLUBS ----
router.get('/clubs', async (req, res) => {
  try {
    const clubs = await Club.find();
    res.json(clubs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/clubs', upload.single('logo'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const logo = req.file ? `/uploads/${req.file.filename}` : null;
    const club = await Club.create({ name, description, logo });
    res.status(201).json({ message: 'Club created', club });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/clubs/:id', upload.single('logo'), async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const update = { name, description, isActive };
    if (req.file) update.logo = `/uploads/${req.file.filename}`;
    await Club.findByIdAndUpdate(req.params.id, update);
    res.json({ message: 'Club updated' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/clubs/:id', async (req, res) => {
  try {
    await Club.findByIdAndDelete(req.params.id);
    await Nominal.deleteMany({ clubId: req.params.id });
    res.json({ message: 'Club and its nominals deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- NOMINALS ----
router.get('/nominals', async (req, res) => {
  try {
    const nominals = await Nominal.find().populate('clubId', 'name').populate('userId', 'collegeId name');
    res.json(nominals);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/nominals', upload.single('photo'), async (req, res) => {
  try {
    const { collegeId, postType, clubId, description } = req.body;
    const user = await User.findOne({ collegeId });
    if (!user) return res.status(404).json({ message: 'Student not found with this college ID' });
    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    // Make user a nominal
    await User.findByIdAndUpdate(user._id, { role: 'nominal' });
    const nominal = await Nominal.create({
      userId: user._id, name: user.name, collegeId,
      photo, description, postType,
      clubId: clubId || null
    });
    res.status(201).json({ message: 'Nominal added', nominal });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/nominals/:id', upload.single('photo'), async (req, res) => {
  try {
    const { description, postType, clubId, isActive } = req.body;
    const update = { description, postType, isActive };
    if (clubId) update.clubId = clubId;
    if (req.file) update.photo = `/uploads/${req.file.filename}`;
    await Nominal.findByIdAndUpdate(req.params.id, update);
    res.json({ message: 'Nominal updated' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/nominals/:id', async (req, res) => {
  try {
    const nominal = await Nominal.findById(req.params.id);
    if (!nominal) return res.status(404).json({ message: 'Nominal not found' });
    // Revert user to voter if no other nominals
    const otherNominals = await Nominal.countDocuments({ userId: nominal.userId, _id: { $ne: req.params.id } });
    if (otherNominals === 0) await User.findByIdAndUpdate(nominal.userId, { role: 'voter' });
    await Nominal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Nominal deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- NOTICES ----
router.get('/notices', async (req, res) => {
  try {
    const notices = await Notice.find().sort('-createdAt');
    res.json(notices);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/notices', async (req, res) => {
  try {
    const { title, content, type } = req.body;
    const notice = await Notice.create({
      title, content, type,
      postedBy: req.user._id,
      postedByName: req.user.name
    });
    res.status(201).json({ message: 'Notice posted', notice });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/notices/:id', async (req, res) => {
  try {
    await Notice.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Notice updated' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/notices/:id', async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- STATS ----
router.get('/stats', async (req, res) => {
  try {
    const totalVoters = await User.countDocuments({ role: { $in: ['voter', 'nominal'] } });
    const votedGS = await User.countDocuments({ 'hasVoted.GS': true });
    const votedVGS = await User.countDocuments({ 'hasVoted.VGS': true });
    const totalNominals = await Nominal.countDocuments({ isActive: true });
    const totalClubs = await Club.countDocuments({ isActive: true });
    const turnoutPercent = totalVoters > 0 ? Math.round((votedGS / totalVoters) * 100) : 0;
    res.json({ totalVoters, votedGS, votedVGS, totalNominals, totalClubs, turnoutPercent });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
