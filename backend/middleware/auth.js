// ============================================
// Auth Middleware — JWT Protection
// ============================================
const jwt     = require('jsonwebtoken');
const asyncH  = require('express-async-handler');
const User    = require('../models/User');

// Protect: must be logged in
exports.protect = asyncH(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    res.status(401);
    throw new Error('Not authorized. Please login first.');
  }
  try {
    if (process.env.NODE_ENV === 'development') {
      try {
        const masked = token ? `${token.slice(0,8)}...${token.slice(-8)}` : 'no-token';
        console.log(`Auth: incoming token (masked) = ${masked}`);
      } catch (_) { console.log('Auth: incoming token (masked) = [error masking]'); }
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      console.error('JWT verify error:', e.message);
      throw e;
    }
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      res.status(401);
      throw new Error('User not found. Token invalid.');
    }
    if (!req.user.isActive) {
      res.status(401);
      throw new Error('Your account has been deactivated. Contact admin.');
    }
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized. Invalid token.');
  }
});

// Admin only
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403);
  throw new Error('Access denied. Admin only.');
};

// Optional auth (for guest browsing)
exports.optionalAuth = asyncH(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (_) { req.user = null; }
  }
  next();
});
