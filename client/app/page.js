import GlobalStats from '@/components/market/GlobalStats';
import CryptoTable from '@/components/market/CryptoTable';
import TrendingCoins from '@/components/market/TrendingCoins';
import TopMovers from '@/components/market/TopMovers';

export default function HomePage() {
    return (
        <div>
            <GlobalStats />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-2">
                        Today's Cryptocurrency Prices
                    </h1>
                    <p className="text-dark-600 dark:text-dark-400">
                        The global crypto market cap is constantly changing. Track real-time prices and market data.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content - Crypto Table */}
                    <div className="lg:col-span-3">
                        <CryptoTable perPage={50} />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <TrendingCoins />
                        <TopMovers />
                    </div>
                </div>
            </div>
        </div>
    );
}
