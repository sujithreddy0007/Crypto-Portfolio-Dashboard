const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Alert = require('../models/Alert');
const coingeckoService = require('../services/coingecko');

// @route   GET /api/alerts
// @desc    Get user's alerts
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const alerts = await Alert.find({ userId: req.user._id }).sort({ createdAt: -1 });

        if (alerts.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        // Get current prices for all coins with alerts
        const coinIds = [...new Set(alerts.map(a => a.coinId))];
        const prices = await coingeckoService.getMultiplePrices(coinIds);

        const alertsWithPrices = alerts.map(alert => {
            const priceData = prices[alert.coinId] || {};
            return {
                _id: alert._id,
                coinId: alert.coinId,
                symbol: alert.symbol,
                name: alert.name,
                targetPrice: alert.targetPrice,
                condition: alert.condition,
                isActive: alert.isActive,
                triggered: alert.triggered,
                triggeredAt: alert.triggeredAt,
                createdAt: alert.createdAt,
                currentPrice: priceData.usd || 0
            };
        });

        res.json({
            success: true,
            data: alertsWithPrices
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/alerts
// @desc    Create a new alert
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { coinId, symbol, name, targetPrice, condition } = req.body;

        const alert = await Alert.create({
            userId: req.user._id,
            coinId,
            symbol,
            name,
            targetPrice,
            condition
        });

        res.status(201).json({
            success: true,
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/alerts/:id
// @desc    Update alert
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { targetPrice, condition, isActive } = req.body;

        const alert = await Alert.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { targetPrice, condition, isActive },
            { new: true, runValidators: true }
        );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/alerts/:id
// @desc    Delete alert
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const result = await Alert.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        res.json({
            success: true,
            message: 'Alert deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/alerts/:id/toggle
// @desc    Toggle alert active status
// @access  Private
router.post('/:id/toggle', protect, async (req, res) => {
    try {
        const alert = await Alert.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        alert.isActive = !alert.isActive;
        await alert.save();

        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
