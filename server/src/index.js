const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const multer = require("multer");
const dotenv = require("dotenv");
const { forwardToRoboflow } = require("./roboflow");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5050;

// Allow frontend dev server by default (supports multiple comma-separated origins)
const RAW_CORS =
  process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5175";
const ALLOWED_ORIGINS = RAW_CORS.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // non-browser clients
      
      // Check allowed origins from env
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow localhost in development
      if (/^http:\/\/localhost:\d+$/.test(origin)) {
        // eslint-disable-next-line no-console
        console.log("CORS: Allowing localhost origin:", origin);
        return callback(null, true);
      }
      
      // Allow Vercel domains (for production)
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
        // eslint-disable-next-line no-console
        console.log("CORS: Allowing Vercel origin:", origin);
        return callback(null, true);
      }
      
      // Allow any https origin in production if explicitly enabled
      if (process.env.CORS_ALLOW_ALL === "true" && /^https:\/\//.test(origin)) {
        // eslint-disable-next-line no-console
        console.log("CORS: Allowing all HTTPS origin:", origin);
        return callback(null, true);
      }
      
      // eslint-disable-next-line no-console
      console.warn("CORS: Blocked origin:", origin, "Allowed:", ALLOWED_ORIGINS);
      return callback(new Error(`CORS blocked for origin ${origin}`));
    },
    credentials: true,
  })
);
app.use(morgan("dev"));

// Multer in-memory storage for simplicity
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Ensure CORS preflight is handled explicitly for some environments/tools
app.options("/detect", cors());

// POST /detect - accepts multipart/form-data with `file`
app.post("/detect", upload.single("file"), async (req, res) => {
  try {
    // eslint-disable-next-line no-console
    console.log("/detect received", {
      hasFile: Boolean(req.file),
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size,
    });
    if (!req.file) {
      return res
        .status(400)
        .json({ error: 'No file uploaded. Use form-data with key "file".' });
    }

    // Optionally allow client to specify model version via query, else default 3
    const version = req.query.version || "3";
    // eslint-disable-next-line no-console
    console.log("forwarding to Roboflow...");
    const response = await forwardToRoboflow({
      buffer: req.file.buffer,
      originalName: req.file.originalname || "upload.jpg",
      mimeType: req.file.mimetype || "image/jpeg",
      version,
    });

    res.json(response);
  } catch (err) {
    // Avoid leaking axios internals
    const status = err.response?.status || 500;
    const data = err.response?.data || { error: err.message };
    // eslint-disable-next-line no-console
    console.error("/detect error", { status, data, message: err.message });
    res.status(status).json(data);
  }
});

// Export for Vercel serverless functions
module.exports = app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== "1" && !process.env.VERCEL_ENV) {
  function startServer(desiredPort, attemptsLeft = 20) {
    const server = app
      .listen(desiredPort, () => {
        // eslint-disable-next-line no-console
        console.log(`✅ Server running on port ${desiredPort}`);
        // eslint-disable-next-line no-console
        console.log("CORS allowed origins:", ALLOWED_ORIGINS.join(", "));
      })
      .on("error", (err) => {
        if (err && err.code === "EADDRINUSE" && attemptsLeft > 0) {
          const nextPort = desiredPort + 1;
          // eslint-disable-next-line no-console
          console.warn(
            `⚠️ Port ${desiredPort} in use, switched to ${nextPort} instead.`
          );
          startServer(nextPort, attemptsLeft - 1);
        } else {
          // eslint-disable-next-line no-console
          console.error("❌ Failed to start server:", err);
          process.exit(1);
        }
      });

    return server;
  }

  startServer(PORT);
}
