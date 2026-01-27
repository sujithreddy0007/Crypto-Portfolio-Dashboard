# Crypto Portfolio Tracker

A production-ready cryptocurrency portfolio tracker and market dashboard, inspired by CoinMarketCap.

## Features

- 📈 **Live Market Data** - Real-time cryptocurrency prices from CoinGecko API
- 💼 **Portfolio Tracking** - Track your crypto investments with profit/loss calculations
- ⭐ **Watchlist** - Save favorite cryptocurrencies for quick access
- 🔔 **Price Alerts** - Set custom price alerts for any cryptocurrency
- 📊 **Interactive Charts** - Price history charts with multiple timeframes
- 📰 **News Feed** - Latest cryptocurrency news
- 🌙 **Dark/Light Mode** - Beautiful UI with theme support
- 🔐 **Authentication** - Secure JWT-based authentication

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **CoinGecko API** for market data
- **CryptoPanic API** for news

### Frontend
- **Next.js 14** with App Router
- **React 18**
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Axios** for API calls

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Crypto_portfolio_tracker(fsd)
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   
   # Create .env file from example
   cp .env.example .env
   # Edit .env with your configuration
   
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Open in browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Environment Variables

#### Server (.env)
```env
MONGODB_URI=mongodb://localhost:27017/crypto-portfolio
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
COINGECKO_API_KEY=optional-api-key
CRYPTOPANIC_API_KEY=optional-api-key
CLIENT_URL=http://localhost:3000
```

## Project Structure

```
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── contexts/          # React context providers
│   └── lib/               # Utilities and API client
│
└── server/                 # Express backend
    ├── config/            # Database config
    ├── middleware/        # Auth middleware
    ├── models/            # Mongoose models
    ├── routes/            # API routes
    └── services/          # Business logic
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Market
- `GET /api/market/global` - Global market stats
- `GET /api/market/listings` - Cryptocurrency listings
- `GET /api/market/trending` - Trending coins
- `GET /api/market/search` - Search coins

### Coins
- `GET /api/coins/:id` - Coin details
- `GET /api/coins/:id/history` - Price history

### Portfolio
- `GET /api/portfolio` - Get user portfolios
- `POST /api/portfolio` - Create portfolio
- `POST /api/portfolio/:id/holdings` - Add holding

### Watchlist
- `GET /api/watchlist` - Get watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:coinId` - Remove from watchlist

### Alerts
- `GET /api/alerts` - Get alerts
- `POST /api/alerts` - Create alert
- `DELETE /api/alerts/:id` - Delete alert

## License

MIT
