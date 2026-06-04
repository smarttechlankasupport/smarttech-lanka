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

// ── Trust Proxy (for production on Render) ──
app.set('trust proxy', 1);

console.log('[config] FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('[config] EMAIL_FROM:', process.env.EMAIL_FROM);

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
const frontendUrl = (process.env.FRONTEND_URL || 'https://smarttech-lanka.com').replace(/\/$/, '');
const allowedOrigins = [
  frontendUrl,
  'https://smarttech-lanka.com',
  'https://www.smarttech-lanka.com',
  'http://localhost:3000',
  'http://localhost:5173',
];

const corsOptions = process.env.NODE_ENV === 'development'
  ? {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }
  : {
      origin: (origin, callback) => {
        const normalizedOrigin = origin?.replace(/\/+$/, '');
        if (!origin || allowedOrigins.includes(normalizedOrigin)) {
          return callback(null, true);
        }
        console.warn(`CORS: blocked origin -> ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    };

if (process.env.NODE_ENV === 'development') {
  console.log('CORS: development mode - allowing all origins');
} else {
  console.log('CORS: allowed origins ->', allowedOrigins);
}
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
app.use(['/api/auth', '/auth'], authRouter);
console.log('Auth routes loaded');
app.use('/api/products',   require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/bookings',   require('./routes/bookings'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/reviews',    require('./routes/reviews'));
app.use('/api/coupons',    require('./routes/coupons'));
app.use('/api/admin',      require('./routes/admin'));

// ── Deployment debug route ───────────────────
app.get('/api/deploy-version', (req, res) => {
  res.json({
    success: true,
    version: 'forgot-password-debug-v2',
    time: new Date().toISOString(),
  });
});

// ── Health Check ──────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '⚡ Smart  Tech API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── List All Registered Routes ─────────────────
const listRoutes = () => {
  const routes = [];
  const extractRoutes = (stack, prefix = '') => {
    stack.forEach(layer => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ');
        const fullPath = prefix + layer.route.path;
        routes.push({ path: fullPath, method: methods });
      } else if (layer.name === 'router' && layer.handle.stack) {
        // Extract clean prefix from regex pattern
        let routePrefix = '';
        if (layer.regexp) {
          const source = layer.regexp.source;
          // Handle patterns like ^\\/api\\/auth or ^/api/auth
          const match = source.match(/^\^(.*)\?/);
          if (match) {
            routePrefix = match[1].replace(/\\\//g, '/').replace(/\\/g, '');
          }
        }
        extractRoutes(layer.handle.stack, prefix + routePrefix);
      }
    });
  };
  extractRoutes(app._router.stack);
  console.log('\n📍 Registered Routes:');
  routes
    .filter(r => r.path !== '/' && !r.path.includes('*'))
    .sort((a, b) => a.path.localeCompare(b.path))
    .forEach(r => console.log(`   ${r.method.padEnd(6)} ${r.path}`));
  console.log('\n✅ Auth Routes Check:');
  const authRoutes = routes.filter(r => r.path.includes('/auth'));
  ['login', 'register', 'forgot-password', 'reset-password'].forEach(route => {
    const exists = authRoutes.some(r => r.path.includes(route));
    console.log(`   ${exists ? '✓' : '✗'} POST /api/auth/${route}`);
  });
  console.log('');


};
listRoutes();

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
