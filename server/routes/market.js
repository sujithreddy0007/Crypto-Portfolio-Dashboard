const express = require('express');
const router = express.Router();
const coingeckoService = require('../services/coingecko');

// @route   GET /api/market/global
// @desc    Get global market data
// @access  Public
router.get('/global', async (req, res) => {
    try {
        const data = await coingeckoService.getGlobalData();
        res.json({
            success: true,
            data: {
                totalMarketCap: data.total_market_cap?.usd || 0,
                totalVolume: data.total_volume?.usd || 0,
                btcDominance: data.market_cap_percentage?.btc || 0,
                ethDominance: data.market_cap_percentage?.eth || 0,
                marketCapChange24h: data.market_cap_change_percentage_24h_usd || 0,
                activeCryptos: data.active_cryptocurrencies || 0,
                markets: data.markets || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch global market data',
            error: error.message
        });
    }
});

// @route   GET /api/market/listings
// @desc    Get cryptocurrency listings
// @access  Public
router.get('/listings', async (req, res) => {
    try {
        const { page = 1, per_page = 100, order = 'market_cap_desc' } = req.query;
        const data = await coingeckoService.getListings(
            parseInt(page),
            parseInt(per_page),
            order
        );

        // Transform data to match CoinMarketCap-style format
        const listings = data.map((coin, index) => ({
            id: coin.id,
            rank: coin.market_cap_rank || (parseInt(page) - 1) * parseInt(per_page) + index + 1,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            image: coin.image,
            currentPrice: coin.current_price,
            marketCap: coin.market_cap,
            volume24h: coin.total_volume,
            priceChange1h: coin.price_change_percentage_1h_in_currency,
            priceChange24h: coin.price_change_percentage_24h_in_currency || coin.price_change_percentage_24h,
            priceChange7d: coin.price_change_percentage_7d_in_currency,
            circulatingSupply: coin.circulating_supply,
            totalSupply: coin.total_supply,
            maxSupply: coin.max_supply,
            ath: coin.ath,
            athDate: coin.ath_date,
            atl: coin.atl,
            atlDate: coin.atl_date,
            sparkline: coin.sparkline_in_7d?.price || []
        }));

        res.json({
            success: true,
            data: listings,
            pagination: {
                page: parseInt(page),
                perPage: parseInt(per_page),
                hasMore: data.length === parseInt(per_page)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch market listings',
            error: error.message
        });
    }
});

// @route   GET /api/market/trending
// @desc    Get trending coins
// @access  Public
router.get('/trending', async (req, res) => {
    try {
        const data = await coingeckoService.getTrending();

        const trending = data.coins?.map(item => ({
            id: item.item.id,
            name: item.item.name,
            symbol: item.item.symbol,
            image: item.item.small || item.item.thumb,
            marketCapRank: item.item.market_cap_rank,
            priceBtc: item.item.price_btc,
            score: item.item.score
        })) || [];

        res.json({
            success: true,
            data: trending
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trending coins',
            error: error.message
        });
    }
});

// @route   GET /api/market/search
// @desc    Search coins
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.json({ success: true, data: [] });
        }

        const data = await coingeckoService.searchCoins(query);

        const results = data.coins?.slice(0, 10).map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            image: coin.large || coin.thumb,
            marketCapRank: coin.market_cap_rank
        })) || [];

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to search coins',
            error: error.message
        });
    }
});

// @route   GET /api/market/gainers-losers
// @desc    Get top gainers and losers
// @access  Public
router.get('/gainers-losers', async (req, res) => {
    try {
        // Get top 250 coins to find best gainers/losers
        const data = await coingeckoService.getListings(1, 250, 'market_cap_desc');

        // Sort by 24h change
        const sorted = [...data].sort((a, b) =>
            (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
        );

        const transform = (coin) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            image: coin.image,
            currentPrice: coin.current_price,
            priceChange24h: coin.price_change_percentage_24h
        });

        res.json({
            success: true,
            data: {
                gainers: sorted.slice(0, 5).map(transform),
                losers: sorted.slice(-5).reverse().map(transform)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch gainers and losers',
            error: error.message
        });
    }
});

module.exports = router;
