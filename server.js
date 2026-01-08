require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serves index.html and script.js

// API Route: Get Configuration
app.get('/api/config', (req, res) => {
    const configPath = path.join(__dirname, 'config.json');
    
    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading config:", err);
            return res.status(500).json({ error: "Failed to load config" });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

// API Route: Verify Password
app.post('/api/verify', (req, res) => {
    const { password } = req.body;
    const correctPassword = process.env.SITE_PASSWORD;

    if (password === correctPassword) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`CloudZero Server running at http://localhost:${PORT}`);
});
