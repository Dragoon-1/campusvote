const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const genToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

// Root login
router.post('/root/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ROOT_USERNAME && password === process.env.ROOT_PASSWORD) {
    return res.json({ token: genToken({ role: 'root' }), role: 'root', name: 'Root Admin' });
  }
  res.status(401).json({ message: 'Invalid root credentials' });
});

// Admin/Voter/Nominal login
router.post('/login', async (req, res) => {
  try {
    const { collegeId, password } = req.body;
    const user = await User.findOne({ collegeId, isActive: true });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid college ID or password' });
    res.json({
      token: genToken({ id: user._id, role: user.role }),
      role: user.role,
      name: user.name,
      collegeId: user.collegeId,
      id: user._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
