const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
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
    targetPrice: {
        type: Number,
        required: [true, 'Target price is required'],
        min: [0, 'Target price cannot be negative']
    },
    condition: {
        type: String,
        enum: ['above', 'below'],
        required: [true, 'Condition is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    triggered: {
        type: Boolean,
        default: false
    },
    triggeredAt: {
        type: Date
    },
    notificationSent: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alert', alertSchema);
