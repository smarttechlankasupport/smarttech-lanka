// ============================================
// Coupons Routes
// ============================================
const express = require('express');
const asyncH  = require('express-async-handler');
const Coupon  = require('../models/Coupon');
const { protect, admin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/coupons/validate — validate coupon
router.post('/validate', optionalAuth, asyncH(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) { res.status(404); throw new Error('Invalid coupon code'); }
  const validity = coupon.isValid(orderAmount, req.user?._id);
  if (!validity.valid) { res.status(400); throw new Error(validity.message); }
  let discountAmount = coupon.type === 'percentage'
    ? Math.min(orderAmount * coupon.value / 100, coupon.maxDiscount || Infinity)
    : coupon.value;
  res.json({ success: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value, discountAmount: Math.round(discountAmount) } });
}));

// Admin CRUD
router.get('/', protect, admin, asyncH(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
}));

router.post('/', protect, admin, asyncH(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
}));

router.put('/:id', protect, admin, asyncH(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, coupon });
}));

router.delete('/:id', protect, admin, asyncH(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
}));

module.exports = router;
