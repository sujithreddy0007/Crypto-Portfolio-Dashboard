const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Watchlist = require('../models/Watchlist');
const coingeckoService = require('../services/coingecko');

// @route   GET /api/watchlist
// @desc    Get user's watchlist with live prices
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const watchlist = await Watchlist.find({ userId: req.user._id }).sort({ addedAt: -1 });

        if (watchlist.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        // Get live prices for all coins in watchlist
        const coinIds = watchlist.map(w => w.coinId);
        const prices = await coingeckoService.getMultiplePrices(coinIds);

        const watchlistWithPrices = watchlist.map(item => {
            const priceData = prices[item.coinId] || {};
            return {
                _id: item._id,
                coinId: item.coinId,
                symbol: item.symbol,
                name: item.name,
                addedAt: item.addedAt,
                currentPrice: priceData.usd || 0,
                priceChange24h: priceData.usd_24h_change || 0,
                marketCap: priceData.usd_market_cap || 0
            };
        });

        res.json({
            success: true,
            data: watchlistWithPrices
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/watchlist
// @desc    Add coin to watchlist
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { coinId, symbol, name } = req.body;

        // Check if already in watchlist
        const existing = await Watchlist.findOne({
            userId: req.user._id,
            coinId
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Coin already in watchlist'
            });
        }

        const watchlistItem = await Watchlist.create({
            userId: req.user._id,
            coinId,
            symbol,
            name
        });

        res.status(201).json({
            success: true,
            data: watchlistItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/watchlist/:coinId
// @desc    Remove coin from watchlist
// @access  Private
router.delete('/:coinId', protect, async (req, res) => {
    try {
        const result = await Watchlist.findOneAndDelete({
            userId: req.user._id,
            coinId: req.params.coinId
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Coin not found in watchlist'
            });
        }

        res.json({
            success: true,
            message: 'Removed from watchlist'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/watchlist/check/:coinId
// @desc    Check if coin is in watchlist
// @access  Private
router.get('/check/:coinId', protect, async (req, res) => {
    try {
        const exists = await Watchlist.findOne({
            userId: req.user._id,
            coinId: req.params.coinId
        });

        res.json({
            success: true,
            data: { inWatchlist: !!exists }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
