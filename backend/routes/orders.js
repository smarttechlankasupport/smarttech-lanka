// ============================================
// Orders Routes
// ============================================
const express  = require('express');
const asyncH   = require('express-async-handler');
const Order    = require('../models/Order');
const Product  = require('../models/Product');
const Coupon   = require('../models/Coupon');
const { protect, admin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — place order
router.post('/', optionalAuth, asyncH(async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode, notes, guestName, guestEmail, guestPhone } = req.body;

  if (!items || items.length === 0) { res.status(400); throw new Error('No items in order'); }

  // Verify stock + get prices
  let itemsPrice = 0;
  const orderItems = [];
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) { res.status(404); throw new Error(`Product not found: ${item.product}`); }
    if (product.stock < item.qty) { res.status(400); throw new Error(`Insufficient stock for: ${product.name}`); }
    itemsPrice += product.price * item.qty;
    orderItems.push({ product: product._id, name: product.name, image: product.images[0]?.url, price: product.price, qty: item.qty });
  }

  const shippingPrice = itemsPrice > 10000 ? 0 : 350;
  let discountAmount  = 0;

  // Apply coupon
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validity = coupon.isValid(itemsPrice, req.user?._id);
      if (validity.valid) {
        discountAmount = coupon.type === 'percentage'
          ? Math.min(itemsPrice * coupon.value / 100, coupon.maxDiscount || Infinity)
          : coupon.value;
        coupon.usedCount += 1;
        if (req.user) coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }
  }

  const totalPrice = itemsPrice + shippingPrice - discountAmount;

  const order = await Order.create({
    user: req.user?._id,
    guestName, guestEmail, guestPhone,
    items: orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'cod',
    itemsPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
    couponCode,
    notes,
  });

  // Update stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.qty, soldCount: item.qty }
    });
  }

  res.status(201).json({ success: true, order });
}));

// GET /api/orders/my — user's orders
router.get('/my', protect, asyncH(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 });
  res.json({ success: true, orders });
}));

// GET /api/orders/:id — single order
router.get('/:id', protect, asyncH(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name images price').populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  // Only owner or admin
  if (order.user?._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized to view this order');
  }
  res.json({ success: true, order });
}));

// GET /api/orders — admin: all orders
router.get('/', protect, admin, asyncH(async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (search) filter.orderNumber = { $regex: search, $options: 'i' };

  const total  = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), orders });
}));

// PUT /api/orders/:id/status — admin update status
router.put('/:id/status', protect, admin, asyncH(async (req, res) => {
  const { orderStatus, trackingNumber, cancelReason } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  const previousStatus = order.orderStatus;
  order.orderStatus    = orderStatus;
  if (trackingNumber)  order.trackingNumber = trackingNumber;
  if (cancelReason)    order.cancelReason   = cancelReason;
  if (orderStatus === 'delivered') {
    order.deliveredAt    = new Date();
    order.paymentStatus  = 'paid';
  }
  // Restore stock on cancel only when cancelling from a non-cancelled state
  if (orderStatus === 'cancelled' && previousStatus !== 'cancelled') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty, soldCount: -item.qty } });
    }
  }
  await order.save();
  res.json({ success: true, order });
}));

module.exports = router;
