// ============================================
// Services Routes
// ============================================
const express   = require('express');
const asyncH    = require('express-async-handler');
const Service   = require('../models/Service');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// GET /api/services — public, return only active services
router.get('/', asyncH(async (req, res) => {
  const services = await Service.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
  res.json({ success: true, services });
}));

// GET /api/services/:id — public, get single service
router.get('/:id', asyncH(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) { res.status(404); throw new Error('Service not found'); }
  res.json({ success: true, service });
}));

// POST /api/services — admin only, create service
router.post('/', protect, admin, asyncH(async (req, res) => {
  const { title, description, price, priceLabel, duration, icon, category, isActive, sortOrder } = req.body;
  
  if (!title || !title.trim()) {
    res.status(400);
    throw new Error('Service title is required');
  }
  
  // Validate price logic
  if (priceLabel?.toUpperCase() !== 'FREE' && (!price && price !== 0)) {
    res.status(400);
    throw new Error('Price is required unless priceLabel is "FREE"');
  }

  const service = await Service.create({
    title: title.trim(),
    description: description || '',
    price: price || 0,
    priceLabel: priceLabel || '',
    duration: duration || '',
    icon: icon || '⚙️',
    category: category || '',
    isActive: isActive !== undefined ? isActive : true,
    sortOrder: sortOrder !== undefined ? sortOrder : 0,
  });

  res.status(201).json({ success: true, service });
}));

// PUT /api/services/:id — admin only, update service
router.put('/:id', protect, admin, asyncH(async (req, res) => {
  const { title, description, price, priceLabel, duration, icon, category, isActive, sortOrder } = req.body;
  
  if (title && !title.trim()) {
    res.status(400);
    throw new Error('Service title cannot be empty');
  }

  const service = await Service.findById(req.params.id);
  if (!service) { res.status(404); throw new Error('Service not found'); }

  // Update fields
  if (title) service.title = title.trim();
  if (description !== undefined) service.description = description;
  if (price !== undefined) service.price = price;
  if (priceLabel !== undefined) service.priceLabel = priceLabel;
  if (duration !== undefined) service.duration = duration;
  if (icon !== undefined) service.icon = icon;
  if (category !== undefined) service.category = category;
  if (isActive !== undefined) service.isActive = isActive;
  if (sortOrder !== undefined) service.sortOrder = sortOrder;

  await service.save();
  res.json({ success: true, service });
}));

// DELETE /api/services/:id — admin only, delete service
router.delete('/:id', protect, admin, asyncH(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) { res.status(404); throw new Error('Service not found'); }
  
  await Service.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Service deleted' });
}));

module.exports = router;
