const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const portfolioCalculator = require('../services/portfolioCalculator');

// @route   GET /api/portfolio
// @desc    Get all portfolios for current user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ userId: req.user._id });

        // Add summary metrics for each portfolio
        const portfoliosWithMetrics = await Promise.all(
            portfolios.map(async (portfolio) => {
                const metrics = await portfolioCalculator.calculatePortfolioMetrics(portfolio._id);
                return {
                    _id: portfolio._id,
                    name: portfolio.name,
                    description: portfolio.description,
                    createdAt: portfolio.createdAt,
                    ...metrics
                };
            })
        );

        res.json({
            success: true,
            data: portfoliosWithMetrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/portfolio
// @desc    Create a new portfolio
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name, description } = req.body;

        const portfolio = await Portfolio.create({
            userId: req.user._id,
            name: name || 'New Portfolio',
            description
        });

        res.status(201).json({
            success: true,
            data: portfolio
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/portfolio/:id
// @desc    Get single portfolio with full metrics
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }

        const metrics = await portfolioCalculator.calculatePortfolioMetrics(portfolio._id);

        res.json({
            success: true,
            data: {
                _id: portfolio._id,
                name: portfolio.name,
                description: portfolio.description,
                createdAt: portfolio.createdAt,
                ...metrics
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/portfolio/:id
// @desc    Update portfolio
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, description } = req.body;

        const portfolio = await Portfolio.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { name, description },
            { new: true, runValidators: true }
        );

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }

        res.json({
            success: true,
            data: portfolio
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/portfolio/:id
// @desc    Delete portfolio
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }

        // Delete all holdings in this portfolio
        await Holding.deleteMany({ portfolioId: portfolio._id });

        // Delete portfolio
        await portfolio.deleteOne();

        res.json({
            success: true,
            message: 'Portfolio deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/portfolio/:id/holdings
// @desc    Add holding to portfolio
// @access  Private
router.post('/:id/holdings', protect, async (req, res) => {
    try {
        const { coinId, symbol, name, quantity, buyPrice, buyDate, notes } = req.body;

        // Verify portfolio belongs to user
        const portfolio = await Portfolio.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }

        const holding = await Holding.create({
            portfolioId: portfolio._id,
            coinId,
            symbol,
            name,
            quantity,
            buyPrice,
            buyDate: buyDate || new Date(),
            notes
        });

        res.status(201).json({
            success: true,
            data: holding
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/portfolio/holdings/:holdingId
// @desc    Update holding
// @access  Private
router.put('/holdings/:holdingId', protect, async (req, res) => {
    try {
        const { quantity, buyPrice, buyDate, notes } = req.body;

        // Find holding and verify ownership
        const holding = await Holding.findById(req.params.holdingId);
        if (!holding) {
            return res.status(404).json({
                success: false,
                message: 'Holding not found'
            });
        }

        const portfolio = await Portfolio.findOne({
            _id: holding.portfolioId,
            userId: req.user._id
        });

        if (!portfolio) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        holding.quantity = quantity ?? holding.quantity;
        holding.buyPrice = buyPrice ?? holding.buyPrice;
        holding.buyDate = buyDate ?? holding.buyDate;
        holding.notes = notes ?? holding.notes;
        await holding.save();

        res.json({
            success: true,
            data: holding
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/portfolio/holdings/:holdingId
// @desc    Delete holding
// @access  Private
router.delete('/holdings/:holdingId', protect, async (req, res) => {
    try {
        const holding = await Holding.findById(req.params.holdingId);
        if (!holding) {
            return res.status(404).json({
                success: false,
                message: 'Holding not found'
            });
        }

        const portfolio = await Portfolio.findOne({
            _id: holding.portfolioId,
            userId: req.user._id
        });

        if (!portfolio) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await holding.deleteOne();

        res.json({
            success: true,
            message: 'Holding deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/portfolio/summary/all
// @desc    Get summary of all user portfolios
// @access  Private
router.get('/summary/all', protect, async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ userId: req.user._id });
        const portfolioIds = portfolios.map(p => p._id);

        const summary = await portfolioCalculator.calculateUserSummary(portfolioIds);

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
