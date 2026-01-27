'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { coinsAPI, watchlistAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import PriceChart from '@/components/charts/PriceChart';
import toast from 'react-hot-toast';

function formatPrice(price) {
    if (!price) return '$0.00';
    if (price >= 1) return '$' + price.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return '$' + price.toFixed(8);
}

function formatNumber(num) {
    if (!num) return '-';
    if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    return '$' + num.toLocaleString();
}

function formatSupply(num, symbol) {
    if (!num) return '-';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B ' + symbol;
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M ' + symbol;
    return num.toLocaleString() + ' ' + symbol;
}

function PriceChange({ value, label }) {
    if (value === null || value === undefined) return null;
    const isPositive = value >= 0;
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-dark-500 dark:text-dark-400">{label}:</span>
            <span className={`font-medium ${isPositive ? 'text-crypto-green' : 'text-crypto-red'}`}>
                {isPositive ? '+' : ''}{value.toFixed(2)}%
            </span>
        </div>
    );
}

export default function CoinDetailPage() {
    const params = useParams();
    const coinId = params.id;
    const { user } = useAuth();

    const [coin, setCoin] = useState(null);
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [selectedTime, setSelectedTime] = useState(7);
    const [inWatchlist, setInWatchlist] = useState(false);

    useEffect(() => {
        const fetchCoin = async () => {
            try {
                const response = await coinsAPI.getCoin(coinId);
                setCoin(response.data.data);
            } catch (error) {
                console.error('Error fetching coin:', error);
                toast.error('Failed to load coin data');
            } finally {
                setLoading(false);
            }
        };

        fetchCoin();
    }, [coinId]);

    useEffect(() => {
        const fetchHistory = async () => {
            setHistoryLoading(true);
            try {
                const response = await coinsAPI.getHistory(coinId, selectedTime);
                setHistory(response.data.data);
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setHistoryLoading(false);
            }
        };

        fetchHistory();
    }, [coinId, selectedTime]);

    useEffect(() => {
        const checkWatchlist = async () => {
            if (user) {
                try {
                    const response = await watchlistAPI.check(coinId);
                    setInWatchlist(response.data.data.inWatchlist);
                } catch (error) {
                    console.error('Error checking watchlist:', error);
                }
            }
        };

        checkWatchlist();
    }, [user, coinId]);

    const handleWatchlistToggle = async () => {
        if (!user) {
            toast.error('Please login to add to watchlist');
            return;
        }

        try {
            if (inWatchlist) {
                await watchlistAPI.remove(coinId);
                setInWatchlist(false);
                toast.success('Removed from watchlist');
            } else {
                await watchlistAPI.add({
                    coinId: coin.id,
                    symbol: coin.symbol,
                    name: coin.name
                });
                setInWatchlist(true);
                toast.success('Added to watchlist');
            }
        } catch (error) {
            toast.error('Failed to update watchlist');
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 skeleton rounded-full" />
                        <div>
                            <div className="h-8 w-48 skeleton rounded mb-2" />
                            <div className="h-6 w-32 skeleton rounded" />
                        </div>
                    </div>
                    <div className="h-96 skeleton rounded-xl" />
                </div>
            </div>
        );
    }

    if (!coin) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-16">
                    <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">
                        Coin not found
                    </h1>
                    <p className="text-dark-600 dark:text-dark-400">
                        The cryptocurrency you're looking for doesn't exist.
                    </p>
                </div>
            </div>
        );
    }

    const { marketData } = coin;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-16 h-16 rounded-full"
                    />
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-dark-900 dark:text-white">
                                {coin.name}
                            </h1>
                            <span className="text-lg text-dark-500 dark:text-dark-400 uppercase">
                                {coin.symbol}
                            </span>
                            {marketData?.marketCapRank && (
                                <span className="badge bg-dark-200 dark:bg-dark-700 text-dark-600 dark:text-dark-300">
                                    Rank #{marketData.marketCapRank}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-3xl font-bold text-dark-900 dark:text-white">
                                {formatPrice(marketData?.currentPrice)}
                            </span>
                            <span className={`text-lg font-medium ${marketData?.priceChangePercentage24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                                {marketData?.priceChangePercentage24h >= 0 ? '▲' : '▼'} {Math.abs(marketData?.priceChangePercentage24h || 0).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleWatchlistToggle}
                    className={`btn ${inWatchlist ? 'btn-primary' : 'btn-secondary'}`}
                >
                    {inWatchlist ? '★ In Watchlist' : '☆ Add to Watchlist'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2">
                    <PriceChart
                        data={history}
                        loading={historyLoading}
                        selectedTime={selectedTime}
                        onTimeChange={setSelectedTime}
                    />
                </div>

                {/* Stats */}
                <div className="space-y-6">
                    {/* Price Changes */}
                    <div className="card p-4">
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-3">Price Changes</h3>
                        <div className="space-y-2">
                            <PriceChange label="1h" value={marketData?.priceChangePercentage1h} />
                            <PriceChange label="24h" value={marketData?.priceChangePercentage24h} />
                            <PriceChange label="7d" value={marketData?.priceChangePercentage7d} />
                            <PriceChange label="30d" value={marketData?.priceChangePercentage30d} />
                            <PriceChange label="1y" value={marketData?.priceChangePercentage1y} />
                        </div>
                    </div>

                    {/* Market Stats */}
                    <div className="card p-4">
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-3">Market Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-dark-500 dark:text-dark-400">Market Cap</span>
                                <span className="font-medium text-dark-900 dark:text-white">
                                    {formatNumber(marketData?.marketCap)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-dark-500 dark:text-dark-400">24h Volume</span>
                                <span className="font-medium text-dark-900 dark:text-white">
                                    {formatNumber(marketData?.volume24h)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-dark-500 dark:text-dark-400">24h High</span>
                                <span className="font-medium text-dark-900 dark:text-white">
                                    {formatPrice(marketData?.high24h)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-dark-500 dark:text-dark-400">24h Low</span>
                                <span className="font-medium text-dark-900 dark:text-white">
                                    {formatPrice(marketData?.low24h)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Supply Info */}
                    <div className="card p-4">
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-3">Supply</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-dark-500 dark:text-dark-400">Circulating</span>
                                <span className="font-medium text-dark-900 dark:text-white">
                                    {formatSupply(marketData?.circulatingSupply, coin.symbol)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-dark-500 dark:text-dark-400">Total Supply</span>
                                <span className="font-medium text-dark-900 dark:text-white">
                                    {formatSupply(marketData?.totalSupply, coin.symbol)}
                                </span>
                            </div>
                            {marketData?.maxSupply && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-dark-500 dark:text-dark-400">Max Supply</span>
                                    <span className="font-medium text-dark-900 dark:text-white">
                                        {formatSupply(marketData?.maxSupply, coin.symbol)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ATH/ATL */}
                    <div className="card p-4">
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-3">All-Time</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-dark-500 dark:text-dark-400">ATH</span>
                                    <span className="font-medium text-crypto-green">
                                        {formatPrice(marketData?.ath)}
                                    </span>
                                </div>
                                <p className="text-xs text-dark-400 text-right">
                                    {marketData?.athDate && new Date(marketData.athDate).toLocaleDateString()}
                                    <span className="ml-2 text-crypto-red">
                                        {marketData?.athChangePercentage?.toFixed(1)}%
                                    </span>
                                </p>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-dark-500 dark:text-dark-400">ATL</span>
                                    <span className="font-medium text-crypto-red">
                                        {formatPrice(marketData?.atl)}
                                    </span>
                                </div>
                                <p className="text-xs text-dark-400 text-right">
                                    {marketData?.atlDate && new Date(marketData.atlDate).toLocaleDateString()}
                                    <span className="ml-2 text-crypto-green">
                                        +{marketData?.atlChangePercentage?.toFixed(1)}%
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            {coin.description && (
                <div className="card p-6 mt-6">
                    <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">
                        About {coin.name}
                    </h2>
                    <div
                        className="prose prose-dark dark:prose-invert max-w-none text-dark-600 dark:text-dark-300"
                        dangerouslySetInnerHTML={{ __html: coin.description }}
                    />
                </div>
            )}
        </div>
    );
}
