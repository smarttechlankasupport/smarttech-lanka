// ============================================
// Reviews Routes
// ============================================
const express  = require('express');
const asyncH   = require('express-async-handler');
const Review   = require('../models/Review');
const Order    = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews/:productId
router.get('/:productId', asyncH(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
}));

// POST /api/reviews/:productId
router.post('/:productId', protect, asyncH(async (req, res) => {
  const { rating, title, comment } = req.body;
  const existing = await Review.findOne({ product: req.params.productId, user: req.user._id });
  if (existing) { res.status(400); throw new Error('You have already reviewed this product'); }
  // Check if verified purchase
  const order = await Order.findOne({ user: req.user._id, 'items.product': req.params.productId, orderStatus: 'delivered' });
  const review = await Review.create({
    product: req.params.productId, user: req.user._id,
    rating, title, comment,
    isVerifiedPurchase: !!order,
  });
  res.status(201).json({ success: true, review });
}));

// DELETE /api/reviews/:id
router.delete('/:id', protect, asyncH(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
}));

module.exports = router;
