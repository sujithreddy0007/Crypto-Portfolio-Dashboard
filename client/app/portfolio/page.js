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
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedHolding, setSelectedHolding] = useState(null);
    const [sellForm, setSellForm] = useState({ quantity: '', sellPrice: '' });
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
            } else if (selectedPortfolio) {
                // Refresh selected portfolio data
                const updated = portfolioList.find(p => p._id === selectedPortfolio._id);
                if (updated) setSelectedPortfolio(updated);
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

    const openSellModal = (holding) => {
        setSelectedHolding(holding);
        setSellForm({ quantity: '', sellPrice: holding.currentPrice?.toString() || '' });
        setShowSellModal(true);
    };

    const handleSellHolding = async (e) => {
        e.preventDefault();
        if (!selectedHolding || !sellForm.quantity) {
            toast.error('Please enter quantity to sell');
            return;
        }

        const sellQty = parseFloat(sellForm.quantity);
        if (sellQty <= 0 || sellQty > selectedHolding.quantity) {
            toast.error(`Invalid quantity. Max: ${selectedHolding.quantity}`);
            return;
        }

        try {
            const response = await portfolioAPI.sellHolding(
                selectedPortfolio._id,
                selectedHolding._id,
                {
                    quantity: sellQty,
                    sellPrice: parseFloat(sellForm.sellPrice) || null
                }
            );

            const { realizedPL, message } = response.data.data;
            const plText = realizedPL >= 0 ? `+${formatPrice(realizedPL)}` : formatPrice(realizedPL);
            toast.success(`${message}\nRealized P&L: ${plText}`);

            setShowSellModal(false);
            setSelectedHolding(null);
            setSellForm({ quantity: '', sellPrice: '' });
            fetchPortfolios();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sell holding');
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
                        <>
                            <button onClick={() => setShowAddHolding(true)} className="btn-primary">
                                + Add Holding
                            </button>
                            <div className="relative group">
                                <button className="btn-secondary flex items-center gap-2">
                                    📥 Download
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-dark-200 dark:border-dark-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    <a
                                        href={portfolioAPI.downloadCSV(selectedPortfolio._id)}
                                        className="block px-4 py-3 text-sm text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-700 rounded-t-lg"
                                    >
                                        📄 Download CSV
                                    </a>
                                    <a
                                        href={portfolioAPI.downloadHTML(selectedPortfolio._id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block px-4 py-3 text-sm text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-700 rounded-b-lg"
                                    >
                                        🖨️ View & Print Report
                                    </a>
                                </div>
                            </div>
                        </>
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
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => openSellModal(holding)}
                                                                    className="px-3 py-1 bg-crypto-green/10 text-crypto-green hover:bg-crypto-green/20 rounded text-sm font-medium transition-colors"
                                                                >
                                                                    Sell
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteHolding(holding._id)}
                                                                    className="text-crypto-red hover:underline text-sm"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
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

            {/* Sell Holding Modal */}
            {showSellModal && selectedHolding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="card p-6 w-full max-w-md m-4 animate-in">
                        <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">
                            Sell {selectedHolding.name}
                        </h2>

                        {/* Holding Info */}
                        <div className="bg-dark-50 dark:bg-dark-700 rounded-lg p-4 mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-dark-500">Available</span>
                                <span className="font-medium text-dark-900 dark:text-white">
                                    {selectedHolding.quantity} {selectedHolding.symbol}
                                </span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-dark-500">Buy Price</span>
                                <span className="text-dark-600 dark:text-dark-300">
                                    {formatPrice(selectedHolding.buyPrice)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-dark-500">Current Price</span>
                                <span className="text-dark-900 dark:text-white font-medium">
                                    {formatPrice(selectedHolding.currentPrice)}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSellHolding} className="space-y-4">
                            <div>
                                <label className="label">Quantity to Sell</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="any"
                                        max={selectedHolding.quantity}
                                        value={sellForm.quantity}
                                        onChange={(e) => setSellForm({ ...sellForm, quantity: e.target.value })}
                                        className="input pr-16"
                                        placeholder="0.00"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSellForm({ ...sellForm, quantity: selectedHolding.quantity.toString() })}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        MAX
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="label">Sell Price (USD)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={sellForm.sellPrice}
                                    onChange={(e) => setSellForm({ ...sellForm, sellPrice: e.target.value })}
                                    className="input"
                                    placeholder="Current market price"
                                />
                                <p className="text-xs text-dark-500 mt-1">Leave empty to use current market price</p>
                            </div>

                            {/* P&L Preview */}
                            {sellForm.quantity && parseFloat(sellForm.quantity) > 0 && (
                                <div className="bg-dark-50 dark:bg-dark-700 rounded-lg p-4">
                                    <p className="text-sm text-dark-500 mb-2">Estimated Result</p>
                                    {(() => {
                                        const qty = parseFloat(sellForm.quantity) || 0;
                                        const sellPrice = parseFloat(sellForm.sellPrice) || selectedHolding.currentPrice || 0;
                                        const saleValue = qty * sellPrice;
                                        const costBasis = qty * selectedHolding.buyPrice;
                                        const pl = saleValue - costBasis;
                                        const plPercent = costBasis > 0 ? (pl / costBasis) * 100 : 0;

                                        return (
                                            <>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-dark-600 dark:text-dark-300">Sale Value</span>
                                                    <span className="font-medium text-dark-900 dark:text-white">{formatPrice(saleValue)}</span>
                                                </div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-dark-600 dark:text-dark-300">Cost Basis</span>
                                                    <span className="text-dark-600 dark:text-dark-300">{formatPrice(costBasis)}</span>
                                                </div>
                                                <div className="flex justify-between pt-2 border-t border-dark-200 dark:border-dark-600">
                                                    <span className="font-medium text-dark-900 dark:text-white">Realized P&L</span>
                                                    <span className={`font-bold ${pl >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                                                        {pl >= 0 ? '+' : ''}{formatPrice(pl)} ({plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}%)
                                                    </span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSellModal(false);
                                        setSelectedHolding(null);
                                    }}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1 bg-crypto-green hover:bg-crypto-green/90">
                                    Sell {selectedHolding.symbol}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

