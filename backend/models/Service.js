// ============================================
// Service Model
// ============================================
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title:       { type: String, required: [true, 'Service title is required'], trim: true, maxlength: 200 },
  description: { type: String, maxlength: 1000 },
  price:       { type: Number, min: 0 },
  priceLabel:  { type: String, default: '', maxlength: 100 }, // e.g. "From Rs. 15,000" or "FREE"
  duration:    { type: String, default: '', maxlength: 100 }, // e.g. "1–2 days"
  icon:        { type: String, default: '⚙️', maxlength: 20 }, // emoji or icon string
  category:    { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

// Validate: price is required unless priceLabel is "FREE"
serviceSchema.pre('save', function (next) {
  if (this.priceLabel?.toUpperCase() !== 'FREE' && (this.price === undefined || this.price === null)) {
    return next(new Error('Price is required unless priceLabel is "FREE"'));
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
