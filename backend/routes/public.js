const express = require('express');
const router = express.Router();
const Nominal = require('../models/Nominal');
const Club = require('../models/Club');
const Notice = require('../models/Notice');
const Election = require('../models/Election');

// Get election status
router.get('/election', async (req, res) => {
  try {
    const election = await Election.findOne();
    res.json(election || { isOpen: false, resultsPublished: false });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all clubs
router.get('/clubs', async (req, res) => {
  try {
    const clubs = await Club.find({ isActive: true });
    res.json(clubs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get nominals for GS or VGS
router.get('/nominals/:postType', async (req, res) => {
  try {
    const { postType } = req.params;
    const nominals = await Nominal.find({ postType, clubId: null, isActive: true })
      .select('name photo description postType voteCount');
    res.json(nominals);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get nominals for a club
router.get('/clubs/:clubId/nominals', async (req, res) => {
  try {
    const nominals = await Nominal.find({ clubId: req.params.clubId, isActive: true })
      .select('name photo description postType voteCount');
    const grouped = { president: [], vicePresident: [], secretary: [], treasurer: [] };
    nominals.forEach(n => { if (grouped[n.postType]) grouped[n.postType].push(n); });
    res.json(grouped);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all results (only when published)
router.get('/results', async (req, res) => {
  try {
    const election = await Election.findOne();
    if (!election?.resultsPublished) return res.status(403).json({ message: 'Results not yet published' });
    const nominals = await Nominal.find({ isActive: true }).populate('clubId', 'name').sort('-voteCount');
    res.json(nominals);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get notices
router.get('/notices', async (req, res) => {
  try {
    const notices = await Notice.find({ isPublished: true }).sort('-createdAt').limit(20);
    res.json(notices);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
