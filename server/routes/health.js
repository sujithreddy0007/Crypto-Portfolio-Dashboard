const express = require('express');
const router = express.Router();

// Health check endpoint for Render
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Crypto Portfolio API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = router;
