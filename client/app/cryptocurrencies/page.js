import GlobalStats from '@/components/market/GlobalStats';
import CryptoTable from '@/components/market/CryptoTable';

export const metadata = {
    title: 'All Cryptocurrencies - CryptoTracker',
    description: 'View all cryptocurrency prices, market caps, and trading volumes.',
};

export default function CryptocurrenciesPage() {
    return (
        <div>
            <GlobalStats />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">
                        All Cryptocurrencies
                    </h1>
                    <p className="text-dark-600 dark:text-dark-400">
                        Browse the full list of cryptocurrencies sorted by market cap, price, and more.
                    </p>
                </div>

                <CryptoTable perPage={100} />
            </div>
        </div>
    );
}
