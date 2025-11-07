# 🚀 Vercel Deployment Guide

## Environment Variables for Vercel

### 📋 Required Environment Variables

You need to set these in your Vercel project settings:

#### **Backend (Serverless Functions)**

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `MODEL_NAME` | `synergia-nmwuj` | Your Roboflow model name |
| `ROBOFLOW_API_KEY` | `hP3qf9frGBjadA5nxeTl` | Your Roboflow API key |
| `CORS_ORIGIN` | `https://your-frontend-domain.vercel.app` | Your frontend domain (or `*` for all) |
| `PORT` | (optional) | Usually not needed in Vercel |

#### **Frontend (React App)**

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `VITE_API_BASE` | `https://your-backend-api.vercel.app` | Your backend API URL |

---

## 🔧 Step-by-Step Setup

### 1. **Deploy Backend First**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. **Root Directory:** Set to `server`
5. **Framework Preset:** Select "Other" or "Node.js"
6. **Build Command:** Leave empty (or `npm install`)
7. **Output Directory:** Leave empty
8. **Install Command:** `npm install`

### 2. **Set Backend Environment Variables**

In Vercel project settings → Environment Variables:

```
MODEL_NAME=synergia-nmwuj
ROBOFLOW_API_KEY=hP3qf9frGBjadA5nxeTl
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

**Important:** 
- Replace `your-frontend-domain.vercel.app` with your actual frontend URL
- Or use `*` to allow all origins (less secure, for testing only)

### 3. **Update Backend for Vercel**

You may need to create `server/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ]
}
```

### 4. **Deploy Frontend**

1. Create a **new Vercel project** for the frontend
2. **Root Directory:** Set to `client`
3. **Framework Preset:** Select "Vite"
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Install Command:** `npm install`

### 5. **Set Frontend Environment Variables**

In frontend Vercel project settings:

```
VITE_API_BASE=https://your-backend-api.vercel.app
```

**Important:**
- Replace `your-backend-api.vercel.app` with your actual backend URL from step 1
- The URL should be: `https://your-backend-project.vercel.app`

---

## 📝 Quick Reference

### Backend Environment Variables:
```bash
MODEL_NAME=synergia-nmwuj
ROBOFLOW_API_KEY=hP3qf9frGBjadA5nxeTl
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend Environment Variables:
```bash
VITE_API_BASE=https://your-backend.vercel.app
```

---

## 🔍 How to Find Your URLs

1. **Backend URL:**
   - After deploying backend, Vercel gives you a URL like: `https://your-project.vercel.app`
   - Use this for `VITE_API_BASE` in frontend

2. **Frontend URL:**
   - After deploying frontend, Vercel gives you a URL
   - Use this for `CORS_ORIGIN` in backend

---

## ⚠️ Important Notes

1. **CORS Configuration:**
   - Update `CORS_ORIGIN` in backend to match your frontend domain
   - For production, use specific domain (not `*`)

2. **API Routes:**
   - Backend endpoints will be at: `https://your-backend.vercel.app/detect`
   - Frontend will call: `https://your-backend.vercel.app/detect`

3. **Environment Variables:**
   - Set them in **both** Production and Preview environments
   - Or set them once and select "Apply to all environments"

4. **Secrets:**
   - Never commit API keys to git
   - Always use Vercel environment variables for secrets

---

## 🧪 Testing After Deployment

1. **Test Backend:**
   ```bash
   curl https://your-backend.vercel.app/health
   ```
   Should return: `{"ok":true}`

2. **Test Frontend:**
   - Visit your frontend URL
   - Try uploading an image
   - Check browser console for errors

---

## 🔄 Alternative: Monorepo Deployment

If deploying as a single project:

1. Use Vercel's monorepo support
2. Set root directory to project root
3. Configure build commands for both client and server
4. Use `vercel.json` to route requests properly

---

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

