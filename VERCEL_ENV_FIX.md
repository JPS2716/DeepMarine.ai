# 🔧 Fix Vercel Environment Variables

## ❌ Current Issue

Your `CORS_ORIGIN` is set to `localhost`, which won't work in production on Vercel.

## ✅ Solution

### Update CORS_ORIGIN in Vercel:

1. Go to **Vercel Dashboard** → Your Backend Project → **Settings** → **Environment Variables**

2. Find `CORS_ORIGIN` and update it to:

   **Option 1: Use your actual frontend Vercel URL**
   ```
   https://your-frontend-project.vercel.app
   ```
   Replace `your-frontend-project` with your actual frontend project name.

   **Option 2: Allow all Vercel domains (easier for testing)**
   ```
   https://*.vercel.app
   ```
   Or just leave it empty - the code now automatically allows all `*.vercel.app` domains!

   **Option 3: Allow all origins (for testing only)**
   ```
   *
   ```
   ⚠️ Less secure, only for testing!

### Recommended Environment Variables:

```
PORT=5050
ROBOFLOW_API_KEY=hP3qf9frGBjadA5nxeTl
MODEL_NAME=synergia-nmwuj
CORS_ORIGIN=https://your-frontend.vercel.app
```

Or simply:
```
ROBOFLOW_API_KEY=hP3qf9frGBjadA5nxeTl
MODEL_NAME=synergia-nmwuj
```

(Leave CORS_ORIGIN empty - code now auto-allows Vercel domains!)

## 🔄 After Updating

1. **Redeploy** your backend project in Vercel
2. The new CORS settings will take effect
3. Test your frontend → it should work now!

## 🧪 Test

After redeploying, test the backend:

```bash
curl https://your-backend.vercel.app/health
```

Should return: `{"ok":true}`

## 📝 What Changed

I updated the code to:
- ✅ Automatically allow all `*.vercel.app` domains
- ✅ Better CORS error logging
- ✅ More flexible CORS configuration

You can now either:
1. Set `CORS_ORIGIN` to your specific frontend URL, OR
2. Leave it empty and it will auto-allow Vercel domains

