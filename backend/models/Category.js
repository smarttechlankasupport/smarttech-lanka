// ============================================
// Category Model
// ============================================
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:  { type: String, required: [true, 'Category name is required'], unique: true, trim: true },
  slug:  { type: String, unique: true, lowercase: true },
  icon:  { type: String, default: '📦' },
  image: { public_id: String, url: String },
  description: { type: String },
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
