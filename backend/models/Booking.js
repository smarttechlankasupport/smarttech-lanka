// ============================================
// Service Booking Model
// ============================================
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:       { type: String, required: [true, 'Name is required'] },
  email:      { type: String, required: [true, 'Email is required'] },
  phone:      { type: String, required: [true, 'Phone is required'] },
  service:    { type: String, required: [true, 'Service type is required'],
                enum: ['Smart Home Setup','CCTV Installation','Smart Lighting','Smart Lock Installation',
                       'Home Automation','Electrical Repair','Security System','Consultation','Other'] },
  date:       { type: Date, required: [true, 'Date is required'] },
  timeSlot:   { type: String, required: [true, 'Time slot is required'] },
  address:    { type: String, required: [true, 'Address is required'] },
  city:       { type: String, required: [true, 'City is required'] },
  district:   { type: String },
  notes:      { type: String },
  status:     { type: String, enum: ['pending','confirmed','in-progress','completed','cancelled'], default: 'pending' },
  priority:   { type: String, enum: ['normal','urgent'], default: 'normal' },
  technicianName: { type: String },
  technicianPhone:{ type: String },
  estimatedCost:  { type: Number },
  actualCost:     { type: Number },
  bookingNumber:  { type: String, unique: true },
  completedAt:    { type: Date },
  adminNotes:     { type: String },
}, { timestamps: true });

bookingSchema.pre('save', async function (next) {
  if (!this.bookingNumber) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingNumber = `SRV-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
