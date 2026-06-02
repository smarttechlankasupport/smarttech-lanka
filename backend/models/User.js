// ============================================
// User Model — customers + admins
// ============================================
const crypto   = require('crypto');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const addressSchema = new mongoose.Schema({
  label:    { type: String, default: 'Home' },
  line1:    { type: String, required: true },
  city:     { type: String, required: true },
  district: { type: String },
  phone:    { type: String },
  isDefault:{ type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  name:       { type: String, required: [true, 'Name is required'], trim: true, maxlength: 50 },
  email:      { type: String, required: [true, 'Email is required'], unique: true, lowercase: true,
                match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] },
  password:   { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  phone:      { type: String, trim: true },
  avatar:     { type: String, default: '' },
  role:       { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses:  [addressSchema],
  wishlist:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isVerified: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
  lastLogin:  { type: Date },
  resetPasswordToken:   { type: String, select: false },
  resetPasswordExpire:  { type: Date, select: false },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

userSchema.methods.generatePasswordReset = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
