const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const portfolioCalculator = require('../services/portfolioCalculator');
const coingeckoService = require('../services/coingecko');
const reportGenerator = require('../services/reportGenerator');

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

// @route   POST /api/portfolio/:id/holdings/:holdingId/sell
// @desc    Sell some or all of a holding
// @access  Private
router.post('/:id/holdings/:holdingId/sell', protect, async (req, res) => {
    try {
        const { quantity, sellPrice, notes } = req.body;
        const sellQuantity = parseFloat(quantity);
        const sellPriceNum = parseFloat(sellPrice);

        if (!sellQuantity || sellQuantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid quantity to sell'
            });
        }

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

        // Find the holding
        const holding = await Holding.findById(req.params.holdingId);
        if (!holding || holding.portfolioId.toString() !== portfolio._id.toString()) {
            return res.status(404).json({
                success: false,
                message: 'Holding not found'
            });
        }

        // Check if sell quantity is valid
        if (sellQuantity > holding.quantity) {
            return res.status(400).json({
                success: false,
                message: `Cannot sell more than you own. Current quantity: ${holding.quantity}`
            });
        }

        // Get current price if not provided
        let currentPrice = sellPriceNum;
        if (!currentPrice) {
            const prices = await coingeckoService.getMultiplePrices([holding.coinId]);
            currentPrice = prices[holding.coinId]?.usd || holding.buyPrice;
        }

        // Calculate realized profit/loss for this sale
        const costBasis = holding.buyPrice * sellQuantity;
        const saleValue = currentPrice * sellQuantity;
        const realizedPL = saleValue - costBasis;

        // Create transaction record
        const transaction = await Transaction.create({
            portfolioId: portfolio._id,
            holdingId: holding._id,
            coinId: holding.coinId,
            symbol: holding.symbol,
            name: holding.name,
            type: 'sell',
            quantity: sellQuantity,
            price: currentPrice,
            totalValue: saleValue,
            realizedPL,
            avgBuyPrice: holding.buyPrice,
            notes: notes || `Sold ${sellQuantity} ${holding.symbol}`
        });

        // Update or delete holding
        const remainingQuantity = holding.quantity - sellQuantity;
        if (remainingQuantity <= 0) {
            // Fully sold - delete holding
            await holding.deleteOne();
        } else {
            // Partial sell - update quantity
            holding.quantity = remainingQuantity;
            await holding.save();
        }

        res.json({
            success: true,
            data: {
                transaction,
                remainingQuantity,
                realizedPL,
                message: remainingQuantity <= 0
                    ? `Sold all ${sellQuantity} ${holding.symbol}`
                    : `Sold ${sellQuantity} ${holding.symbol}. Remaining: ${remainingQuantity}`
            }
        });
    } catch (error) {
        console.error('Sell error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/portfolio/:id/transactions
// @desc    Get transaction history for a portfolio
// @access  Private
router.get('/:id/transactions', protect, async (req, res) => {
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

        const transactions = await Transaction.find({ portfolioId: portfolio._id })
            .sort({ transactionDate: -1 })
            .limit(100);

        // Calculate totals
        const sellTransactions = transactions.filter(t => t.type === 'sell');
        const totalRealizedPL = sellTransactions.reduce((sum, t) => sum + (t.realizedPL || 0), 0);

        res.json({
            success: true,
            data: {
                transactions,
                summary: {
                    totalTransactions: transactions.length,
                    sellCount: sellTransactions.length,
                    totalRealizedPL
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/portfolio/:id/report
// @desc    Generate portfolio report (JSON format)
// @access  Private
router.get('/:id/report', protect, async (req, res) => {
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

        const reportData = await reportGenerator.generateReport(portfolio._id);

        res.json({
            success: true,
            data: reportData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/portfolio/:id/report/csv
// @desc    Download portfolio report as CSV
// @access  Private
router.get('/:id/report/csv', protect, async (req, res) => {
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

        const reportData = await reportGenerator.generateReport(portfolio._id);
        const csvContent = reportGenerator.generateCSV(reportData);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="portfolio-${portfolio.name.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/portfolio/:id/report/html
// @desc    Get portfolio report as HTML (for printing/PDF)
// @access  Private
router.get('/:id/report/html', protect, async (req, res) => {
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

        const reportData = await reportGenerator.generateReport(portfolio._id);
        const htmlContent = reportGenerator.generateHTML(reportData);

        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
