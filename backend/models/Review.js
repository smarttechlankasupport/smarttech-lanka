// ============================================
// Review Model
// ============================================
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, maxlength: 100 },
  comment: { type: String, required: [true, 'Review comment is required'] },
  isVerifiedPurchase: { type: Boolean, default: false },
  helpful: { type: Number, default: 0 },
}, { timestamps: true });

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Update product rating after review save/remove
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', nRating: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
  ]);
  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      numReviews: stats[0].nRating,
      ratings: Math.round(stats[0].avgRating * 10) / 10,
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, { numReviews: 0, ratings: 0 });
  }
};
reviewSchema.post('save', function () { this.constructor.calcAverageRating(this.product); });
reviewSchema.post('remove', function () { this.constructor.calcAverageRating(this.product); });

module.exports = mongoose.model('Review', reviewSchema);
