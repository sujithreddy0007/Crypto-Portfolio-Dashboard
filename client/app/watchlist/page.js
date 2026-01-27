'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { watchlistAPI } from '@/lib/api';
import toast from 'react-hot-toast';

function formatPrice(price) {
    if (!price) return '$0.00';
    return '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function WatchlistPage() {
    const { user } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchWatchlist();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchWatchlist = async () => {
        try {
            const response = await watchlistAPI.getAll();
            setWatchlist(response.data.data || []);
        } catch (error) {
            console.error('Error fetching watchlist:', error);
            toast.error('Failed to load watchlist');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (coinId) => {
        try {
            await watchlistAPI.remove(coinId);
            setWatchlist(prev => prev.filter(item => item.coinId !== coinId));
            toast.success('Removed from watchlist');
        } catch (error) {
            toast.error('Failed to remove from watchlist');
        }
    };

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-4">
                        Watchlist
                    </h1>
                    <p className="text-dark-600 dark:text-dark-400 mb-8">
                        Please login to view your watchlist
                    </p>
                    <Link href="/login" className="btn-primary">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="h-10 w-48 skeleton rounded mb-6" />
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 skeleton rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">
                    Watchlist
                </h1>
                <p className="text-dark-600 dark:text-dark-400">
                    Track your favorite cryptocurrencies
                </p>
            </div>

            {watchlist.length > 0 ? (
                <div className="card overflow-hidden">
                    <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
                        <thead className="bg-dark-50 dark:bg-dark-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase">Coin</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-dark-500 uppercase">Price</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-dark-500 uppercase">24h Change</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-dark-500 uppercase">Market Cap</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-dark-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                            {watchlist.map((item) => (
                                <tr key={item._id} className="table-row">
                                    <td className="px-4 py-4">
                                        <Link href={`/coin/${item.coinId}`} className="flex items-center gap-3 hover:opacity-80">
                                            <div>
                                                <p className="font-medium text-dark-900 dark:text-white">{item.name}</p>
                                                <p className="text-xs text-dark-500">{item.symbol}</p>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-4 text-right font-medium text-dark-900 dark:text-white">
                                        {formatPrice(item.currentPrice)}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className={item.priceChange24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}>
                                            {item.priceChange24h >= 0 ? '+' : ''}{item.priceChange24h?.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right text-dark-600 dark:text-dark-300">
                                        {item.marketCap ? formatPrice(item.marketCap) : '-'}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            onClick={() => handleRemove(item.coinId)}
                                            className="text-crypto-red hover:underline text-sm"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card p-8 text-center">
                    <p className="text-dark-600 dark:text-dark-400 mb-4">
                        Your watchlist is empty. Start adding coins from the market pages.
                    </p>
                    <Link href="/cryptocurrencies" className="btn-primary">
                        Browse Cryptocurrencies
                    </Link>
                </div>
            )}
        </div>
    );
}
