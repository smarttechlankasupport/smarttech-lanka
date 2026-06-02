// ============================================
// Order Model
// ============================================
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String },
  price:    { type: Number, required: true },
  qty:      { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestName:       { type: String },
  guestEmail:      { type: String },
  guestPhone:      { type: String },
  items:           [orderItemSchema],
  shippingAddress: {
    line1:    { type: String, required: true },
    city:     { type: String, required: true },
    district: { type: String },
    phone:    { type: String, required: true },
  },
  paymentMethod:   { type: String, enum: ['cod', 'bank_transfer', 'card', 'whatsapp'], default: 'cod' },
  paymentStatus:   { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  orderStatus:     { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  itemsPrice:      { type: Number, required: true },
  shippingPrice:   { type: Number, default: 350 },
  discountAmount:  { type: Number, default: 0 },
  totalPrice:      { type: Number, required: true },
  couponCode:      { type: String },
  notes:           { type: String },
  trackingNumber:  { type: String },
  deliveredAt:     { type: Date },
  cancelReason:    { type: String },
  orderNumber:     { type: String, unique: true },
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `STL-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
