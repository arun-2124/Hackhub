const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads', 'submissions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// CORS Configuration: Enforce strict allowlist in production; allow development/testing fallbacks
const isProduction = process.env.NODE_ENV === 'production';

const productionOrigins = [
  'https://hackhub-gamma.vercel.app',
  'https://hackhub-cfggx2x6l-xibotix-pvt-ltd.vercel.app'
];

// Helper to validate and parse configured origins (enforces valid HTTPS origins in production)
function parseConfiguredOrigins(envVar, isProd) {
  if (!envVar) return [];
  return envVar
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .filter((origin) => {
      try {
        const parsed = new URL(origin);
        // Origin must strictly match origin root (no paths, query parameters, or fragments)
        if (parsed.origin !== origin) return false;
        // In production, require secure HTTPS protocol
        if (isProd && parsed.protocol !== 'https:') return false;
        // Never allow wildcard patterns
        if (origin.includes('*')) return false;
        return true;
      } catch (_) {
        return false;
      }
    });
}

const configuredOrigins = parseConfiguredOrigins(process.env.FRONTEND_URL, isProduction);

const devOrigins = [
  'http://localhost:5173',
  'http://localhost:5000'
];

// In production, allow ONLY the approved Vercel origins and valid explicitly configured FRONTEND_URL.
// Localhost origins are only included in non-production environments unless explicitly added to FRONTEND_URL.
const allowedOrigins = Array.from(new Set([
  ...productionOrigins,
  ...configuredOrigins,
  ...(isProduction ? [] : devOrigins)
]));

const corsOptions = isProduction
  ? {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          const corsError = new Error(`CORS request blocked by HackHub security policy for origin: ${origin}`);
          corsError.statusCode = 403;
          callback(corsError);
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }
  : {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };

app.use(cors(corsOptions));

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    platform: 'HackHub API',
    database: 'MySQL 8.4 (hackhub_db)',
    timestamp: new Date().toISOString()
  });
});

// Mount API v1 Routes
const apiRoutes = require('./routes');
app.use('/api/v1', apiRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[HackHub Server] Running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[HackHub Server] Port ${PORT} already active. Reusing running instance.`);
  } else {
    throw err;
  }
});

module.exports = { app, server, allowedOrigins, corsOptions, parseConfiguredOrigins };
