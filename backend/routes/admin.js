// ============================================
// Admin Dashboard Stats
// ============================================
const express  = require('express');
const asyncH   = require('express-async-handler');
const Order    = require('../models/Order');
const Product  = require('../models/Product');
const User     = require('../models/User');
const Booking  = require('../models/Booking');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats — dashboard overview
router.get('/stats', protect, admin, asyncH(async (req, res) => {
  const [
    totalOrders, totalRevenue, totalCustomers, totalProducts,
    pendingOrders, pendingBookings, lowStockProducts, recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments({ orderStatus: 'pending' }),
    Booking.countDocuments({ status: 'pending' }),
    Product.find({ stock: { $lte: 5 }, isActive: true }).select('name stock').limit(10),
    Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(5),
  ]);

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const revenueByMonth = await Order.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo }, paymentStatus: 'paid' } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Top selling products
  const topProducts = await Product.find({ isActive: true }).sort({ soldCount: -1 }).limit(5).select('name soldCount price images');

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCustomers,
      totalProducts,
      pendingOrders,
      pendingBookings,
    },
    lowStockProducts,
    recentOrders,
    revenueByMonth,
    topProducts,
    ordersByStatus,
  });
}));

module.exports = router;
