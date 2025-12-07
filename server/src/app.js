const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const config = require('./config');

const app = express();

// Middleware
app.use(cors());

// Static Files
const path = require('path');
const fs = require('fs');

// Static Files - explicit handler for Vercel compatibility
app.get('/js/inspect-script.js', (req, res) => {
    const scriptPath = path.join(__dirname, '../public/js/inspect-script.js');
    // try standard path first (for local), then fallback for Vercel structure if needed
    if (fs.existsSync(scriptPath)) {
        res.setHeader('Content-Type', 'application/javascript');
        return res.sendFile(scriptPath);
    }

    // Backup path check for different deployment structures
    const altPath = path.join(process.cwd(), 'server/public/js/inspect-script.js');
    if (fs.existsSync(altPath)) {
        res.setHeader('Content-Type', 'application/javascript');
        return res.sendFile(altPath);
    }

    console.error(`Script not found at ${scriptPath} or ${altPath}`);
    res.status(404).send('Script not found');
});

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
