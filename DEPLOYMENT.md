# 🚀 Smart  Tech — Deployment Guide

Complete step-by-step deployment to production.
**Total cost: ~Rs. 3,000/year** (only domain fee — everything else FREE)

---

## 📋 Deployment Checklist

- [ ] Step 1 — MongoDB Atlas (database)
- [ ] Step 2 — Cloudinary (image storage)
- [ ] Step 3 — GitHub (code storage)
- [ ] Step 4 — Render.com (backend)
- [ ] Step 5 — Vercel (frontend)
- [ ] Step 6 — Domain connection

---

## STEP 1 — MongoDB Atlas Setup (FREE)

1. Go to **https://cloud.mongodb.com**
2. Click **"Try Free"** → Create account
3. Choose **FREE tier** (M0 Sandbox)
4. Select region: **Singapore** (closest to Sri Lanka)
5. Create cluster (takes 2 minutes)
6. Click **"Database Access"** → Add New User
   - Username: `smarttech_user`
   - Password: (generate strong password — save it!)
   - Role: **Atlas Admin**
7. Click **"Network Access"** → Add IP Address → **Allow Access From Anywhere** (0.0.0.0/0)
8. Click **"Connect"** → **"Connect your application"**
9. Copy the connection string — looks like:
   ```
   mongodb+srv://smarttech_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/
   ```
10. Add `/smarttech-lanka` at the end:
    ```
    mongodb+srv://smarttech_user:PASSWORD@cluster0.xxxxx.mongodb.net/smarttech-lanka
    ```
11. Save this — this is your `MONGO_URI`

---

## STEP 2 — Cloudinary Setup (FREE)

1. Go to **https://cloudinary.com**
2. Click **"Sign Up Free"**
3. After login, go to **Dashboard**
4. Copy these 3 values:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

---

## STEP 3 — GitHub Setup (FREE)

1. Go to **https://github.com** → Create account
2. Click **"New Repository"**
   - Name: `smarttech-lanka`
   - Private: YES (keep code safe)
3. Upload your project:
   ```bash
   # In your smarttech-lanka folder
   git init
   git add .
   git commit -m "Initial commit — Smart  Tech"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/smarttech-lanka.git
   git push -u origin main
   ```

---

## STEP 4 — Render.com Backend Deployment (FREE)

1. Go to **https://render.com** → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo `smarttech-lanka`
4. Configure:
   ```
   Name:            smarttech-lanka-api
   Root Directory:  backend
   Runtime:         Node
   Build Command:   npm install
   Start Command:   npm start
   Plan:            Free
   ```
5. Click **"Advanced"** → **"Add Environment Variable"**
6. Add ALL these variables one by one:
   ```
   NODE_ENV          = production
   FRONTEND_URL      = https://smarttechlanka.vercel.app
   MONGO_URI         = mongodb+srv://...  (your Atlas URI)
   JWT_SECRET        = (paste a long random string)
   JWT_EXPIRE        = 30d
   CLOUDINARY_CLOUD_NAME = (from step 2)
   CLOUDINARY_API_KEY    = (from step 2)
   CLOUDINARY_API_SECRET = (from step 2)
   ADMIN_EMAIL       = admin@smarttechlanka.lk
   ADMIN_PASSWORD    = Admin@2025!
   WHATSAPP_NUMBER   = 94771234567
   ```
7. Click **"Create Web Service"**
8. Wait 3-5 minutes for deployment
9. Your API URL will be: `https://smarttech-lanka-api.onrender.com`

   **⚠️ Note:** Free Render servers sleep after 15 min inactivity. Upgrade to paid ($7/mo) for always-on.

10. Seed the database via Render Shell:
    ```bash
    # In Render dashboard → Your service → Shell tab
    npm run seed
    ```

---

## STEP 5 — Vercel Frontend Deployment (FREE)

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **"Add New Project"**
3. Import your `smarttech-lanka` repo
4. Configure:
   ```
   Framework Preset:  Next.js
   Root Directory:    frontend
   ```
5. Click **"Environment Variables"** and add:
   ```
   NEXT_PUBLIC_API_URL              = https://smarttech-lanka-api.onrender.com/api
   NEXT_PUBLIC_SITE_URL             = https://smarttechlanka.vercel.app
   NEXT_PUBLIC_SITE_NAME            = Smart  Tech
   NEXT_PUBLIC_WHATSAPP_NUMBER      = 94771234567
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = (your cloud name)
   ```
6. Click **"Deploy"** — takes 2 minutes
7. Your site will be live at: `https://smarttech-lanka.vercel.app`

---

## STEP 6 — Connect Custom Domain (smarttechlanka.lk)

### Buy the domain:
- **domains.lk** (local, Rs. ~3,000/year)
- or **GoDaddy.com** (international)

### Connect to Vercel:
1. In Vercel → Your project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Type: `smarttechlanka.lk`
4. Vercel shows you DNS records like:
   ```
   Type: A       Name: @    Value: 76.76.19.61
   Type: CNAME   Name: www  Value: cname.vercel-dns.com
   ```
5. Go to your domain registrar (domains.lk or GoDaddy)
6. Find **DNS Settings** → Add those records
7. Wait 10-30 minutes for DNS to propagate
8. ✅ **https://smarttechlanka.lk is now LIVE!**

### Connect API to your domain (optional):
- In Render → Settings → Custom Domain → `api.smarttechlanka.lk`
- Add CNAME record pointing to your Render URL

---

## STEP 7 — Update Environment Variables for Production

After domain is connected, update these:

**Render (backend):**
```
FRONTEND_URL = https://smarttechlanka.lk
```

**Vercel (frontend):**
```
NEXT_PUBLIC_API_URL  = https://api.smarttechlanka.lk/api
NEXT_PUBLIC_SITE_URL = https://smarttechlanka.lk
```

Then redeploy both services.

---

## 🔄 Auto-Deployment (After first setup)

Every time you push code to GitHub:
- **Vercel** auto-deploys frontend ✅
- **Render** auto-deploys backend ✅

```bash
# Make a change, then:
git add .
git commit -m "Updated product page"
git push
# ← Both Vercel + Render automatically update within 2 minutes
```

---

## 📊 Cost Summary

| Service | Cost | Notes |
|---------|------|-------|
| MongoDB Atlas | FREE | 512MB storage |
| Cloudinary | FREE | 10GB images |
| Render.com | FREE | Sleeps after 15min |
| Render.com Starter | $7/month | Always-on (recommended) |
| Vercel | FREE | Unlimited deployments |
| Domain (.lk) | ~Rs. 3,000/year | smarttechlanka.lk |
| **Total (free tier)** | **~Rs. 3,000/year** | |
| **Total (production)** | **~Rs. 4,200/year** | With Render paid |

---

## 🆘 Troubleshooting

**Backend not connecting to MongoDB:**
- Check if IP 0.0.0.0/0 is whitelisted in Atlas Network Access
- Verify MONGO_URI has correct password

**Images not uploading:**
- Check Cloudinary API keys are correct
- Make sure CLOUDINARY_CLOUD_NAME has no spaces

**Frontend can't reach backend:**
- Check NEXT_PUBLIC_API_URL is set correctly
- Make sure FRONTEND_URL in Render matches your Vercel domain

**Admin panel not accessible:**
- Run seed: `npm run seed` to create admin account
- Login: admin@smarttechlanka.lk / Admin@2025!

