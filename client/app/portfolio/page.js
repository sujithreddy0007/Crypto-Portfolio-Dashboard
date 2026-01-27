'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { portfolioAPI, marketAPI } from '@/lib/api';
import AllocationPieChart from '@/components/charts/AllocationPieChart';
import toast from 'react-hot-toast';
import Link from 'next/link';

function formatPrice(price) {
    if (!price) return '$0.00';
    return '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(value) {
    if (value === null || value === undefined) return '-';
    const isPositive = value >= 0;
    return (
        <span className={isPositive ? 'text-crypto-green' : 'text-crypto-red'}>
            {isPositive ? '+' : ''}{value.toFixed(2)}%
        </span>
    );
}

export default function PortfolioPage() {
    const { user } = useAuth();
    const [portfolios, setPortfolios] = useState([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddHolding, setShowAddHolding] = useState(false);
    const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [holdingForm, setHoldingForm] = useState({
        quantity: '',
        buyPrice: '',
        buyDate: new Date().toISOString().split('T')[0]
    });
    const [newPortfolioName, setNewPortfolioName] = useState('');

    useEffect(() => {
        if (user) {
            fetchPortfolios();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchPortfolios = async () => {
        try {
            const response = await portfolioAPI.getAll();
            const portfolioList = response.data.data || [];
            setPortfolios(portfolioList);
            if (portfolioList.length > 0 && !selectedPortfolio) {
                setSelectedPortfolio(portfolioList[0]);
            }
        } catch (error) {
            console.error('Error fetching portfolios:', error);
            toast.error('Failed to load portfolios');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const response = await marketAPI.search(query);
            setSearchResults(response.data.data || []);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleAddHolding = async (e) => {
        e.preventDefault();
        if (!selectedCoin || !holdingForm.quantity || !holdingForm.buyPrice) {
            toast.error('Please fill all fields');
            return;
        }

        try {
            await portfolioAPI.addHolding(selectedPortfolio._id, {
                coinId: selectedCoin.id,
                symbol: selectedCoin.symbol,
                name: selectedCoin.name,
                quantity: parseFloat(holdingForm.quantity),
                buyPrice: parseFloat(holdingForm.buyPrice),
                buyDate: holdingForm.buyDate
            });
            toast.success('Holding added successfully');
            setShowAddHolding(false);
            setSelectedCoin(null);
            setSearchQuery('');
            setHoldingForm({ quantity: '', buyPrice: '', buyDate: new Date().toISOString().split('T')[0] });
            fetchPortfolios();
        } catch (error) {
            toast.error('Failed to add holding');
        }
    };

    const handleDeleteHolding = async (holdingId) => {
        if (!confirm('Are you sure you want to delete this holding?')) return;
        try {
            await portfolioAPI.deleteHolding(holdingId);
            toast.success('Holding deleted');
            fetchPortfolios();
        } catch (error) {
            toast.error('Failed to delete holding');
        }
    };

    const handleCreatePortfolio = async (e) => {
        e.preventDefault();
        if (!newPortfolioName.trim()) {
            toast.error('Please enter a portfolio name');
            return;
        }
        try {
            await portfolioAPI.create({ name: newPortfolioName });
            toast.success('Portfolio created');
            setShowCreatePortfolio(false);
            setNewPortfolioName('');
            fetchPortfolios();
        } catch (error) {
            toast.error('Failed to create portfolio');
        }
    };

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-4">
                        Portfolio Tracker
                    </h1>
                    <p className="text-dark-600 dark:text-dark-400 mb-8">
                        Please login to view and manage your portfolio
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
                    <div className="h-10 w-64 skeleton rounded mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 skeleton rounded-xl" />
                        ))}
                    </div>
                    <div className="h-96 skeleton rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-dark-900 dark:text-white">
                        My Portfolio
                    </h1>
                    <p className="text-dark-600 dark:text-dark-400">
                        Track your cryptocurrency investments
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowCreatePortfolio(true)} className="btn-secondary">
                        + New Portfolio
                    </button>
                    {selectedPortfolio && (
                        <button onClick={() => setShowAddHolding(true)} className="btn-primary">
                            + Add Holding
                        </button>
                    )}
                </div>
            </div>

            {/* Portfolio Selector */}
            {portfolios.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {portfolios.map((portfolio) => (
                        <button
                            key={portfolio._id}
                            onClick={() => setSelectedPortfolio(portfolio)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPortfolio?._id === portfolio._id
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                                }`}
                        >
                            {portfolio.name}
                        </button>
                    ))}
                </div>
            )}

            {selectedPortfolio ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="stat-card">
                            <p className="text-sm text-dark-500 dark:text-dark-400">Total Value</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">
                                {formatPrice(selectedPortfolio.currentValue)}
                            </p>
                        </div>
                        <div className="stat-card">
                            <p className="text-sm text-dark-500 dark:text-dark-400">Total Invested</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">
                                {formatPrice(selectedPortfolio.totalInvested)}
                            </p>
                        </div>
                        <div className="stat-card">
                            <p className="text-sm text-dark-500 dark:text-dark-400">Profit/Loss</p>
                            <p className={`text-2xl font-bold ${selectedPortfolio.profitLoss >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                                {selectedPortfolio.profitLoss >= 0 ? '+' : ''}{formatPrice(selectedPortfolio.profitLoss)}
                            </p>
                        </div>
                        <div className="stat-card">
                            <p className="text-sm text-dark-500 dark:text-dark-400">Return</p>
                            <p className={`text-2xl font-bold ${selectedPortfolio.profitLossPercentage >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                                {selectedPortfolio.profitLossPercentage >= 0 ? '+' : ''}{selectedPortfolio.profitLossPercentage?.toFixed(2)}%
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Holdings Table */}
                        <div className="lg:col-span-2">
                            <div className="card overflow-hidden">
                                <div className="p-4 border-b border-dark-200 dark:border-dark-700">
                                    <h2 className="font-semibold text-dark-900 dark:text-white">Holdings</h2>
                                </div>
                                {selectedPortfolio.holdings?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
                                            <thead className="bg-dark-50 dark:bg-dark-800">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase">Asset</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-dark-500 uppercase">Quantity</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-dark-500 uppercase">Buy Price</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-dark-500 uppercase">Current</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-dark-500 uppercase">P/L</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-dark-500 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                                                {selectedPortfolio.holdings.map((holding) => (
                                                    <tr key={holding._id} className="table-row">
                                                        <td className="px-4 py-4">
                                                            <Link href={`/coin/${holding.coinId}`} className="flex items-center gap-2 hover:opacity-80">
                                                                <span className="font-medium text-dark-900 dark:text-white">{holding.name}</span>
                                                                <span className="text-xs text-dark-500">{holding.symbol}</span>
                                                            </Link>
                                                        </td>
                                                        <td className="px-4 py-4 text-right text-dark-600 dark:text-dark-300">
                                                            {holding.quantity}
                                                        </td>
                                                        <td className="px-4 py-4 text-right text-dark-600 dark:text-dark-300">
                                                            {formatPrice(holding.buyPrice)}
                                                        </td>
                                                        <td className="px-4 py-4 text-right text-dark-900 dark:text-white font-medium">
                                                            {formatPrice(holding.currentPrice)}
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <div className={holding.profitLoss >= 0 ? 'text-crypto-green' : 'text-crypto-red'}>
                                                                <p className="font-medium">{holding.profitLoss >= 0 ? '+' : ''}{formatPrice(holding.profitLoss)}</p>
                                                                <p className="text-xs">{formatPercent(holding.profitLossPercentage)}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <button
                                                                onClick={() => handleDeleteHolding(holding._id)}
                                                                className="text-crypto-red hover:underline text-sm"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-dark-500 dark:text-dark-400">
                                        No holdings yet. Click "Add Holding" to get started.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Allocation Chart */}
                        <div className="lg:col-span-1">
                            <AllocationPieChart data={selectedPortfolio.allocation} />
                        </div>
                    </div>
                </>
            ) : (
                <div className="card p-8 text-center">
                    <p className="text-dark-600 dark:text-dark-400 mb-4">
                        You don't have any portfolios yet.
                    </p>
                    <button onClick={() => setShowCreatePortfolio(true)} className="btn-primary">
                        Create Your First Portfolio
                    </button>
                </div>
            )}

            {/* Add Holding Modal */}
            {showAddHolding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="card p-6 w-full max-w-md m-4 animate-in">
                        <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">Add Holding</h2>
                        <form onSubmit={handleAddHolding} className="space-y-4">
                            <div>
                                <label className="label">Search Coin</label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search for a coin..."
                                    className="input"
                                />
                                {searchResults.length > 0 && !selectedCoin && (
                                    <div className="mt-2 max-h-40 overflow-y-auto border border-dark-200 dark:border-dark-700 rounded-lg">
                                        {searchResults.map((coin) => (
                                            <button
                                                key={coin.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCoin(coin);
                                                    setSearchQuery(coin.name);
                                                    setSearchResults([]);
                                                }}
                                                className="w-full flex items-center gap-2 p-2 hover:bg-dark-50 dark:hover:bg-dark-700 text-left"
                                            >
                                                {coin.image && <img src={coin.image} alt="" className="w-6 h-6 rounded-full" />}
                                                <span>{coin.name}</span>
                                                <span className="text-dark-500 text-sm">({coin.symbol})</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="label">Quantity</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={holdingForm.quantity}
                                    onChange={(e) => setHoldingForm({ ...holdingForm, quantity: e.target.value })}
                                    className="input"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="label">Buy Price (USD)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={holdingForm.buyPrice}
                                    onChange={(e) => setHoldingForm({ ...holdingForm, buyPrice: e.target.value })}
                                    className="input"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="label">Buy Date</label>
                                <input
                                    type="date"
                                    value={holdingForm.buyDate}
                                    onChange={(e) => setHoldingForm({ ...holdingForm, buyDate: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setShowAddHolding(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    Add Holding
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Portfolio Modal */}
            {showCreatePortfolio && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="card p-6 w-full max-w-md m-4 animate-in">
                        <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">Create Portfolio</h2>
                        <form onSubmit={handleCreatePortfolio} className="space-y-4">
                            <div>
                                <label className="label">Portfolio Name</label>
                                <input
                                    type="text"
                                    value={newPortfolioName}
                                    onChange={(e) => setNewPortfolioName(e.target.value)}
                                    className="input"
                                    placeholder="My Portfolio"
                                />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setShowCreatePortfolio(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
