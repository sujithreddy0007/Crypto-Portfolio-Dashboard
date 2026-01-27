'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { marketAPI } from '@/lib/api';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

function formatPrice(price) {
    if (!price) return '$0.00';
    if (price >= 1) return '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 0.01) return '$' + price.toFixed(4);
    return '$' + price.toFixed(8);
}

function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    return '$' + num.toLocaleString();
}

function PriceChange({ value }) {
    if (value === null || value === undefined) return <span className="text-dark-400">-</span>;
    const isPositive = value >= 0;
    return (
        <span className={isPositive ? 'text-crypto-green' : 'text-crypto-red'}>
            {isPositive ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
        </span>
    );
}

function Sparkline({ data, isPositive }) {
    if (!data || data.length === 0) return null;

    const chartData = data.map((price, index) => ({ value: price, index }));

    return (
        <div className="w-24 h-10">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={isPositive ? '#16c784' : '#ea3943'}
                        strokeWidth={1.5}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default function CryptoTable({ initialPage = 1, perPage = 50 }) {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(initialPage);
    const [sortBy, setSortBy] = useState('market_cap_desc');
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchCoins = async () => {
            setLoading(true);
            try {
                const response = await marketAPI.getListings(page, perPage, sortBy);
                setCoins(response.data.data || []);
                setHasMore(response.data.pagination?.hasMore);
            } catch (error) {
                console.error('Error fetching coins:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCoins();
    }, [page, perPage, sortBy]);

    const handleSort = (newSort) => {
        if (sortBy === newSort + '_desc') {
            setSortBy(newSort + '_asc');
        } else {
            setSortBy(newSort + '_desc');
        }
        setPage(1);
    };

    const SortHeader = ({ label, field, className = '' }) => (
        <th
            className={`px-4 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider cursor-pointer hover:text-dark-700 dark:hover:text-dark-200 ${className}`}
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center gap-1">
                {label}
                {sortBy.startsWith(field) && (
                    <span>{sortBy.endsWith('_desc') ? '↓' : '↑'}</span>
                )}
            </div>
        </th>
    );

    if (loading && coins.length === 0) {
        return (
            <div className="card overflow-hidden">
                <div className="animate-pulse">
                    <div className="h-12 bg-dark-100 dark:bg-dark-700" />
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="h-16 border-t border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
                    <thead className="bg-dark-50 dark:bg-dark-800">
                        <tr>
                            <SortHeader label="#" field="market_cap_rank" className="w-12" />
                            <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                                Name
                            </th>
                            <SortHeader label="Price" field="current_price" />
                            <SortHeader label="1h %" field="price_change_percentage_1h" />
                            <SortHeader label="24h %" field="price_change_percentage_24h" />
                            <SortHeader label="7d %" field="price_change_percentage_7d" />
                            <SortHeader label="Market Cap" field="market_cap" />
                            <SortHeader label="Volume (24h)" field="volume" />
                            <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                                Last 7 Days
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-900 divide-y divide-dark-200 dark:divide-dark-700">
                        {coins.map((coin) => (
                            <tr key={coin.id} className="table-row">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-500 dark:text-dark-400">
                                    {coin.rank}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <Link href={`/coin/${coin.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                        <img
                                            src={coin.image}
                                            alt={coin.name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div>
                                            <p className="font-medium text-dark-900 dark:text-white">
                                                {coin.name}
                                            </p>
                                            <p className="text-xs text-dark-500 dark:text-dark-400">
                                                {coin.symbol}
                                            </p>
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-dark-900 dark:text-white">
                                    {formatPrice(coin.currentPrice)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <PriceChange value={coin.priceChange1h} />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <PriceChange value={coin.priceChange24h} />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <PriceChange value={coin.priceChange7d} />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-300">
                                    {formatNumber(coin.marketCap)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-300">
                                    {formatNumber(coin.volume24h)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <Sparkline
                                        data={coin.sparkline}
                                        isPositive={(coin.priceChange7d || 0) >= 0}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-4 border-t border-dark-200 dark:border-dark-700 flex items-center justify-between">
                <p className="text-sm text-dark-500 dark:text-dark-400">
                    Showing {(page - 1) * perPage + 1} - {(page - 1) * perPage + coins.length} results
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!hasMore}
                        className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
