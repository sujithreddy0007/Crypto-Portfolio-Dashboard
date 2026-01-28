require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/market');
const coinsRoutes = require('./routes/coins');
const portfolioRoutes = require('./routes/portfolio');
const watchlistRoutes = require('./routes/watchlist');
const alertsRoutes = require('./routes/alerts');
const newsRoutes = require('./routes/news');
const chatRoutes = require('./routes/chat');
const currencyRoutes = require('./routes/currency');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/coins', coinsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/currency', currencyRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
