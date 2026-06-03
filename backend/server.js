// ============================================
// Smart  Tech - Main Express Server
// ============================================
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// ── Security Middleware ──────────────────────
app.use(helmet());

// ── Rate Limiting (100 requests / 15 min per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ── CORS ────────────────────────────────────
// For development, allow all origins to simplify local debugging (cookies still allowed).
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: true, credentials: true }));
  console.log('CORS: development mode - allowing all origins');
} else {
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://smarttechlanka.lk',
    'https://www.smarttechlanka.lk',
    'https://smarttech-lanka.vercel.app',
  ];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`CORS: blocked origin -> ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));
}

// ── Body Parsing ─────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logger (development only) ─────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Startup log to confirm server reaches route-loading phase
console.log('SERVER STARTED - LOADING ROUTES');

// ── API Routes ────────────────────────────────
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);
console.log('Auth routes loaded');
app.use('/api/products',   require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/bookings',   require('./routes/bookings'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/reviews',    require('./routes/reviews'));
app.use('/api/coupons',    require('./routes/coupons'));
app.use('/api/admin',      require('./routes/admin'));

// ── Health Check ──────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '⚡ Smart  Tech API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ───────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = parseInt(process.env.PORT, 10) || 5000;
let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err.message);
    process.exit(1);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  if (server && server.close) server.close(() => process.exit(1));
});
