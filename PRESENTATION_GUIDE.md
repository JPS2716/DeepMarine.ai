# 🎯 Roboflow Object Detection App - Presentation Guide

## 📋 Project Overview

**What it does:** A full-stack web application that performs real-time object detection using Roboflow's AI model. Users can upload images, use live webcam, or upload videos to detect objects with bounding boxes, labels, confidence scores, and spatial metrics.

**Tech Stack:**
- **Frontend:** React 18 + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **AI Service:** Roboflow Detection API (Model: `synergia-nmwuj`, Version 3)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   React Frontend│  HTTP   │  Express Backend│  HTTP   │  Roboflow API    │
│   (Port 5173)   │─────────▶│   (Port 5050)   │─────────▶│  (Cloud Service)│
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

**Separation of Concerns:**
- **Frontend:** User interface, image/video capture, visualization
- **Backend:** API gateway, file handling, Roboflow integration
- **Roboflow:** AI inference engine (external service)

---

## 📁 Project Structure

```
roboflow/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── App.jsx           # Main app with tab navigation
│   │   ├── components/
│   │   │   ├── UploadDetector.jsx      # Image upload mode
│   │   │   ├── LiveDetector.jsx        # Webcam live detection
│   │   │   ├── VideoUploadDetector.jsx # Video upload mode
│   │   │   └── CanvasOverlay.jsx       # Draws bounding boxes
│   │   └── lib/
│   │       └── api.js        # HTTP client (auto-discovers backend)
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── index.js          # Express server + routes
│   │   └── roboflow.js       # Roboflow API integration
│   └── package.json
│
└── package.json              # Root scripts (runs both servers)
```

---

## 🔄 Data Flow (How It Works)

### **1. Image Upload Flow**

```
User uploads image
    ↓
UploadDetector.jsx captures file
    ↓
Converts to Blob
    ↓
api.js → POST /detect (multipart/form-data)
    ↓
Express receives file via Multer
    ↓
roboflow.js forwards to Roboflow API
    ↓
Roboflow returns predictions JSON
    ↓
Frontend receives { predictions: [...] }
    ↓
CanvasOverlay.jsx draws bounding boxes
    ↓
Display: labels, confidence, size, distance, angle
```

### **2. Live Camera Flow**

```
User clicks "Start Camera"
    ↓
LiveDetector.jsx requests getUserMedia()
    ↓
Browser grants camera access
    ↓
Video element displays live feed
    ↓
Every 500ms: capture frame → convert to Blob
    ↓
Send to /detect endpoint (same as image flow)
    ↓
Update predictions in real-time
    ↓
Canvas overlay redraws boxes on video
```

### **3. Video Upload Flow**

```
User uploads video file
    ↓
VideoUploadDetector.jsx creates object URL
    ↓
HTML5 <video> element plays video
    ↓
On play: start interval timer (configurable FPS)
    ↓
Each frame: capture → send to /detect
    ↓
Display detections as video plays
```

---

## 🔌 Integration Points

### **Frontend ↔ Backend**

**Location:** `client/src/lib/api.js`

**How it works:**
1. **Auto-discovery:** Scans ports 5050-5060, calls `/health` to find backend
2. **Caching:** Stores discovered port to avoid repeated scans
3. **API call:** `detectImageBlob(blob)` → POST to `${base}/detect`

**Key Code:**
```javascript
// Discovers backend automatically
async function discoverBase() {
  // Tries ports 5050-5060, finds first /health that responds
}

// Sends image to backend
export async function detectImageBlob(blob) {
  const base = await discoverBase();
  const form = new FormData();
  form.append('file', blob, 'frame.jpg');
  return fetch(`${base}/detect`, { method: 'POST', body: form });
}
```

### **Backend ↔ Roboflow**

**Location:** `server/src/roboflow.js`

**How it works:**
1. Receives image buffer from Express
2. Creates FormData with image
3. POSTs to: `https://detect.roboflow.com/synergia-nmwuj/3?api_key=...`
4. Returns predictions JSON

**Key Code:**
```javascript
const url = `https://detect.roboflow.com/${MODEL_NAME}/${version}?api_key=${ROBOFLOW_API_KEY}`;
const form = new FormData();
form.append("file", buffer, { filename: originalName, contentType: mimeType });
const { data } = await axios.post(url, form, { headers: form.getHeaders() });
return data; // { predictions: [{ class, confidence, x, y, width, height }] }
```

### **Express Routes**

**Location:** `server/src/index.js`

**Endpoints:**
- `GET /health` - Health check (used by frontend auto-discovery)
- `POST /detect` - Main detection endpoint
  - Accepts: `multipart/form-data` with key `file`
  - Returns: `{ predictions: [...] }`

**Middleware:**
- **CORS:** Allows frontend origins (5173, 5175)
- **Multer:** Handles file uploads (in-memory storage)
- **Morgan:** HTTP request logging

---

## 🎨 Frontend Components Explained

### **1. App.jsx** (Main Container)
- **Purpose:** Tab navigation between 3 modes
- **State:** `tab` ('upload' | 'live' | 'video')
- **Renders:** Conditionally shows one component based on active tab

### **2. UploadDetector.jsx** (Image Upload)
- **Features:**
  - File input (accepts images)
  - Image preview
  - Sends file to backend on selection
  - Displays detections with metrics

### **3. LiveDetector.jsx** (Webcam)
- **Features:**
  - `getUserMedia()` for camera access
  - Video element for live feed
  - Interval timer (500ms) captures frames
  - Real-time detection updates

### **4. VideoUploadDetector.jsx** (Video Upload)
- **Features:**
  - File input (accepts videos)
  - HTML5 video player with controls
  - Configurable FPS slider
  - Detects objects as video plays

### **5. CanvasOverlay.jsx** (Visualization)
- **Purpose:** Draws bounding boxes on images/videos
- **How:**
  - Absolute positioned `<canvas>` overlays media
  - Calculates scale (display size vs natural size)
  - Draws green boxes, labels, confidence scores
  - Updates on prediction changes

---

## 📊 Detection Metrics Explained

Each detection shows:
- **Class:** Object label (from Roboflow model)
- **Confidence:** Percentage (0-100%)
- **Size:** Width × Height in pixels
- **Distance:** Pixel distance from image center to detection center
- **Angle:** Degrees from center (0° = right, 90° = down, -90° = up)

**Calculation:**
```javascript
const cx = imageWidth / 2;  // Center X
const cy = imageHeight / 2; // Center Y
const dx = detection.x - cx;
const dy = detection.y - cy;
const distance = Math.sqrt(dx² + dy²);
const angle = Math.atan2(dy, dx) * (180 / π);
```

---

## 🔧 Key Features & Solutions

### **1. Auto Port Discovery**
- **Problem:** Backend might run on different ports (5050, 5051, etc.)
- **Solution:** Frontend scans ports 5050-5060, finds `/health` endpoint
- **Benefit:** No manual configuration needed

### **2. CORS Handling**
- **Problem:** Browser blocks cross-origin requests
- **Solution:** Express CORS middleware allows specific origins
- **Config:** Supports multiple origins (5173, 5175) or wildcard localhost

### **3. Port Conflict Resolution**
- **Problem:** Port 5050 might be in use
- **Solution:** Server auto-tries next port (5051, 5052, etc.)
- **Logs:** Clear messages showing which port is used

### **4. Real-time Processing**
- **Live Camera:** Captures frames every 500ms
- **Video:** Configurable FPS (1-10 frames/second)
- **Optimization:** Throttled requests prevent overload

---

## 🚀 How to Run

### **Development:**
```bash
# Install all dependencies
npm run install:all

# Start both servers
npm run dev
```

**What happens:**
- Backend starts on port 5050 (or next available)
- Frontend starts on port 5173
- Both run concurrently with auto-reload

### **Production:**
```bash
# Build frontend
cd client && npm run build

# Start backend only
cd server && npm start
```

---

## 🎯 Presentation Talking Points

1. **"Full-Stack Architecture"**
   - Clear separation: React frontend, Express backend, Roboflow AI
   - RESTful API design
   - Modern development practices

2. **"Three Detection Modes"**
   - Image upload (static analysis)
   - Live webcam (real-time)
   - Video upload (frame-by-frame)

3. **"Smart Integration"**
   - Auto-discovers backend port
   - Handles CORS automatically
   - Robust error handling

4. **"Rich Visualizations"**
   - Bounding boxes with labels
   - Confidence scores
   - Spatial metrics (distance, angle, size)

5. **"Production Ready"**
   - Error handling
   - Loading states
   - Port conflict resolution
   - Logging for debugging

---

## 📝 Key Files Summary

| File | Purpose |
|------|---------|
| `client/src/App.jsx` | Main app, tab navigation |
| `client/src/lib/api.js` | HTTP client, auto-discovery |
| `client/src/components/*.jsx` | Detection mode components |
| `server/src/index.js` | Express server, routes, middleware |
| `server/src/roboflow.js` | Roboflow API integration |
| `package.json` (root) | Scripts to run both servers |

---

## 🎤 Demo Flow (For Presentation)

1. **Show Architecture:** Explain frontend → backend → Roboflow
2. **Upload Image:** Demonstrate image detection with metrics
3. **Live Camera:** Show real-time detection (if camera available)
4. **Video Upload:** Show video processing
5. **Explain Metrics:** Point out distance, angle, size calculations
6. **Show Code:** Highlight key integration points (api.js, roboflow.js)

---

## 💡 Technical Highlights

- **React Hooks:** useState, useEffect, useRef for state management
- **Canvas API:** For drawing bounding boxes
- **MediaDevices API:** getUserMedia for webcam
- **FormData API:** For multipart file uploads
- **Axios:** HTTP client for backend → Roboflow
- **Multer:** Express middleware for file handling
- **TailwindCSS:** Utility-first CSS framework

---

Good luck with your presentation! 🎉

