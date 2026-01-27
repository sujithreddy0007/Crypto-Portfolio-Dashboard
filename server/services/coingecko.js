const axios = require('axios');
const CachedPrice = require('../models/CachedPrice');

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Cache durations in minutes
const CACHE_DURATIONS = {
    listings: 2,
    global: 2,
    trending: 5,
    coin: 2,
    history: 10
};

class CoinGeckoService {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: COINGECKO_BASE_URL,
            timeout: 10000,
            headers: {
                'Accept': 'application/json'
            }
        });

        // Add API key if available
        if (process.env.COINGECKO_API_KEY) {
            this.axiosInstance.defaults.headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
        }
    }

    // Get cached data or fetch from API
    async getCachedOrFetch(type, key, fetchFn) {
        try {
            // Try to get from cache
            const cached = await CachedPrice.findOne({ type, key });
            if (cached && cached.expiresAt > new Date()) {
                return cached.data;
            }

            // Fetch fresh data
            const data = await fetchFn();

            // Update cache
            const expiresAt = new Date(Date.now() + CACHE_DURATIONS[type] * 60 * 1000);
            await CachedPrice.findOneAndUpdate(
                { type, key },
                { data, updatedAt: new Date(), expiresAt },
                { upsert: true }
            );

            return data;
        } catch (error) {
            // If fetch fails, try to return stale cache
            const staleCache = await CachedPrice.findOne({ type, key });
            if (staleCache) {
                return staleCache.data;
            }
            throw error;
        }
    }

    // Get global market data
    async getGlobalData() {
        return this.getCachedOrFetch('global', 'global', async () => {
            const response = await this.axiosInstance.get('/global');
            return response.data.data;
        });
    }

    // Get coin listings with market data
    async getListings(page = 1, perPage = 100, order = 'market_cap_desc') {
        const key = `listings_${page}_${perPage}_${order}`;
        return this.getCachedOrFetch('listings', key, async () => {
            const response = await this.axiosInstance.get('/coins/markets', {
                params: {
                    vs_currency: 'usd',
                    order,
                    per_page: perPage,
                    page,
                    sparkline: true,
                    price_change_percentage: '1h,24h,7d'
                }
            });
            return response.data;
        });
    }

    // Get trending coins
    async getTrending() {
        return this.getCachedOrFetch('trending', 'trending', async () => {
            const response = await this.axiosInstance.get('/search/trending');
            return response.data;
        });
    }

    // Get coin details
    async getCoinDetails(coinId) {
        const key = `coin_${coinId}`;
        return this.getCachedOrFetch('coin', key, async () => {
            const response = await this.axiosInstance.get(`/coins/${coinId}`, {
                params: {
                    localization: false,
                    tickers: false,
                    market_data: true,
                    community_data: false,
                    developer_data: false
                }
            });
            return response.data;
        });
    }

    // Get coin price history
    async getCoinHistory(coinId, days = 7) {
        const key = `history_${coinId}_${days}`;
        return this.getCachedOrFetch('history', key, async () => {
            const response = await this.axiosInstance.get(`/coins/${coinId}/market_chart`, {
                params: {
                    vs_currency: 'usd',
                    days: days,
                    interval: days <= 1 ? 'hourly' : 'daily'
                }
            });
            return response.data;
        });
    }

    // Get multiple coin prices
    async getMultiplePrices(coinIds) {
        if (!coinIds || coinIds.length === 0) return {};

        const key = `prices_${coinIds.sort().join('_')}`;
        return this.getCachedOrFetch('listings', key, async () => {
            const response = await this.axiosInstance.get('/simple/price', {
                params: {
                    ids: coinIds.join(','),
                    vs_currencies: 'usd',
                    include_24hr_change: true,
                    include_market_cap: true
                }
            });
            return response.data;
        });
    }

    // Search coins
    async searchCoins(query) {
        const response = await this.axiosInstance.get('/search', {
            params: { query }
        });
        return response.data;
    }

    // Get coin list (for dropdowns)
    async getCoinList() {
        return this.getCachedOrFetch('listings', 'coinlist', async () => {
            const response = await this.axiosInstance.get('/coins/list');
            return response.data;
        });
    }
}

module.exports = new CoinGeckoService();
