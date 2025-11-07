# 🔧 Vercel Deployment Fix Guide

## Problem: 404 NOT_FOUND Error

This happens because Vercel needs specific configuration for Express apps.

## ✅ Solution Applied

I've created the necessary files for Vercel deployment:

### Files Created:
1. `server/api/index.js` - Vercel serverless function handler
2. `server/vercel.json` - Vercel configuration
3. Updated `server/src/index.js` - Works both locally and on Vercel

## 📋 Deployment Steps

### 1. **Deploy Backend to Vercel**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `JPS2716/DeepMarine.ai`
4. **Root Directory:** Set to `server`
5. **Framework Preset:** Select **"Other"**
6. **Build Command:** Leave empty
7. **Output Directory:** Leave empty
8. **Install Command:** `npm install`

### 2. **Set Environment Variables**

In Vercel project settings → Environment Variables, add:

```
MODEL_NAME=synergia-nmwuj
ROBOFLOW_API_KEY=hP3qf9frGBjadA5nxeTl
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

**Important:** 
- Replace `your-frontend-domain.vercel.app` with your actual frontend URL
- Or use `*` for testing (less secure)

### 3. **Deploy**

Click **"Deploy"** and wait for it to complete.

### 4. **Test Backend**

After deployment, test the endpoints:

```bash
# Health check
curl https://your-backend.vercel.app/health

# Should return: {"ok":true}
```

### 5. **Deploy Frontend**

1. Create a **new Vercel project** for frontend
2. **Root Directory:** Set to `client`
3. **Framework Preset:** Select **"Vite"**
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Install Command:** `npm install`

### 6. **Set Frontend Environment Variable**

```
VITE_API_BASE=https://your-backend.vercel.app
```

Replace `your-backend.vercel.app` with your backend URL from step 3.

## 🔍 Troubleshooting

### If you still get 404:

1. **Check Root Directory:**
   - Backend: Must be `server`
   - Frontend: Must be `client`

2. **Check Build Settings:**
   - Backend: No build command needed
   - Frontend: Build command = `npm run build`

3. **Check Environment Variables:**
   - All required variables are set
   - No typos in variable names

4. **Check Vercel Logs:**
   - Go to Deployments → Click on deployment → View Function Logs
   - Look for errors

5. **Verify Routes:**
   - `/health` should work
   - `/detect` should work

## 📝 File Structure for Vercel

```
server/
├── api/
│   └── index.js          # Vercel serverless handler
├── src/
│   ├── index.js          # Express app (exports app)
│   └── roboflow.js       # Roboflow integration
├── vercel.json           # Vercel configuration
└── package.json
```

## ✅ What Changed

1. **server/src/index.js:**
   - Exports Express app for Vercel
   - Only starts server locally (not on Vercel)

2. **server/api/index.js:**
   - Vercel serverless function handler
   - Routes all requests to Express app

3. **server/vercel.json:**
   - Configures Vercel to use `api/index.js`
   - Routes all paths to the handler

## 🚀 Quick Deploy Commands

After pushing to GitHub:

```bash
# Push latest changes
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

Then deploy from Vercel dashboard (it auto-deploys from GitHub).

## 📞 Still Having Issues?

1. Check Vercel deployment logs
2. Verify environment variables are set
3. Make sure root directory is correct
4. Test `/health` endpoint first

