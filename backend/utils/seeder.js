/* ============================================
   backend/utils/seeder.js
   Purpose: Seed DB with admin + categories +
            sample products + coupons
   Run: npm run seed
   ============================================ */
require('dotenv').config();
const mongoose   = require('mongoose');
const connectDB  = require('../config/db');
const User       = require('../models/User');
const Category   = require('../models/Category');
const Product    = require('../models/Product');
const Coupon     = require('../models/Coupon');

const CATEGORIES = [
  { name: 'Smart Lights',   icon: '💡', description: 'WiFi-enabled smart lighting systems',   sortOrder: 1 },
  { name: 'CCTV',           icon: '📷', description: 'Security cameras and DVR/NVR systems',  sortOrder: 2 },
  { name: 'Smart Locks',    icon: '🔒', description: 'Biometric and app-controlled locks',     sortOrder: 3 },
  { name: 'Smart Switches', icon: '🔌', description: 'WiFi smart switches and smart plugs',    sortOrder: 4 },
  { name: 'Sensors',        icon: '📡', description: 'Motion, flood, smoke and temp sensors',  sortOrder: 5 },
  { name: 'Accessories',    icon: '⚙️', description: 'Hubs, cables and mounting accessories', sortOrder: 6 },
];

// Simple slug generator to match Category pre-save behavior
const slugify = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const COUPONS = [
  { code: 'SMART10', type: 'percentage', value: 10, minOrderAmount: 2000,  usageLimit: 200, expiresAt: new Date('2026-12-31'), description: '10% off all orders' },
  { code: 'LANKA20', type: 'percentage', value: 20, minOrderAmount: 10000, usageLimit: 50,  expiresAt: new Date('2026-12-31'), description: '20% off orders over Rs.10,000' },
  { code: 'TECH15',  type: 'percentage', value: 15, minOrderAmount: 5000,  usageLimit: 100, expiresAt: new Date('2026-12-31'), description: '15% off orders over Rs.5,000' },
  { code: 'FLAT500', type: 'fixed',      value: 500,minOrderAmount: 3000,  usageLimit: 500, expiresAt: new Date('2026-12-31'), description: 'Rs.500 flat discount' },
];

const seedDB = async () => {
  await connectDB();
  console.log('\n🌱 Starting database seed...\n');

  try {
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ── Create admin user ──────────────────────
    const admin = await User.create({
      name:       process.env.ADMIN_NAME     || 'Admin',
      email:      process.env.ADMIN_EMAIL    || 'admin@smarttechlanka.lk',
      password:   process.env.ADMIN_PASSWORD || 'Admin@2025!',
      role:       'admin',
      isVerified: true,
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // ── Create sample customer ─────────────────
    await User.create({
      name: 'Kamal Perera', email: 'kamal@gmail.com',
      password: 'Test@1234', phone: '0771234567', isVerified: true,
    });
    console.log('✅ Sample customer created');

    // ── Create categories ──────────────────────
    // Ensure slugs are set because insertMany bypasses mongoose pre 'save' hooks
    const catsPayload = CATEGORIES.map(c => ({ ...c, slug: slugify(c.name) }));
    const cats = await Category.insertMany(catsPayload);
    const catMap = {};
    cats.forEach(c => { catMap[c.name] = c._id; });
    console.log(`✅ ${cats.length} categories created`);

    // ── Create products ────────────────────────
    const products = [
      {
        name: 'SmartGlow Pro LED Strip 5M', category: catMap['Smart Lights'],
        price: 4500, originalPrice: 6500, stock: 50, featured: true,
        description: 'WiFi-enabled RGB LED strip with 16 million colors. Works with Alexa & Google Home. App controlled with music sync feature. IP65 waterproof for outdoor use.',
        shortDesc: 'WiFi RGB LED strip, 5M, 16M colors, Alexa & Google Home',
        brand: 'Smart  Tech', warranty: '1 Year Warranty',
        specs: [{ key: 'Length', value: '5 meters' }, { key: 'Connectivity', value: 'WiFi 2.4GHz' }, { key: 'Colors', value: '16 Million' }, { key: 'Power', value: '12W' }, { key: 'IP Rating', value: 'IP65' }],
        tags: ['wifi', 'rgb', 'led', 'alexa', 'google-home'],
      },
      {
        name: 'CCTV 4MP Night Vision Outdoor Camera', category: catMap['CCTV'],
        price: 8900, originalPrice: 11000, stock: 30, featured: true,
        description: '4MP outdoor IP camera with IR night vision up to 30m. H.265+ compression, motion detection with mobile alerts, 2-way audio, IP66 weatherproof rating.',
        shortDesc: '4MP outdoor camera, 30m IR night vision, motion alerts',
        brand: 'HiVision Pro', warranty: '2 Year Warranty',
        specs: [{ key: 'Resolution', value: '4MP (2560×1440)' }, { key: 'Night Vision', value: '30m IR range' }, { key: 'IP Rating', value: 'IP66 Weatherproof' }, { key: 'Audio', value: '2-Way Audio' }, { key: 'Compression', value: 'H.265+' }],
        tags: ['cctv', 'security', 'outdoor', '4mp', 'night-vision'],
      },
      {
        name: 'Smart WiFi Door Lock Pro — Fingerprint', category: catMap['Smart Locks'],
        price: 18500, originalPrice: 22000, stock: 20, featured: true,
        description: 'Advanced biometric smart lock. Supports fingerprint, PIN code, RFID card, Bluetooth and app control. 50 fingerprint capacity, auto-lock timer, tamper alarm.',
        shortDesc: 'Fingerprint + PIN + RFID + App controlled smart lock',
        brand: 'SecureSmart', warranty: '1 Year Warranty',
        specs: [{ key: 'Authentication', value: 'Fingerprint + PIN + RFID + App' }, { key: 'Capacity', value: '50 fingerprints, 100 PINs' }, { key: 'Battery', value: '4×AA (12 months)' }, { key: 'Material', value: 'Zinc Alloy' }, { key: 'Standard', value: 'Universal door fit' }],
        tags: ['smart-lock', 'fingerprint', 'security', 'door', 'wifi'],
      },
      {
        name: 'Smart Switch Panel 3-Gang WiFi', category: catMap['Smart Switches'],
        price: 3200, originalPrice: 4000, stock: 80, featured: false,
        description: 'Replace any standard 3-gang wall switch. WiFi-enabled, works with Alexa/Google Home, schedule/timer functions, energy monitoring, touch panel.',
        shortDesc: 'WiFi 3-gang smart switch, replace any standard switch',
        brand: 'Smart  Tech', warranty: '1 Year Warranty',
        specs: [{ key: 'Gangs', value: '3-Gang' }, { key: 'Load', value: '10A per gang' }, { key: 'Connectivity', value: 'WiFi 2.4GHz' }, { key: 'Panel', value: 'Tempered glass touch' }],
        tags: ['switch', 'wifi', 'smart', 'alexa', '3-gang'],
      },
      {
        name: 'PIR Motion Sensor — Zigbee 3.0', category: catMap['Sensors'],
        price: 1800, originalPrice: 2500, stock: 100, featured: false,
        description: 'Compact Zigbee motion sensor with 120° detection angle and 8m range. Battery powered, instant automations, works with SmartThings, Hue, and most Zigbee hubs.',
        shortDesc: '120° PIR motion sensor, Zigbee 3.0, 8m range',
        brand: 'SmartSense', warranty: '1 Year Warranty',
        specs: [{ key: 'Detection', value: '120° / 8m range' }, { key: 'Protocol', value: 'Zigbee 3.0' }, { key: 'Battery', value: 'CR2 (1 year)' }, { key: 'IP Rating', value: 'IP20' }],
        tags: ['sensor', 'motion', 'zigbee', 'automation'],
      },
      {
        name: 'Smart RGB Bulb E27 — 4 Pack', category: catMap['Smart Lights'],
        price: 5600, originalPrice: 7200, stock: 60, featured: true,
        description: '4-pack of smart E27 RGB+W bulbs. 9W, 800 lumens, 2700K-6500K tunable. Works with Alexa, Google, and Siri. Group control, scenes, music sync via app.',
        shortDesc: 'Smart E27 RGB bulbs, 4-pack, 16M colors, voice control',
        brand: 'Smart  Tech', warranty: '2 Year Warranty',
        specs: [{ key: 'Base', value: 'E27' }, { key: 'Power', value: '9W each' }, { key: 'Colors', value: '16M RGB + White' }, { key: 'Color Temp', value: '2700K-6500K' }, { key: 'Lifespan', value: '15,000 hours' }],
        tags: ['bulb', 'rgb', 'e27', 'smart', 'alexa', '4pack'],
      },
      {
        name: '8-Channel DVR + 4 Camera CCTV Kit', category: catMap['CCTV'],
        price: 35000, originalPrice: 45000, stock: 15, featured: true,
        description: 'Complete CCTV bundle: 8-channel H.265+ DVR, 4×2MP cameras, 1TB HDD pre-installed, cables, power supplies. Mobile app viewing, motion alerts, 30-day recording.',
        shortDesc: '8CH DVR + 4 cameras + 1TB HDD — complete CCTV bundle',
        brand: 'HiVision Pro', warranty: '1 Year Warranty',
        specs: [{ key: 'Channels', value: '8 (expandable)' }, { key: 'Storage', value: '1TB HDD included' }, { key: 'Cameras', value: '4 × 2MP HD' }, { key: 'Compression', value: 'H.265+' }, { key: 'Remote View', value: 'Mobile + PC App' }],
        tags: ['cctv', 'dvr', 'bundle', 'kit', 'hdd', 'complete'],
      },
      {
        name: 'Smart Home Hub Gateway — Multi-Protocol', category: catMap['Accessories'],
        price: 6800, originalPrice: 8500, stock: 25, featured: true,
        description: 'Central smart home hub supporting Zigbee 3.0, Z-Wave, WiFi and Bluetooth. Controls 200+ devices from one app. Works offline after initial setup.',
        shortDesc: 'Zigbee + Z-Wave + WiFi hub, control all smart devices',
        brand: 'SmartHome Pro', warranty: '2 Year Warranty',
        specs: [{ key: 'Protocols', value: 'Zigbee 3.0 + Z-Wave + WiFi + BT' }, { key: 'Capacity', value: '200+ devices' }, { key: 'Connectivity', value: 'LAN + WiFi' }, { key: 'Offline Mode', value: 'Yes — works without internet' }],
        tags: ['hub', 'gateway', 'zigbee', 'z-wave', 'automation'],
      },
      {
        name: 'Smart Plug 16A — Energy Monitor', category: catMap['Smart Switches'],
        price: 2400, originalPrice: 3200, stock: 150, featured: false,
        description: 'Smart plug with real-time energy monitoring. 16A/3500W max load, surge protection, child lock. Schedule, timer, away mode. Works with Alexa & Google.',
        shortDesc: '16A smart plug with live energy monitoring, Alexa/Google',
        brand: 'Smart  Tech', warranty: '1 Year Warranty',
        specs: [{ key: 'Max Load', value: '16A / 3500W' }, { key: 'Monitoring', value: 'Real-time kWh + cost' }, { key: 'Protection', value: 'Surge + overload' }, { key: 'Safety', value: 'Child safety lock' }],
        tags: ['plug', 'smart', 'energy', 'monitor', 'wifi'],
      },
      {
        name: 'Smoke Detector — WiFi Smart Alert', category: catMap['Sensors'],
        price: 3500, originalPrice: 4500, stock: 70, featured: false,
        description: 'Smart photoelectric smoke alarm with instant mobile push notifications. 10-year sealed battery, interconnect with other devices, self-test button.',
        shortDesc: 'WiFi smoke alarm, instant mobile alerts, 10-year battery',
        brand: 'SafeHome', warranty: '3 Year Warranty',
        specs: [{ key: 'Sensor', value: 'Photoelectric' }, { key: 'Battery', value: '10-year sealed' }, { key: 'Alert', value: 'Mobile push + 85dB siren' }, { key: 'Test', value: 'Remote test via app' }],
        tags: ['smoke', 'alarm', 'safety', 'wifi', 'sensor'],
      },
    ];

    // Ensure product slugs are set because insertMany bypasses mongoose pre 'save' hooks
    const timestamp = Date.now();
    const usedSlugs = new Set();
    const productsPayload = products.map((p, idx) => {
      const base = slugify(p.name || String(idx));
      let candidate = `${base}-${timestamp}-${idx}`;
      let i = 0;
      while (usedSlugs.has(candidate)) { i += 1; candidate = `${base}-${timestamp}-${idx}-${i}`; }
      usedSlugs.add(candidate);
      return { ...p, slug: candidate };
    });
    const created = await Product.insertMany(productsPayload);
    console.log(`✅ ${created.length} products created`);


    // ── Create coupons ─────────────────────────
    const createdCoupons = await Coupon.insertMany(COUPONS);
    console.log(`✅ ${createdCoupons.length} coupons created`);

    // ── Summary ────────────────────────────────
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('━'.repeat(45));
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log(`📧 Admin Email:    ${admin.email}`);
    console.log(`🔑 Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin@2025!'}`);
    console.log(`🌐 Frontend URL:   ${frontendUrl}`);
    console.log(`⚡ Admin Panel:    ${frontendUrl.replace(/\/\/?$/, '')}/admin`);
    console.log(`🔌 API URL:        http://localhost:5000`);
    console.log('━'.repeat(45));
    console.log('\n🏷️  Test Coupons: SMART10 | LANKA20 | TECH15 | FLAT500\n');

  } catch (err) {
    console.error('❌ Seeder error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedDB();
