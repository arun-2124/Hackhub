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

// CORS Configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

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
const server = app.listen(PORT, () => {
  console.log(`[HackHub Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

module.exports = { app, server };
