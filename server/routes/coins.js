const express = require('express');
const router = express.Router();
const coingeckoService = require('../services/coingecko');

// @route   GET /api/coins/:id
// @desc    Get coin details
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await coingeckoService.getCoinDetails(id);

        const coin = {
            id: data.id,
            name: data.name,
            symbol: data.symbol?.toUpperCase(),
            image: data.image?.large || data.image?.small,
            description: data.description?.en || '',
            links: {
                homepage: data.links?.homepage?.[0],
                blockchain: data.links?.blockchain_site?.filter(Boolean)[0],
                forum: data.links?.official_forum_url?.[0],
                twitter: data.links?.twitter_screen_name ? `https://twitter.com/${data.links.twitter_screen_name}` : null,
                reddit: data.links?.subreddit_url
            },
            marketData: {
                currentPrice: data.market_data?.current_price?.usd || 0,
                marketCap: data.market_data?.market_cap?.usd || 0,
                marketCapRank: data.market_cap_rank,
                volume24h: data.market_data?.total_volume?.usd || 0,
                high24h: data.market_data?.high_24h?.usd || 0,
                low24h: data.market_data?.low_24h?.usd || 0,
                priceChange24h: data.market_data?.price_change_24h || 0,
                priceChangePercentage1h: data.market_data?.price_change_percentage_1h_in_currency?.usd || 0,
                priceChangePercentage24h: data.market_data?.price_change_percentage_24h || 0,
                priceChangePercentage7d: data.market_data?.price_change_percentage_7d || 0,
                priceChangePercentage30d: data.market_data?.price_change_percentage_30d || 0,
                priceChangePercentage1y: data.market_data?.price_change_percentage_1y || 0,
                circulatingSupply: data.market_data?.circulating_supply || 0,
                totalSupply: data.market_data?.total_supply || 0,
                maxSupply: data.market_data?.max_supply,
                ath: data.market_data?.ath?.usd || 0,
                athDate: data.market_data?.ath_date?.usd,
                athChangePercentage: data.market_data?.ath_change_percentage?.usd || 0,
                atl: data.market_data?.atl?.usd || 0,
                atlDate: data.market_data?.atl_date?.usd,
                atlChangePercentage: data.market_data?.atl_change_percentage?.usd || 0
            },
            categories: data.categories || [],
            genesisDate: data.genesis_date,
            sentiment: {
                votesUpPercentage: data.sentiment_votes_up_percentage,
                votesDownPercentage: data.sentiment_votes_down_percentage
            }
        };

        res.json({
            success: true,
            data: coin
        });
    } catch (error) {
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Coin not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to fetch coin details',
            error: error.message
        });
    }
});

// @route   GET /api/coins/:id/history
// @desc    Get coin price history
// @access  Public
router.get('/:id/history', async (req, res) => {
    try {
        const { id } = req.params;
        const { days = 7 } = req.query;

        const data = await coingeckoService.getCoinHistory(id, parseInt(days));

        // Transform data for charts
        const history = {
            prices: data.prices?.map(([timestamp, price]) => ({
                timestamp,
                date: new Date(timestamp).toISOString(),
                price
            })) || [],
            marketCaps: data.market_caps?.map(([timestamp, marketCap]) => ({
                timestamp,
                date: new Date(timestamp).toISOString(),
                marketCap
            })) || [],
            volumes: data.total_volumes?.map(([timestamp, volume]) => ({
                timestamp,
                date: new Date(timestamp).toISOString(),
                volume
            })) || []
        };

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch coin history',
            error: error.message
        });
    }
});

// @route   GET /api/coins/list/all
// @desc    Get list of all coins (for search/dropdowns)
// @access  Public
router.get('/list/all', async (req, res) => {
    try {
        const data = await coingeckoService.getCoinList();

        const coins = data.map(coin => ({
            id: coin.id,
            symbol: coin.symbol?.toUpperCase(),
            name: coin.name
        }));

        res.json({
            success: true,
            data: coins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch coin list',
            error: error.message
        });
    }
});

module.exports = router;
