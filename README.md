# ⚡ Smart  Tech — Full Stack E-Commerce

> Sri Lanka's #1 Smart Home Solutions — Complete production-ready web application.

**Stack:** Next.js 14 · Node.js · Express · MongoDB Atlas · Cloudinary · Vercel · Render

---

## 📁 Project Structure

```
smarttech-lanka/
├── frontend/          ← Next.js 14 (deployed on Vercel)
└── backend/           ← Node.js + Express (deployed on Render)
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites — Install these first:
| Tool | Download | Why |
|------|----------|-----|
| Node.js v18+ | nodejs.org | Run JavaScript |
| VS Code | code.visualstudio.com | Code editor |
| Git | git-scm.com | Version control |
| MongoDB Compass | mongodb.com/compass | View database |

---

### Step 1 — Clone / Open Project

```bash
# Open the smarttech-lanka folder in VS Code
# Then open two terminals — one for backend, one for frontend
```

---

### Step 2 — Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# ← Now open .env and fill in your values (see below)

# Seed the database with sample data + admin account
npm run seed

# Start backend server
npm run dev
# ✅ Backend running at http://localhost:5000
```

---

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# ← Fill in your values

# Start frontend
npm run dev
# ✅ Frontend running at http://localhost:3000 (or the port Next.js prints if 3000 is in use)
```

---

### Step 4 — Open in Browser

```
Website:     http://localhost:3000  (or the active dev port shown by Next.js)
Admin Panel: http://localhost:3000/admin  (or the active dev port shown by Next.js)
API Health:  http://localhost:5000
```

**Default Admin Login:**
- Email: `admin@smarttechlanka.lk`
- Password: `Admin@2025!`

---

## 🔑 Environment Variables

### backend/.env
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB Atlas (get from cloud.mongodb.com)
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/smarttech-lanka

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=30d

# Cloudinary (get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Smart  Tech <smarttechee2026@gmail.com>

# First Admin
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@smarttechlanka.lk
ADMIN_PASSWORD=Admin@2025!

# WhatsApp
WHATSAPP_NUMBER=94771234567
```

### frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # change if Next.js uses a different local port
NEXT_PUBLIC_SITE_NAME=Smart  Tech
NEXT_PUBLIC_WHATSAPP_NUMBER=94771234567
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

## 📦 All API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/products | List products (+ filters) |
| POST | /api/products | Create product (admin) |
| PUT | /api/products/:id | Update product (admin) |
| DELETE | /api/products/:id | Delete product (admin) |
| GET | /api/categories | All categories |
| POST | /api/orders | Place order |
| GET | /api/orders/my | My orders |
| GET | /api/orders | All orders (admin) |
| PUT | /api/orders/:id/status | Update order status (admin) |
| POST | /api/bookings | Create service booking |
| GET | /api/bookings | All bookings (admin) |
| POST | /api/coupons/validate | Validate coupon |
| GET | /api/admin/stats | Dashboard stats (admin) |

---

## 🗄️ Database Collections

| Collection | Purpose |
|-----------|---------|
| users | Customers + admins |
| products | All products |
| categories | Product categories |
| orders | Customer orders |
| bookings | Service bookings |
| reviews | Product reviews |
| coupons | Discount codes |

---

## 🌐 Deployment

See **DEPLOYMENT.md** for full Vercel + Render + MongoDB Atlas guide.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Images | Cloudinary CDN |
| Frontend Host | Vercel (free) |
| Backend Host | Render.com (free) |
| Domain | smarttechlanka.lk |

---

## 📞 Support

- WhatsApp: +94 77 123 4567
- Email: info@smarttechlanka.lk

