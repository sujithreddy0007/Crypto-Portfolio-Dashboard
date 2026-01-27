const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
    portfolioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Portfolio',
        required: true
    },
    coinId: {
        type: String,
        required: [true, 'Coin ID is required']
    },
    symbol: {
        type: String,
        required: [true, 'Coin symbol is required'],
        uppercase: true
    },
    name: {
        type: String,
        required: [true, 'Coin name is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative']
    },
    buyPrice: {
        type: Number,
        required: [true, 'Buy price is required'],
        min: [0, 'Buy price cannot be negative']
    },
    buyDate: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate invested amount virtual field
holdingSchema.virtual('investedAmount').get(function () {
    return this.quantity * this.buyPrice;
});

// Update timestamp on save
holdingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Include virtuals in JSON
holdingSchema.set('toJSON', { virtuals: true });
holdingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Holding', holdingSchema);
