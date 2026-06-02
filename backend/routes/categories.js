// ============================================
// Categories Routes
// ============================================
const express   = require('express');
const asyncH    = require('express-async-handler');
const Category  = require('../models/Category');
const { protect, admin } = require('../middleware/auth');
const { uploadCategory, cloudinary } = require('../config/cloudinary');

const router = express.Router();

router.get('/', asyncH(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  res.json({ success: true, categories });
}));

router.get('/:id', asyncH(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, category: cat });
}));

router.post('/', protect, admin, uploadCategory.single('image'), asyncH(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.image = { public_id: req.file.filename, url: req.file.path };
  const category = await Category.create(data);
  res.status(201).json({ success: true, category });
}));

router.put('/:id', protect, admin, uploadCategory.single('image'), asyncH(async (req, res) => {
  const data = { ...req.body };
  if (req.file) {
    const cat = await Category.findById(req.params.id);
    if (cat?.image?.public_id) await cloudinary.uploader.destroy(cat.image.public_id);
    data.image = { public_id: req.file.filename, url: req.file.path };
  }
  const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true });
  res.json({ success: true, category });
}));

router.delete('/:id', protect, admin, asyncH(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
}));

module.exports = router;
