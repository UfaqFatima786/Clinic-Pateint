const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const signToken = (id, secret) => jwt.sign({ id }, secret, { expiresIn: '7d' });

const userPayload = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  specialization: u.specialization,
  experience: u.experience,
  isActive: u.isActive,
});

// POST /api/auth/register  (public) -> always creates a PATIENT
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET is not set' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    // role is forced to patient so nobody can self-register as admin/doctor
    const user = await User.create({ name, email, password: hashed, role: 'patient' });

    res.status(201).json({ token: signToken(user._id, jwtSecret), user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login  (public)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET is not set' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid email or password' });

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is deactivated. Contact admin.' });
    }

    res.json({ token: signToken(user._id, jwtSecret), user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
