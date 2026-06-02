// ============================================
// Auth Routes — Register / Login / Profile
// ============================================
const crypto    = require('crypto');
const asyncH    = require('express-async-handler');
const bcrypt    = require('bcryptjs');
const User      = require('../models/User');
const sendEmail = require('../utils/email');
const { protect } = require('../middleware/auth');

const router = require('express').Router();
console.log('Auth router initialized');
console.log('AUTH FILE LOADED');

const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id, name: user.name, email: user.email,
      phone: user.phone, avatar: user.avatar, role: user.role,
      addresses: user.addresses, wishlist: user.wishlist,
    },
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log('REGISTER ROUTE HIT');
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, password, phone });
  sendToken(user, 201, res);
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('LOGIN ROUTE HIT');
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  sendToken(user, 200, res);
});

// POST /api/auth/forgot-password
router.post('/forgot-password', asyncH(async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400); throw new Error('Please provide your email address'); }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }

  const resetToken = user.generatePasswordReset();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;
  const message = `You requested a password reset for your Smart  Tech account. Click the link below to set a new password.\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Smart  Tech Password Reset',
      text: message,
      html: `<p>Hello ${user.name || 'Customer'},</p><p>You requested a password reset for your Smart  Tech account. Click the button below to set a new password.</p><p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#000;color:#fff;border-radius:12px;text-decoration:none;">Reset Password</a></p><p>If you did not request this, ignore this email.</p>`,
    });

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('EMAIL CONFIG:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      userExists: !!process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM,
    });
    console.error('EMAIL SEND FAILED:', err);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    const errorPayload = {
      message: err.message,
      code: err.code,
      response: err.response,
      stack: err.stack,
    };

    return res.status(500).json({
      success: false,
      message: 'Unable to send reset email. Please try again later.',
      error: errorPayload,
    });
  }
}));

// POST /api/auth/reset-password
router.post('/reset-password', asyncH(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) { res.status(400); throw new Error('Token and new password are required'); }
  if (password.length < 6) { res.status(400); throw new Error('Password must be at least 6 characters'); }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) { res.status(400); throw new Error('Reset token is invalid or has expired'); }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful. Please log in with your new password.' });
}));

// GET /api/auth/me — get current user
router.get('/me', protect, asyncH(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price images');
  res.json({ success: true, user });
}));

// PUT /api/auth/update-profile
router.put('/update-profile', protect, asyncH(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, avatar },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
}));

// PUT /api/auth/change-password
router.put('/change-password', protect, asyncH(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) { res.status(400); throw new Error('Current password is incorrect'); }
  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
}));

// POST /api/auth/add-address
router.post('/add-address', protect, asyncH(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach(a => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
}));

// DELETE /api/auth/address/:id
router.delete('/address/:id', protect, asyncH(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
}));

// POST /api/auth/wishlist/:productId — toggle
router.post('/wishlist/:productId', protect, asyncH(async (req, res) => {
  const user   = await User.findById(req.user._id);
  const pid    = req.params.productId;
  const idx    = user.wishlist.indexOf(pid);
  let action;
  if (idx > -1) { user.wishlist.splice(idx, 1); action = 'removed'; }
  else          { user.wishlist.push(pid);       action = 'added'; }
  await user.save();
  res.json({ success: true, action, wishlist: user.wishlist });
}));

module.exports = router;
