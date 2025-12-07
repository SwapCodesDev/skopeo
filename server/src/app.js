const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const config = require('./config');

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Vercel)

// Middleware
app.use(cors());

// Static Files
const path = require('path');
const fs = require('fs');

// Script serving is now handled in routes/index.js -> script.controller.js

// API Routes
app.use('/', routes);

// Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err.message);
    const status = err.statusCode || 500;
    res.status(status).json({
        error: err.message || "Internal Server Error",
        originalError: err.originalError
    });
});

module.exports = app;
