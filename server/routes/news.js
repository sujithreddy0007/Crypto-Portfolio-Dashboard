const express = require('express');
const router = express.Router();
const axios = require('axios');

// Using CryptoPanic API for news (free tier)
// If you want to use this, get a free API key from https://cryptopanic.com/developers/api/
// For now, we'll use a mock/fallback solution

// Static news data (fallback when API not available)
const mockNews = [
    {
        id: '1',
        title: 'Bitcoin Reaches New All-Time High',
        summary: 'Bitcoin has surged past previous records as institutional adoption continues to grow.',
        source: 'CryptoNews',
        url: 'https://example.com/news/1',
        imageUrl: null,
        publishedAt: new Date().toISOString(),
        categories: ['bitcoin', 'market']
    },
    {
        id: '2',
        title: 'Ethereum 2.0 Staking Surpasses 30 Million ETH',
        summary: 'The Ethereum network continues to see strong participation in proof-of-stake validation.',
        source: 'BlockchainTimes',
        url: 'https://example.com/news/2',
        imageUrl: null,
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        categories: ['ethereum', 'staking']
    },
    {
        id: '3',
        title: 'SEC Approves New Crypto ETF Applications',
        summary: 'Regulatory clarity continues to improve as more cryptocurrency ETFs receive approval.',
        source: 'FinanceDaily',
        url: 'https://example.com/news/3',
        imageUrl: null,
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        categories: ['regulation', 'etf']
    },
    {
        id: '4',
        title: 'DeFi Total Value Locked Hits Record $200 Billion',
        summary: 'Decentralized finance protocols continue to attract significant capital inflows.',
        source: 'DeFiPulse',
        url: 'https://example.com/news/4',
        imageUrl: null,
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        categories: ['defi', 'market']
    },
    {
        id: '5',
        title: 'Major Bank Launches Cryptocurrency Custody Service',
        summary: 'Traditional financial institutions continue to embrace digital asset services.',
        source: 'BankingNews',
        url: 'https://example.com/news/5',
        imageUrl: null,
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        categories: ['banking', 'adoption']
    }
];

// @route   GET /api/news
// @desc    Get crypto news
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { limit = 10, filter = 'all' } = req.query;

        // Try to fetch from CryptoPanic if API key is available
        if (process.env.CRYPTOPANIC_API_KEY) {
            try {
                const response = await axios.get('https://cryptopanic.com/api/v1/posts/', {
                    params: {
                        auth_token: process.env.CRYPTOPANIC_API_KEY,
                        filter: filter === 'all' ? undefined : filter,
                        public: true
                    },
                    timeout: 5000
                });

                const news = response.data.results?.slice(0, parseInt(limit)).map(item => ({
                    id: item.id,
                    title: item.title,
                    summary: item.title, // CryptoPanic doesn't provide summary in free tier
                    source: item.source?.title || 'Unknown',
                    url: item.url,
                    imageUrl: null,
                    publishedAt: item.published_at,
                    categories: item.currencies?.map(c => c.code.toLowerCase()) || []
                })) || [];

                return res.json({
                    success: true,
                    data: news
                });
            } catch (apiError) {
                console.log('CryptoPanic API error, using mock data:', apiError.message);
            }
        }

        // Return mock news data
        res.json({
            success: true,
            data: mockNews.slice(0, parseInt(limit))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch news',
            error: error.message
        });
    }
});

// @route   GET /api/news/coin/:coinId
// @desc    Get news for specific coin
// @access  Public
router.get('/coin/:coinId', async (req, res) => {
    try {
        const { coinId } = req.params;
        const { limit = 5 } = req.query;

        // Filter mock news by coin (or return all for now)
        const filteredNews = mockNews
            .filter(news =>
                news.categories.some(cat =>
                    coinId.toLowerCase().includes(cat) || cat.includes(coinId.toLowerCase())
                )
            )
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            data: filteredNews.length > 0 ? filteredNews : mockNews.slice(0, parseInt(limit))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch news',
            error: error.message
        });
    }
});

module.exports = router;
