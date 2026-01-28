const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    portfolioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Portfolio',
        required: true
    },
    holdingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Holding',
        required: false // May be null if holding was deleted after full sell
    },
    coinId: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    totalValue: {
        type: Number,
        required: true
    },
    // For sell transactions: profit/loss from this sale
    realizedPL: {
        type: Number,
        default: 0
    },
    // Average buy price at time of sale (for P&L calculation)
    avgBuyPrice: {
        type: Number,
        default: 0
    },
    fee: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        trim: true
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for fast queries
transactionSchema.index({ portfolioId: 1, transactionDate: -1 });
transactionSchema.index({ portfolioId: 1, coinId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
