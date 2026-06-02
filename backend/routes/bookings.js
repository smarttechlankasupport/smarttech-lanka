// ============================================
// Service Bookings Routes
// ============================================
const express  = require('express');
const asyncH   = require('express-async-handler');
const Booking  = require('../models/Booking');
const { protect, admin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings — create booking
router.post('/', optionalAuth, asyncH(async (req, res) => {
  const booking = await Booking.create({ ...req.body, user: req.user?._id });
  res.status(201).json({ success: true, booking });
}));

// GET /api/bookings/my — user's bookings
router.get('/my', protect, asyncH(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, bookings });
}));

// GET /api/bookings — admin: all bookings
router.get('/', protect, admin, asyncH(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const total    = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, total, bookings });
}));

// GET /api/bookings/:id
router.get('/:id', protect, asyncH(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('user', 'name email');
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  res.json({ success: true, booking });
}));

// PUT /api/bookings/:id — admin update
router.put('/:id', protect, admin, asyncH(async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (req.body.status === 'completed') booking.completedAt = new Date();
  await booking.save();
  res.json({ success: true, booking });
}));

module.exports = router;
