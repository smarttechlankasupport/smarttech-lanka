// ============================================
// Product Model
// ============================================
const mongoose = require('mongoose');

const specSchema = new mongoose.Schema({
  key:   { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name:         { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 200 },
  slug:         { type: String, unique: true, lowercase: true },
  description:  { type: String, required: [true, 'Description is required'] },
  shortDesc:    { type: String, maxlength: 300 },
  category:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand:        { type: String, default: 'Smart  Tech' },
  price:        { type: Number, required: [true, 'Price is required'], min: 0 },
  originalPrice:{ type: Number, min: 0 },
  discount:     { type: Number, min: 0, max: 100, default: 0 },
  images:       [{ public_id: String, url: String }],
  stock:        { type: Number, required: true, default: 0, min: 0 },
  sku:          { type: String, unique: true, sparse: true },
  specs:        [specSchema],
  tags:         [String],
  featured:     { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
  ratings:      { type: Number, default: 0 },
  numReviews:   { type: Number, default: 0 },
  warranty:     { type: String, default: '' },
  whatsappMsg:  { type: String, default: '' },
  soldCount:    { type: Number, default: 0 },
}, { timestamps: true });

// Auto-generate slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  // Calculate discount
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

// Virtual: discounted price
productSchema.virtual('finalPrice').get(function () {
  if (this.discount > 0 && this.originalPrice) return this.price;
  return this.price;
});

module.exports = mongoose.model('Product', productSchema);
