# Roboflow Object Detection Web App

Full-stack app (React + Tailwind frontend, Node.js + Express backend) that performs object detection using a Roboflow model. Supports image upload and live webcam detection.

## Features
- Upload an image and visualize detections with bounding boxes + labels + confidence
- Use camera (getUserMedia) to run periodic detections on video frames
- Clean, modern UI with TailwindCSS

## 🔐 Environment Setup (Required)

**IMPORTANT:** API keys are stored in `.env` files which are excluded from git for security.

### 1. Create `server/.env` file:

```bash
cd server
# Create .env file with your API keys
```

Required variables:
```bash
PORT=5050
CORS_ORIGIN=http://localhost:5173,http://localhost:5175
MODEL_NAME=synergia-nmwuj
ROBOFLOW_API_KEY=your_roboflow_api_key_here
```

**⚠️ Never commit `.env` files to git!** They are already in `.gitignore`.

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions.

### 2. Roboflow Configuration

- **MODEL_NAME**: Your Roboflow model name (e.g., `synergia-nmwuj`)
- **ROBOFLOW_API_KEY**: Your Roboflow API key (required)
- **Version**: Currently using version 3 (configurable in code)

## Getting Started
From the project root:

```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Run both servers in dev mode
npm run dev
```

- Backend runs on `http://localhost:5050`
- Frontend runs on `http://localhost:5173`

If you prefer to run separately:
```bash
# Terminal 1
cd server && npm install && npm run dev

# Terminal 2
cd client && npm install && npm run dev
```

## Frontend
- Built with Vite + React + TailwindCSS
- Two modes via buttons on the home screen:
  - "Upload Image": pick a file, see preview and detections
  - "Start Live Camera Detection": uses webcam and periodically sends frames
- Detections are drawn on a Canvas overlay with labels and confidence

## Backend
- Express server with `/detect`
- Accepts `multipart/form-data` with `file`
- Forwards image to Roboflow endpoint:
  - `POST https://detect.roboflow.com/${MODEL_NAME}/1?api_key=...`
- Returns JSON `{ predictions: [...] }`

## 📦 Git Setup

This repository is connected to: `https://github.com/JPS2716/DeepMarine.ai.git`

### First Time Setup:
```bash
# Initialize git (already done)
git init

# Add remote (already done)
git remote add origin https://github.com/JPS2716/DeepMarine.ai.git

# Add files
git add .

# Commit
git commit -m "Initial commit: Roboflow Object Detection App"

# Push to GitHub
git push -u origin main
```

### Important Git Rules:
- ✅ `.env` files are in `.gitignore` - they won't be committed
- ✅ Never commit API keys or sensitive data
- ✅ Always check `git status` before committing

## 🔒 Security Notes

- **API Keys**: Stored in `server/.env` (excluded from git)
- **Never commit**: `.env` files contain sensitive credentials
- **Environment Variables**: All sensitive data uses environment variables
- **CORS**: Configured to allow localhost origins only

## 📝 Notes

- Ensure you set `MODEL_NAME` and `ROBOFLOW_API_KEY` in `server/.env`
- You can change the CORS origin via `CORS_ORIGIN` in `.env`
- For production, run `npm run start` at the root to start backend only
- See [ENV_SETUP.md](./ENV_SETUP.md) for detailed environment setup

## License
MIT


