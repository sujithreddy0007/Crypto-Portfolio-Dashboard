const express = require('express');
const router = express.Router();
const currencyService = require('../services/currencyService');

// @route   GET /api/currency/list
// @desc    Get list of supported currencies
// @access  Public
router.get('/list', async (req, res) => {
    try {
        const currencies = currencyService.getSupportedCurrencies();
        res.json({
            success: true,
            data: currencies
        });
    } catch (error) {
        console.error('Error getting currencies:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get currencies'
        });
    }
});

// @route   GET /api/currency/rates
// @desc    Get exchange rates (relative to USD)
// @access  Public
router.get('/rates', async (req, res) => {
    try {
        const rates = await currencyService.getExchangeRates();
        res.json({
            success: true,
            data: rates,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting rates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get exchange rates'
        });
    }
});

// @route   GET /api/currency/convert
// @desc    Convert a USD price to target currency
// @access  Public
router.get('/convert', async (req, res) => {
    try {
        const { amount, to } = req.query;

        if (!amount || !to) {
            return res.status(400).json({
                success: false,
                message: 'Please provide amount and target currency (to)'
            });
        }

        const convertedAmount = await currencyService.convertPrice(
            parseFloat(amount),
            to
        );

        res.json({
            success: true,
            data: {
                original: parseFloat(amount),
                originalCurrency: 'USD',
                converted: convertedAmount,
                targetCurrency: to.toUpperCase(),
                symbol: currencyService.getCurrencySymbol(to),
                formatted: currencyService.formatPrice(convertedAmount, to)
            }
        });
    } catch (error) {
        console.error('Error converting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to convert currency'
        });
    }
});

// @route   GET /api/currency/crypto/:coinId
// @desc    Get crypto price in specified currency
// @access  Public
router.get('/crypto/:coinId', async (req, res) => {
    try {
        const { coinId } = req.params;
        const { currency = 'usd' } = req.query;

        const priceData = await currencyService.getCryptoPriceInCurrency(coinId, currency);

        if (!priceData) {
            return res.status(404).json({
                success: false,
                message: 'Could not get price for this coin'
            });
        }

        res.json({
            success: true,
            data: {
                coinId,
                ...priceData,
                formatted: currencyService.formatPrice(priceData.price, currency)
            }
        });
    } catch (error) {
        console.error('Error getting crypto price:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get crypto price'
        });
    }
});

module.exports = router;
