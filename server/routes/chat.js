const express = require('express');
const router = express.Router();
const geminiService = require('../services/gemini');
const { optionalAuth } = require('../middleware/auth');

// @route   POST /api/chat
// @desc    Send message to AI chatbot
// @access  Public (but with user context if logged in)
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Limit message length
        if (message.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Message is too long. Please keep it under 1000 characters.'
            });
        }

        // Add user context if available
        const enrichedContext = {
            ...context,
            isLoggedIn: !!req.user
        };

        const response = await geminiService.chat(message, enrichedContext);

        res.json({
            success: response.success,
            data: {
                message: response.message,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process chat message'
        });
    }
});

// @route   GET /api/chat/suggestions
// @desc    Get quick suggestion prompts
// @access  Public
router.get('/suggestions', async (req, res) => {
    try {
        const suggestions = await geminiService.getQuickSuggestions();
        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get suggestions'
        });
    }
});

module.exports = router;
