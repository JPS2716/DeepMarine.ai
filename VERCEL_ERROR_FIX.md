# 🔧 Vercel Error Fix Guide

## Common Errors & Solutions

### Error: 404 NOT_FOUND

**Cause:** Vercel can't find the serverless function.

**Solution:**
1. Make sure **Root Directory** in Vercel is set to `server`
2. Check that `api/index.js` exists
3. Verify `vercel.json` is in the `server` folder

### Error: Module not found

**Cause:** Dependencies not installed.

**Solution:**
1. In Vercel project settings, make sure:
   - **Install Command:** `npm install`
   - **Root Directory:** `server`

### Error: CORS blocked

**Cause:** Frontend domain not allowed.

**Solution:**
- The code now auto-allows all `*.vercel.app` domains
- No need to set `CORS_ORIGIN` if using Vercel domains

### Error: ROBOFLOW_API_KEY is required

**Cause:** Environment variable not set.

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Add:
   ```
   ROBOFLOW_API_KEY=hP3qf9frGBjadA5nxeTl
   MODEL_NAME=synergia-nmwuj
   ```
3. **Redeploy** after adding variables

## ✅ Correct Vercel Settings

### Backend Project:
- **Root Directory:** `server`
- **Framework:** Other
- **Build Command:** (empty)
- **Output Directory:** (empty)
- **Install Command:** `npm install`

### Environment Variables (Required):
```
ROBOFLOW_API_KEY=hP3qf9frGBjadA5nxeTl
MODEL_NAME=synergia-nmwuj
```

### Environment Variables (Optional):
- `PORT` - Not needed on Vercel
- `CORS_ORIGIN` - Can be empty (auto-allows Vercel domains)

## 🧪 Test After Deployment

```bash
# Test health endpoint
curl https://your-backend.vercel.app/health

# Should return: {"ok":true}
```

## 📝 File Structure

```
server/
├── api/
│   └── index.js          # Vercel serverless handler
├── src/
│   ├── index.js          # Express app
│   └── roboflow.js       # Roboflow integration
├── vercel.json           # Vercel config
└── package.json
```

## 🔄 After Making Changes

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment"
   git push origin main
   ```

2. **Vercel will auto-deploy** (or manually redeploy)

3. **Check deployment logs** in Vercel dashboard

## 🆘 Still Having Issues?

1. Check **Vercel Function Logs:**
   - Go to Deployments → Click deployment → Functions → View logs

2. Check **Build Logs:**
   - Look for errors during build/install

3. Verify **Environment Variables:**
   - Make sure they're set for the correct environment (Production/Preview)

4. Test locally first:
   ```bash
   cd server
   npm install
   npm run dev
   ```

