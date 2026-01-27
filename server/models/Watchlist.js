const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coinId: {
        type: String,
        required: [true, 'Coin ID is required']
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
    addedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate coins in user's watchlist
watchlistSchema.index({ userId: 1, coinId: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
