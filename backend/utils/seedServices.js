// ============================================
// Seed Services (for initial database setup)
// ============================================
const Service = require('../models/Service');
const mongoose = require('mongoose');

const DEFAULT_SERVICES = [
  {
    title: 'Smart Home Setup',
    description: 'Full home automation setup from scratch',
    price: 15000,
    priceLabel: 'From Rs. 15,000',
    duration: '1–2 days',
    icon: '🏠',
    category: 'Installation',
    isActive: true,
    sortOrder: 1,
  },
  {
    title: 'CCTV Installation',
    description: 'HD security camera installation with remote monitoring',
    price: 5000,
    priceLabel: 'From Rs. 5,000',
    duration: '4–8 hours',
    icon: '📷',
    category: 'Installation',
    isActive: true,
    sortOrder: 2,
  },
  {
    title: 'Smart Lighting',
    description: 'Energy-efficient automated lighting systems',
    price: 3000,
    priceLabel: 'From Rs. 3,000',
    duration: '2–4 hours',
    icon: '💡',
    category: 'Installation',
    isActive: true,
    sortOrder: 3,
  },
  {
    title: 'Smart Lock Install',
    description: 'Biometric and app-controlled security locks',
    price: 2500,
    priceLabel: 'From Rs. 2,500',
    duration: '1–2 hours',
    icon: '🔒',
    category: 'Installation',
    isActive: true,
    sortOrder: 4,
  },
  {
    title: 'Home Automation',
    description: 'Seamless device integration and smart home control',
    price: 20000,
    priceLabel: 'From Rs. 20,000',
    duration: '2–5 days',
    icon: '🤖',
    category: 'Setup',
    isActive: true,
    sortOrder: 5,
  },
  {
    title: 'Electrical Repair',
    description: 'Professional electrical services and repairs',
    price: 1500,
    priceLabel: 'From Rs. 1,500',
    duration: '1–3 hours',
    icon: '⚡',
    category: 'Repair',
    isActive: true,
    sortOrder: 6,
  },
  {
    title: 'Security System',
    description: 'Complete security system installation and configuration',
    price: 8000,
    priceLabel: 'From Rs. 8,000',
    duration: '1–2 days',
    icon: '🛡️',
    category: 'Installation',
    isActive: true,
    sortOrder: 7,
  },
  {
    title: 'Consultation',
    description: 'Free consultation with our smart home experts',
    price: 0,
    priceLabel: 'FREE',
    duration: '30–60 mins',
    icon: '📋',
    category: 'Consultation',
    isActive: true,
    sortOrder: 8,
  },
];

async function seedServices() {
  try {
    const existingCount = await Service.countDocuments();
    if (existingCount > 0) {
      console.log(`✓ Services already exist (${existingCount} found). Skipping seed.`);
      return;
    }

    await Service.insertMany(DEFAULT_SERVICES);
    console.log(`✓ Successfully seeded ${DEFAULT_SERVICES.length} default services`);
  } catch (err) {
    console.error('✗ Error seeding services:', err.message);
  }
}

module.exports = seedServices;
