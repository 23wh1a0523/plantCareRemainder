const express = require('express');
const User = require('../models/User');
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Create user (admin-only)
router.post('/', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { username, email, password, role, profilePic } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const user = await User.create({ username, email, password, role, profilePic });
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (error) {
    next(error);
  }
});

// Get all users (admin)
router.get('/', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get current user or by id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user by id (self or admin)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const updates = { ...req.body };
    if (updates.password) {
      // will be hashed in pre-save hook
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.username = updates.username || user.username;
      user.profilePic = updates.profilePic ?? user.profilePic;
      user.password = updates.password;
      const saved = await user.save();
      const userObj = saved.toObject();
      delete userObj.password;
      return res.json(userObj);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Delete user by id (admin only)
router.delete('/:id', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
