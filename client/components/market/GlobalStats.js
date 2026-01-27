'use client';

import { useEffect, useState } from 'react';
import { marketAPI } from '@/lib/api';

function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num?.toLocaleString() || '0';
}

export default function GlobalStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await marketAPI.getGlobal();
                setStats(response.data.data);
            } catch (error) {
                console.error('Error fetching global stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-dark-50 dark:bg-dark-800/50 py-3 animate-pulse">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-4 w-32 skeleton rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="bg-dark-50 dark:bg-dark-800/50 py-3 border-b border-dark-200 dark:border-dark-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-8 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-dark-500 dark:text-dark-400">Cryptos:</span>
                        <span className="font-medium text-dark-900 dark:text-white">
                            {stats.activeCryptos?.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-dark-500 dark:text-dark-400">Market Cap:</span>
                        <span className="font-medium text-dark-900 dark:text-white">
                            ${formatNumber(stats.totalMarketCap)}
                        </span>
                        <span className={`text-xs ${stats.marketCapChange24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                            {stats.marketCapChange24h >= 0 ? '▲' : '▼'} {Math.abs(stats.marketCapChange24h).toFixed(2)}%
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-dark-500 dark:text-dark-400">24h Vol:</span>
                        <span className="font-medium text-dark-900 dark:text-white">
                            ${formatNumber(stats.totalVolume)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-dark-500 dark:text-dark-400">BTC Dominance:</span>
                        <span className="font-medium text-crypto-gold">
                            {stats.btcDominance?.toFixed(1)}%
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-dark-500 dark:text-dark-400">ETH Dominance:</span>
                        <span className="font-medium text-crypto-purple">
                            {stats.ethDominance?.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
