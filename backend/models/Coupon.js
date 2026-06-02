// ============================================
// Coupon Model
// ============================================
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:         { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:         { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  value:        { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount:  { type: Number },
  usageLimit:   { type: Number, default: 100 },
  usedCount:    { type: Number, default: 0 },
  usedBy:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt:    { type: Date, required: true },
  isActive:     { type: Boolean, default: true },
  description:  { type: String },
}, { timestamps: true });

couponSchema.methods.isValid = function (orderAmount, userId) {
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (new Date() > this.expiresAt) return { valid: false, message: 'Coupon has expired' };
  if (this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
  if (orderAmount < this.minOrderAmount) return { valid: false, message: `Minimum order amount is Rs. ${this.minOrderAmount}` };
  if (userId && this.usedBy.includes(userId)) return { valid: false, message: 'You have already used this coupon' };
  return { valid: true };
};

module.exports = mongoose.model('Coupon', couponSchema);
