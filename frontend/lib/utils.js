/* ============================================
   frontend/lib/utils.js
   Purpose: Shared utility/helper functions
   ============================================ */

// Format price in Sri Lankan Rupees
export const formatPrice = (amount) => {
  if (amount == null) return 'Rs. 0';
  return `Rs. ${Number(amount).toLocaleString('en-LK')}`;
};

// Calculate discount percentage
export const calcDiscount = (original, current) => {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};

// Truncate long text
export const truncate = (text, len = 80) => {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '...' : text;
};

// Build WhatsApp link
export const buildWhatsAppLink = (product, qty = 1) => {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94717336524';
  const msg = encodeURIComponent(
    `Hi Smart  Tech! 👋\n\nI want to order:\n📦 *${product.name}*\n💰 Price: ${formatPrice(product.price)}\n🔢 Qty: ${qty}\n\nPlease confirm availability.`
  );
  return `https://wa.me/${num}?text=${msg}`;
};

// Build WhatsApp for cart
export const buildCartWhatsApp = (items, total) => {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94717336524';
  const itemLines = items.map(i => `• ${i.name} x${i.qty} — ${formatPrice(i.price * i.qty)}`).join('\n');
  const msg = encodeURIComponent(`Hi Smart  Tech! 👋\n\nI want to place an order:\n\n${itemLines}\n\n💰 *Total: ${formatPrice(total)}*\n\nPlease confirm my order!`);
  return `https://wa.me/${num}?text=${msg}`;
};

// Format date
export const formatDate = (dateStr, opts = {}) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', ...opts });
  } catch { return dateStr; }
};

// Format date + time
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
};

// Get order status badge class
export const getStatusBadgeClass = (status) => {
  const map = {
    pending:    'badge-pending',
    confirmed:  'badge-confirmed',
    processing: 'badge',
    shipped:    'badge',
    delivered:  'badge',
    cancelled:  'badge',
    completed:  'badge',
    'in-progress': 'badge',
  };
  return map[status] || 'badge';
};

// Generate star array for ratings
export const getStars = (rating) => {
  return [1, 2, 3, 4, 5].map(i => ({
    filled: i <= Math.floor(rating),
    half:   i === Math.ceil(rating) && rating % 1 !== 0,
  }));
};

// Slugify text
export const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Get image URL with fallback
export const imgUrl = (images, index = 0) => {
  if (images && images.length > index && images[index]?.url) return images[index].url;
  return `https://via.placeholder.com/400x400/121212/f8f8f8?text=SmartTech`;
};

// Clamp number
export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// Debounce
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
};

// Local storage helpers
export const storage = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  remove: (key) => {
    try { localStorage.removeItem(key); } catch {}
  },
};

// Sri Lankan districts
export const SL_DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambantota','Jaffna','Mannar','Vavuniya',
  'Trincomalee','Batticaloa','Ampara','Kurunegala','Puttalam',
  'Anuradhapura','Polonnaruwa','Badulla','Monaragala','Ratnapura','Kegalle',
];

// Service types
export const SERVICE_TYPES = [
  'Smart Home Setup','CCTV Installation','Smart Lighting',
  'Smart Lock Installation','Home Automation','Electrical Repair',
  'Security System','Consultation','Other',
];

// Time slots for service booking
export const TIME_SLOTS = [
  '8:00 AM - 10:00 AM','10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM','2:00 PM - 4:00 PM','4:00 PM - 6:00 PM',
];
