# Environment Variables Setup

## 🔐 Important: Never commit .env files to git!

All sensitive API keys and configuration should be stored in `.env` files, which are excluded from git.

## 📁 Required Environment Files

### 1. Server Environment (`server/.env`)

Create `server/.env` file with the following:

```bash
# Server Configuration
PORT=5050
CORS_ORIGIN=http://localhost:5173,http://localhost:5175

# Roboflow API Configuration
MODEL_NAME=synergia-nmwuj
ROBOFLOW_API_KEY=your_roboflow_api_key_here

# Optional: Allow any localhost port in development
# CORS_ALLOW_LOCALHOST_ANY=true
```

**Required Variables:**
- `ROBOFLOW_API_KEY` - Your Roboflow API key (required)
- `MODEL_NAME` - Your Roboflow model name (defaults to `synergia-nmwuj`)

**Optional Variables:**
- `PORT` - Backend server port (defaults to 5050)
- `CORS_ORIGIN` - Allowed frontend origins (comma-separated)

### 2. Client Environment (`client/.env`) - Optional

Create `client/.env` file if you want to manually set the backend URL:

```bash
# Optional: Set backend API base URL manually
# If not set, frontend will auto-discover backend on ports 5050-5060
VITE_API_BASE=http://localhost:5050
```

## 🚀 Quick Setup

1. **Copy the example template:**
   ```bash
   cd server
   cp .env.example .env  # If .env.example exists
   ```

2. **Edit `server/.env` and add your API key:**
   ```bash
   ROBOFLOW_API_KEY=hP3qf9frGBjadA5nxeTl
   MODEL_NAME=synergia-nmwuj
   ```

3. **Verify .env is in .gitignore:**
   - Check that `server/.env` is listed in `.gitignore`
   - Never commit `.env` files!

## ✅ Verification

After setting up `.env` files:

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Check console for:
   - ✅ Server running on port 5050
   - ✅ No "ROBOFLOW_API_KEY is required" errors

## 🔒 Security Best Practices

- ✅ `.env` files are in `.gitignore` (already configured)
- ✅ Never commit API keys to git
- ✅ Use different API keys for development and production
- ✅ Rotate API keys if accidentally exposed

## 📝 Example .env File

```bash
# server/.env
PORT=5050
CORS_ORIGIN=http://localhost:5173,http://localhost:5175
MODEL_NAME=synergia-nmwuj
ROBOFLOW_API_KEY=hP3qf9frGBjadA5nxeTl
```

