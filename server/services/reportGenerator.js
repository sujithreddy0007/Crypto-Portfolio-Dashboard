const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const coingeckoService = require('./coingecko');

class ReportGenerator {
    /**
     * Generate portfolio report data
     */
    async generateReport(portfolioId) {
        const portfolio = await Portfolio.findById(portfolioId);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }

        const holdings = await Holding.find({ portfolioId });
        const transactions = await Transaction.find({ portfolioId })
            .sort({ transactionDate: -1 });

        // Get current prices
        const coinIds = [...new Set(holdings.map(h => h.coinId))];
        const prices = coinIds.length > 0
            ? await coingeckoService.getMultiplePrices(coinIds)
            : {};

        // Calculate metrics for each holding
        let totalInvested = 0;
        let currentValue = 0;

        const holdingsData = holdings.map(holding => {
            const priceData = prices[holding.coinId] || {};
            const currentPrice = priceData.usd || 0;

            const investedAmount = holding.quantity * holding.buyPrice;
            const holdingValue = holding.quantity * currentPrice;
            const profitLoss = holdingValue - investedAmount;
            const profitLossPercent = investedAmount > 0
                ? (profitLoss / investedAmount) * 100
                : 0;

            totalInvested += investedAmount;
            currentValue += holdingValue;

            return {
                coinId: holding.coinId,
                symbol: holding.symbol,
                name: holding.name,
                quantity: holding.quantity,
                buyPrice: holding.buyPrice,
                buyDate: holding.buyDate,
                currentPrice,
                investedAmount,
                currentValue: holdingValue,
                profitLoss,
                profitLossPercent
            };
        });

        // Calculate realized P&L from transactions
        const sellTransactions = transactions.filter(t => t.type === 'sell');
        const realizedPL = sellTransactions.reduce((sum, t) => sum + (t.realizedPL || 0), 0);
        const unrealizedPL = currentValue - totalInvested;
        const totalPL = realizedPL + unrealizedPL;

        return {
            portfolio: {
                id: portfolio._id,
                name: portfolio.name,
                createdAt: portfolio.createdAt
            },
            summary: {
                totalInvested,
                currentValue,
                unrealizedPL,
                realizedPL,
                totalPL,
                totalPLPercent: totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0,
                holdingsCount: holdings.length,
                transactionsCount: transactions.length
            },
            holdings: holdingsData,
            transactions: transactions.map(t => ({
                type: t.type,
                coinId: t.coinId,
                symbol: t.symbol,
                name: t.name,
                quantity: t.quantity,
                price: t.price,
                totalValue: t.totalValue,
                realizedPL: t.realizedPL,
                date: t.transactionDate
            })),
            generatedAt: new Date()
        };
    }

    /**
     * Generate CSV content from report data
     */
    generateCSV(reportData) {
        const lines = [];

        // Header
        lines.push('CRYPTO PORTFOLIO REPORT');
        lines.push(`Portfolio: ${reportData.portfolio.name}`);
        lines.push(`Generated: ${new Date(reportData.generatedAt).toLocaleString()}`);
        lines.push('');

        // Summary
        lines.push('=== SUMMARY ===');
        lines.push(`Total Invested,$${reportData.summary.totalInvested.toFixed(2)}`);
        lines.push(`Current Value,$${reportData.summary.currentValue.toFixed(2)}`);
        lines.push(`Unrealized P&L,$${reportData.summary.unrealizedPL.toFixed(2)}`);
        lines.push(`Realized P&L,$${reportData.summary.realizedPL.toFixed(2)}`);
        lines.push(`Total P&L,$${reportData.summary.totalPL.toFixed(2)} (${reportData.summary.totalPLPercent.toFixed(2)}%)`);
        lines.push('');

        // Holdings
        lines.push('=== HOLDINGS ===');
        lines.push('Symbol,Name,Quantity,Buy Price,Current Price,Invested,Current Value,P&L,P&L %');

        for (const h of reportData.holdings) {
            lines.push([
                h.symbol,
                h.name,
                h.quantity,
                `$${h.buyPrice.toFixed(2)}`,
                `$${h.currentPrice.toFixed(2)}`,
                `$${h.investedAmount.toFixed(2)}`,
                `$${h.currentValue.toFixed(2)}`,
                `$${h.profitLoss.toFixed(2)}`,
                `${h.profitLossPercent.toFixed(2)}%`
            ].join(','));
        }
        lines.push('');

        // Transactions
        if (reportData.transactions.length > 0) {
            lines.push('=== TRANSACTIONS ===');
            lines.push('Date,Type,Symbol,Quantity,Price,Value,Realized P&L');

            for (const t of reportData.transactions) {
                lines.push([
                    new Date(t.date).toLocaleDateString(),
                    t.type.toUpperCase(),
                    t.symbol,
                    t.quantity,
                    `$${t.price.toFixed(2)}`,
                    `$${t.totalValue.toFixed(2)}`,
                    t.type === 'sell' ? `$${(t.realizedPL || 0).toFixed(2)}` : '-'
                ].join(','));
            }
        }

        return lines.join('\n');
    }

    /**
     * Generate HTML report for PDF conversion
     */
    generateHTML(reportData) {
        const formatPrice = (price) => `$${(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const formatPercent = (pct) => `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
        const plColor = (val) => val >= 0 ? '#16c784' : '#ea3943';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Portfolio Report - ${reportData.portfolio.name}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #3861fb; margin-bottom: 5px; }
        h2 { color: #58667e; border-bottom: 2px solid #3861fb; padding-bottom: 10px; margin-top: 30px; }
        .subtitle { color: #58667e; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .summary-card { background: #f8f8f8; padding: 20px; border-radius: 10px; }
        .summary-label { font-size: 12px; color: #58667e; text-transform: uppercase; }
        .summary-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #f8f8f8; padding: 12px; text-align: left; font-size: 12px; color: #58667e; text-transform: uppercase; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .text-right { text-align: right; }
        .positive { color: #16c784; }
        .negative { color: #ea3943; }
        .footer { margin-top: 40px; text-align: center; color: #aaa; font-size: 12px; }
    </style>
</head>
<body>
    <h1>📊 Portfolio Report</h1>
    <p class="subtitle">${reportData.portfolio.name} | Generated: ${new Date(reportData.generatedAt).toLocaleString()}</p>
    
    <div class="summary-grid">
        <div class="summary-card">
            <div class="summary-label">Total Invested</div>
            <div class="summary-value">${formatPrice(reportData.summary.totalInvested)}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Current Value</div>
            <div class="summary-value">${formatPrice(reportData.summary.currentValue)}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Total P&L</div>
            <div class="summary-value" style="color: ${plColor(reportData.summary.totalPL)}">
                ${formatPrice(reportData.summary.totalPL)} (${formatPercent(reportData.summary.totalPLPercent)})
            </div>
        </div>
    </div>

    <h2>Holdings (${reportData.holdings.length})</h2>
    <table>
        <thead>
            <tr>
                <th>Asset</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Buy Price</th>
                <th class="text-right">Current Price</th>
                <th class="text-right">Value</th>
                <th class="text-right">P&L</th>
            </tr>
        </thead>
        <tbody>
            ${reportData.holdings.map(h => `
                <tr>
                    <td><strong>${h.name}</strong> <span style="color:#aaa">${h.symbol}</span></td>
                    <td class="text-right">${h.quantity}</td>
                    <td class="text-right">${formatPrice(h.buyPrice)}</td>
                    <td class="text-right">${formatPrice(h.currentPrice)}</td>
                    <td class="text-right">${formatPrice(h.currentValue)}</td>
                    <td class="text-right ${h.profitLoss >= 0 ? 'positive' : 'negative'}">
                        ${formatPrice(h.profitLoss)}<br>
                        <small>${formatPercent(h.profitLossPercent)}</small>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    ${reportData.transactions.length > 0 ? `
        <h2>Recent Transactions (${reportData.transactions.length})</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Asset</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Value</th>
                    <th class="text-right">Realized P&L</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.transactions.slice(0, 20).map(t => `
                    <tr>
                        <td>${new Date(t.date).toLocaleDateString()}</td>
                        <td><span style="color: ${t.type === 'buy' ? '#3861fb' : '#16c784'}">${t.type.toUpperCase()}</span></td>
                        <td>${t.name} <span style="color:#aaa">${t.symbol}</span></td>
                        <td class="text-right">${t.quantity}</td>
                        <td class="text-right">${formatPrice(t.price)}</td>
                        <td class="text-right">${formatPrice(t.totalValue)}</td>
                        <td class="text-right ${(t.realizedPL || 0) >= 0 ? 'positive' : 'negative'}">
                            ${t.type === 'sell' ? formatPrice(t.realizedPL) : '-'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : ''}

    <div class="footer">
        <p>Crypto Portfolio Dashboard | Report ID: ${reportData.portfolio.id}</p>
    </div>
</body>
</html>`;
    }
}

module.exports = new ReportGenerator();
