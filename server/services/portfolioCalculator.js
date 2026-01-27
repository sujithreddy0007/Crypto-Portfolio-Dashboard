const Holding = require('../models/Holding');
const coingeckoService = require('./coingecko');

class PortfolioCalculator {
    /**
     * Calculate portfolio metrics for a given portfolio's holdings
     * Based on reference repo logic: https://github.com/msolters/crypto-portfolio-dashboard
     * 
     * Portfolio value = Σ(coin_price × quantity)
     * Profit/Loss = current_value - total_invested
     * Return % = (profit_loss / total_invested) × 100
     * Allocation % = (coin_value / total_portfolio_value) × 100
     */
    async calculatePortfolioMetrics(portfolioId) {
        // Get all holdings for this portfolio
        const holdings = await Holding.find({ portfolioId });

        if (holdings.length === 0) {
            return {
                totalInvested: 0,
                currentValue: 0,
                profitLoss: 0,
                profitLossPercentage: 0,
                holdings: [],
                allocation: []
            };
        }

        // Get unique coin IDs
        const coinIds = [...new Set(holdings.map(h => h.coinId))];

        // Fetch current prices for all coins
        const prices = await coingeckoService.getMultiplePrices(coinIds);

        let totalInvested = 0;
        let currentValue = 0;
        const holdingsWithMetrics = [];
        const allocation = [];

        // Calculate metrics for each holding
        for (const holding of holdings) {
            const priceData = prices[holding.coinId] || {};
            const currentPrice = priceData.usd || 0;
            const priceChange24h = priceData.usd_24h_change || 0;

            const investedAmount = holding.quantity * holding.buyPrice;
            const holdingValue = holding.quantity * currentPrice;
            const holdingProfitLoss = holdingValue - investedAmount;
            const holdingProfitLossPercentage = investedAmount > 0
                ? (holdingProfitLoss / investedAmount) * 100
                : 0;

            totalInvested += investedAmount;
            currentValue += holdingValue;

            holdingsWithMetrics.push({
                _id: holding._id,
                coinId: holding.coinId,
                symbol: holding.symbol,
                name: holding.name,
                quantity: holding.quantity,
                buyPrice: holding.buyPrice,
                buyDate: holding.buyDate,
                currentPrice,
                priceChange24h,
                investedAmount,
                currentValue: holdingValue,
                profitLoss: holdingProfitLoss,
                profitLossPercentage: holdingProfitLossPercentage
            });
        }

        // Calculate allocation percentages
        for (const holding of holdingsWithMetrics) {
            allocation.push({
                coinId: holding.coinId,
                symbol: holding.symbol,
                name: holding.name,
                value: holding.currentValue,
                percentage: currentValue > 0
                    ? (holding.currentValue / currentValue) * 100
                    : 0
            });
        }

        // Aggregate by coin (in case of multiple holdings of same coin)
        const aggregatedAllocation = this.aggregateAllocation(allocation);

        // Calculate overall profit/loss
        const profitLoss = currentValue - totalInvested;
        const profitLossPercentage = totalInvested > 0
            ? (profitLoss / totalInvested) * 100
            : 0;

        return {
            totalInvested,
            currentValue,
            profitLoss,
            profitLossPercentage,
            holdings: holdingsWithMetrics,
            allocation: aggregatedAllocation
        };
    }

    /**
     * Aggregate allocation by coin (sum values for same coin)
     */
    aggregateAllocation(allocation) {
        const aggregated = {};
        let totalValue = 0;

        for (const item of allocation) {
            if (!aggregated[item.coinId]) {
                aggregated[item.coinId] = {
                    coinId: item.coinId,
                    symbol: item.symbol,
                    name: item.name,
                    value: 0
                };
            }
            aggregated[item.coinId].value += item.value;
            totalValue += item.value;
        }

        // Recalculate percentages
        return Object.values(aggregated).map(item => ({
            ...item,
            percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0
        })).sort((a, b) => b.value - a.value);
    }

    /**
     * Calculate summary for all user portfolios
     */
    async calculateUserSummary(portfolioIds) {
        let totalInvested = 0;
        let currentValue = 0;

        for (const portfolioId of portfolioIds) {
            const metrics = await this.calculatePortfolioMetrics(portfolioId);
            totalInvested += metrics.totalInvested;
            currentValue += metrics.currentValue;
        }

        const profitLoss = currentValue - totalInvested;
        const profitLossPercentage = totalInvested > 0
            ? (profitLoss / totalInvested) * 100
            : 0;

        return {
            totalInvested,
            currentValue,
            profitLoss,
            profitLossPercentage
        };
    }
}

module.exports = new PortfolioCalculator();
