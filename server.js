const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_tracker';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// API Routes
app.use('/api/transactions', require('./routes/transactions'));

// Health check endpoint (for Cloud deployment platforms like Render / Vercel)
app.get('/api/health', (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({
    status: 'online',
    timestamp: new Date(),
    dbStatus: (state === 1 || state === 2) ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Fallback to index.html for single-page app experience
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Personal Finance Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`=================================================`);
});

module.exports = app;
