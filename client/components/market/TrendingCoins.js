'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { marketAPI } from '@/lib/api';

export default function TrendingCoins() {
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const response = await marketAPI.getTrending();
                setTrending(response.data.data?.slice(0, 7) || []);
            } catch (error) {
                console.error('Error fetching trending:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    if (loading) {
        return (
            <div className="card p-4">
                <h3 className="section-title mb-4">🔥 Trending</h3>
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
            <h3 className="section-title mb-4">🔥 Trending</h3>
            <div className="space-y-3">
                {trending.map((coin, index) => (
                    <Link
                        key={coin.id}
                        href={`/coin/${coin.id}`}
                        className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                    >
                        <span className="text-sm font-medium text-dark-400 w-4">
                            {index + 1}
                        </span>
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
                                {coin.symbol?.toUpperCase()}
                            </p>
                        </div>
                        {coin.marketCapRank && (
                            <span className="text-xs text-dark-400 bg-dark-100 dark:bg-dark-700 px-2 py-1 rounded">
                                #{coin.marketCapRank}
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
