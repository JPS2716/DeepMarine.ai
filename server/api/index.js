// Vercel serverless function entry point
// This handles all routes for the Express app
const app = require('../src/index');

// Export as Vercel serverless function handler
// Vercel expects a function that receives (req, res)
module.exports = app;

