const axios = require("axios");
const FormData = require("form-data");

// IMPORTANT: Set MODEL_NAME and ROBOFLOW_API_KEY in .env file
// Never commit .env files to git - they contain sensitive API keys
const MODEL_NAME = process.env.MODEL_NAME || "synergia-nmwuj";
const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;

if (!ROBOFLOW_API_KEY) {
  throw new Error(
    "ROBOFLOW_API_KEY is required. Please set it in server/.env file.\n" +
      "See server/.env.example for template."
  );
}

async function forwardToRoboflow({
  buffer,
  originalName,
  mimeType,
  version = "3",
}) {
  if (!MODEL_NAME) {
    throw new Error(
      "MODEL_NAME is not set. Set env MODEL_NAME or replace in src/roboflow.js"
    );
  }

  const url = `https://detect.roboflow.com/${MODEL_NAME}/${version}?api_key=${ROBOFLOW_API_KEY}`;

  const form = new FormData();
  form.append("file", buffer, {
    filename: originalName || "upload.jpg",
    contentType: mimeType || "image/jpeg",
  });

  const headers = form.getHeaders();
  const start = Date.now();
  // eslint-disable-next-line no-console
  console.log("Roboflow POST", { url, contentType: headers["content-type"] });
  const { data } = await axios
    .post(url, form, {
      headers,
      // Roboflow can take a little time depending on model size and queue
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
    .catch((err) => {
      const tookMs = Date.now() - start;
      // eslint-disable-next-line no-console
      console.error("Roboflow error", {
        tookMs,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      throw err;
    });
  const tookMs = Date.now() - start;
  // eslint-disable-next-line no-console
  console.log("Roboflow OK", { tookMs });

  return data;
}

module.exports = { forwardToRoboflow };
