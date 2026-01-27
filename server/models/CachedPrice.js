const mongoose = require('mongoose');

const cachedPriceSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['listings', 'global', 'trending', 'coin', 'history'],
        required: true
    },
    key: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    }
});

// Compound index for fast lookups
cachedPriceSchema.index({ type: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('CachedPrice', cachedPriceSchema);
