// ============================================
// Users Routes — Admin management
// ============================================
const express = require('express');
const asyncH  = require('express-async-handler');
const User    = require('../models/User');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users — admin: all users
router.get('/', protect, admin, asyncH(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const filter = {};
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  if (role)   filter.role = role;
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, total, users });
}));

// GET /api/users/:id — admin: user detail
router.get('/:id', protect, admin, asyncH(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, user });
}));

// PUT /api/users/:id — admin: update role / status
router.put('/:id', protect, admin, asyncH(async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, user });
}));

// DELETE /api/users/:id — admin: deactivate user
router.delete('/:id', protect, admin, asyncH(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, message: 'User deactivated' });
}));

module.exports = router;
