const axios = require('axios');

class CurrencyService {
    constructor() {
        // Supported currencies with symbols
        this.supportedCurrencies = {
            usd: { symbol: '$', name: 'US Dollar' },
            eur: { symbol: '€', name: 'Euro' },
            gbp: { symbol: '£', name: 'British Pound' },
            inr: { symbol: '₹', name: 'Indian Rupee' },
            jpy: { symbol: '¥', name: 'Japanese Yen' },
            cny: { symbol: '¥', name: 'Chinese Yuan' },
            krw: { symbol: '₩', name: 'Korean Won' },
            aud: { symbol: 'A$', name: 'Australian Dollar' },
            cad: { symbol: 'C$', name: 'Canadian Dollar' },
            chf: { symbol: 'CHF', name: 'Swiss Franc' },
            sgd: { symbol: 'S$', name: 'Singapore Dollar' },
            aed: { symbol: 'AED', name: 'UAE Dirham' },
            brl: { symbol: 'R$', name: 'Brazilian Real' },
            rub: { symbol: '₽', name: 'Russian Ruble' },
            mxn: { symbol: 'MX$', name: 'Mexican Peso' },
            php: { symbol: '₱', name: 'Philippine Peso' },
            thb: { symbol: '฿', name: 'Thai Baht' },
            idr: { symbol: 'Rp', name: 'Indonesian Rupiah' },
            ngn: { symbol: '₦', name: 'Nigerian Naira' },
            zar: { symbol: 'R', name: 'South African Rand' }
        };

        // Cache exchange rates for 10 minutes
        this.ratesCache = null;
        this.ratesCacheTime = null;
        this.CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
    }

    getSupportedCurrencies() {
        return Object.entries(this.supportedCurrencies).map(([code, info]) => ({
            code: code.toUpperCase(),
            symbol: info.symbol,
            name: info.name
        }));
    }

    getCurrencySymbol(currencyCode) {
        const currency = this.supportedCurrencies[currencyCode.toLowerCase()];
        return currency ? currency.symbol : '$';
    }

    async getExchangeRates(baseCurrency = 'usd') {
        try {
            // Check cache
            if (this.ratesCache && this.ratesCacheTime &&
                (Date.now() - this.ratesCacheTime) < this.CACHE_DURATION) {
                return this.ratesCache;
            }

            // CoinGecko provides exchange rates via the simple/supported_vs_currencies endpoint
            // and we can get BTC price in multiple currencies to calculate rates
            const currencies = Object.keys(this.supportedCurrencies).join(',');
            const response = await axios.get(
                `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currencies}`,
                { timeout: 10000 }
            );

            if (response.data?.bitcoin) {
                const btcPrices = response.data.bitcoin;
                const basePrice = btcPrices[baseCurrency.toLowerCase()] || btcPrices.usd;

                // Calculate exchange rates relative to USD
                const rates = {};
                for (const [currency, price] of Object.entries(btcPrices)) {
                    rates[currency.toUpperCase()] = price / btcPrices.usd;
                }

                this.ratesCache = rates;
                this.ratesCacheTime = Date.now();
                return rates;
            }

            return null;
        } catch (error) {
            console.error('Error fetching exchange rates:', error.message);
            return this.ratesCache; // Return cached data if available
        }
    }

    async convertPrice(priceInUsd, targetCurrency) {
        const rates = await this.getExchangeRates();
        if (!rates) return priceInUsd;

        const rate = rates[targetCurrency.toUpperCase()];
        if (!rate) return priceInUsd;

        return priceInUsd * rate;
    }

    async getCryptoPriceInCurrency(coinId, currency = 'usd') {
        try {
            const response = await axios.get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${currency}&include_24hr_change=true`,
                { timeout: 10000 }
            );

            if (response.data?.[coinId]) {
                const data = response.data[coinId];
                return {
                    price: data[currency.toLowerCase()],
                    change24h: data[`${currency.toLowerCase()}_24h_change`],
                    currency: currency.toUpperCase(),
                    symbol: this.getCurrencySymbol(currency)
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching crypto price:', error.message);
            return null;
        }
    }

    formatPrice(price, currency = 'usd') {
        const symbol = this.getCurrencySymbol(currency);
        const formattedPrice = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: price >= 1 ? 2 : 6
        }).format(price);

        return `${symbol}${formattedPrice}`;
    }
}

module.exports = new CurrencyService();
