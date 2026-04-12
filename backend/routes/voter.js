const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Nominal = require('../models/Nominal');
const Election = require('../models/Election');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('voter', 'nominal'));

// Check voting status
router.get('/status', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const election = await Election.findOne();
    res.json({ hasVoted: user.hasVoted, election });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get my nominal profile (for nominals)
router.get('/my-nominal', async (req, res) => {
  try {
    const nominals = await Nominal.find({ userId: req.user._id }).populate('clubId', 'name');
    res.json(nominals);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Cast vote
router.post('/vote', async (req, res) => {
  try {
    const { nominalId, postType, clubId } = req.body;
    const election = await Election.findOne();
    if (!election?.isOpen) return res.status(403).json({ message: 'Voting is not currently open' });

    const user = await User.findById(req.user._id);
    const nominal = await Nominal.findById(nominalId);
    if (!nominal) return res.status(404).json({ message: 'Candidate not found' });

    // Check if nominal is running for the same post (nominals can't vote for their own post)
    if (req.user.role === 'nominal') {
      const myNominals = await Nominal.find({ userId: req.user._id });
      const conflict = myNominals.find(n =>
        n.postType === postType && (!clubId || String(n.clubId) === clubId)
      );
      if (conflict) return res.status(403).json({ message: 'You cannot vote for the post you are nominated for' });
    }

    // Check duplicate vote
    if (postType === 'GS' && user.hasVoted.GS)
      return res.status(400).json({ message: 'You have already voted for GS' });
    if (postType === 'VGS' && user.hasVoted.VGS)
      return res.status(400).json({ message: 'You have already voted for VGS' });
    if (clubId) {
      const clubVotes = user.hasVoted.clubs?.get(clubId) || {};
      if (clubVotes[postType]) return res.status(400).json({ message: `Already voted for ${postType} in this club` });
    }

    // Record vote
    await Nominal.findByIdAndUpdate(nominalId, { $inc: { voteCount: 1 } });

    // Mark user as voted
    if (postType === 'GS') user.hasVoted.GS = true;
    else if (postType === 'VGS') user.hasVoted.VGS = true;
    else if (clubId) {
      if (!user.hasVoted.clubs) user.hasVoted.clubs = new Map();
      const clubVotes = user.hasVoted.clubs.get(clubId) || {};
      clubVotes[postType] = true;
      user.hasVoted.clubs.set(clubId, clubVotes);
    }
    user.markModified('hasVoted');
    await user.save();

    res.json({ message: 'Vote cast successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
