// ============================================
// Products Routes — CRUD + Search + Filters
// ============================================
const express = require('express');
const asyncH  = require('express-async-handler');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/auth');
const { uploadProduct, cloudinary } = require('../config/cloudinary');

const router = express.Router();

// Helper: normalize specs array coming from frontend
const normalizeSpecs = (raw) => {
  if (!raw) return [];
  let arr = raw;
  if (typeof raw === 'string') {
    try { arr = JSON.parse(raw); } catch (_) { return []; }
  }
  if (!Array.isArray(arr)) return [];
  return arr.map(s => {
    const key = (s.key || s.name || s.label || '').toString().trim();
    const value = (s.value || s.val || '').toString().trim();
    return { key, value };
  }).filter(s => s.key && s.value);
};
// ── GET /api/products — list with filters ────
router.get('/', asyncH(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, rating, sort, page = 1, limit = 12, featured } = req.query;

  const filter = { isActive: true };
  if (keyword) filter.name = { $regex: keyword, $options: 'i' };
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    } else {
      const cat = await Category.findOne({ slug: category, isActive: true }).select('_id');
      if (!cat) {
        return res.json({ success: true, total: 0, page: Number(page), pages: 0, products: [] });
      }
      filter.category = cat._id;
    }
  }
  if (featured) filter.featured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (rating)    filter.ratings = { $gte: Number(rating) };

  let sortObj = { createdAt: -1 };
  if (sort === 'price-asc')   sortObj = { price: 1 };
  if (sort === 'price-desc')  sortObj = { price: -1 };
  if (sort === 'rating')      sortObj = { ratings: -1 };
  if (sort === 'popular')     sortObj = { soldCount: -1 };

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('category', 'name slug icon')
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    products,
  });
}));

// ── GET /api/products/slug/:slug ─────────────
router.get('/slug/:slug', asyncH(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug icon');
  if (!product || !product.isActive) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, product });
}));

// ── GET /api/products/:id ────────────────────
router.get('/:id', asyncH(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug icon');
  if (!product || !product.isActive) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, product });
}));

// ── POST /api/products — admin create ────────
router.post('/', protect, admin, uploadProduct.array('images', 5), asyncH(async (req, res) => {
  const { name, description, shortDesc, category, price, originalPrice, stock, brand, warranty, tags, specs, featured } = req.body;
  const images = req.files ? req.files.map(f => ({ public_id: f.filename, url: f.path })) : [];
  const parsedTags = tags ? JSON.parse(tags) : [];
  const parsedSpecs = normalizeSpecs(specs);

  const product = await Product.create({
    name, description, shortDesc, category, price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    stock: Number(stock), brand, warranty, featured: featured === 'true',
    images,
    tags: parsedTags,
    specs: parsedSpecs,
  });
  res.status(201).json({ success: true, product });
}));

// ── PUT /api/products/:id — admin update ──────
router.put('/:id', protect, admin, uploadProduct.array('images', 5), asyncH(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const updates = { ...req.body };
  if (updates.price)         updates.price = Number(updates.price);
  if (updates.originalPrice) updates.originalPrice = Number(updates.originalPrice);
  if (updates.stock)         updates.stock = Number(updates.stock);
  if (updates.tags)          updates.tags = JSON.parse(updates.tags);
  if (updates.specs)         updates.specs = normalizeSpecs(updates.specs);
  if (updates.featured)      updates.featured = updates.featured === 'true';

  if (req.files && req.files.length > 0) {
    // Delete old images from cloudinary
    for (const img of product.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }
    updates.images = req.files.map(f => ({ public_id: f.filename, url: f.path }));
  }

  product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  res.json({ success: true, product });
}));

// ── DELETE /api/products/:id — admin ─────────
router.delete('/:id', protect, admin, asyncH(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  for (const img of product.images) {
    if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
}));

// ── POST /api/products/:id/add-image — admin add extra image
router.post('/:id/add-image', protect, admin, uploadProduct.single('image'), asyncH(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  product.images.push({ public_id: req.file.filename, url: req.file.path });
  await product.save();
  res.json({ success: true, images: product.images });
}));

module.exports = router;
