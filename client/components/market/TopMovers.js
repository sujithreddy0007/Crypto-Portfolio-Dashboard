'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { marketAPI } from '@/lib/api';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function TopMovers() {
    const [data, setData] = useState({ gainers: [], losers: [] });
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('gainers');
    const { formatPrice } = useCurrency();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await marketAPI.getGainersLosers();
                setData(response.data.data);
            } catch (error) {
                console.error('Error fetching top movers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const coins = tab === 'gainers' ? data.gainers : data.losers;

    if (loading) {
        return (
            <div className="card p-4">
                <h3 className="section-title mb-4">📈 Top Movers</h3>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-8 h-8 skeleton rounded-full" />
                            <div className="flex-1">
                                <div className="h-4 w-24 skeleton rounded mb-1" />
                                <div className="h-3 w-16 skeleton rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">📈 Top Movers</h3>
                <div className="flex rounded-lg bg-dark-100 dark:bg-dark-700 p-1">
                    <button
                        onClick={() => setTab('gainers')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${tab === 'gainers'
                            ? 'bg-white dark:bg-dark-600 text-crypto-green shadow-sm'
                            : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                            }`}
                    >
                        Gainers
                    </button>
                    <button
                        onClick={() => setTab('losers')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${tab === 'losers'
                            ? 'bg-white dark:bg-dark-600 text-crypto-red shadow-sm'
                            : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                            }`}
                    >
                        Losers
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {coins.map((coin) => (
                    <Link
                        key={coin.id}
                        href={`/coin/${coin.id}`}
                        className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                    >
                        <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-dark-900 dark:text-white truncate">
                                {coin.name}
                            </p>
                            <p className="text-xs text-dark-500 dark:text-dark-400">
                                {formatPrice(coin.currentPrice)}
                            </p>
                        </div>
                        <span
                            className={`text-sm font-medium ${coin.priceChange24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'
                                }`}
                        >
                            {coin.priceChange24h >= 0 ? '+' : ''}
                            {coin.priceChange24h?.toFixed(2)}%
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
