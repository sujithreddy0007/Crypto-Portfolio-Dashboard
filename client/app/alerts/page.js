'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { alertsAPI, marketAPI } from '@/lib/api';
import toast from 'react-hot-toast';

function formatPrice(price) {
    if (!price) return '$0.00';
    return '$' + price.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export default function AlertsPage() {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [alertForm, setAlertForm] = useState({
        targetPrice: '',
        condition: 'above'
    });

    useEffect(() => {
        if (user) {
            fetchAlerts();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchAlerts = async () => {
        try {
            const response = await alertsAPI.getAll();
            setAlerts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            toast.error('Failed to load alerts');
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

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!selectedCoin || !alertForm.targetPrice) {
            toast.error('Please fill all fields');
            return;
        }

        try {
            await alertsAPI.create({
                coinId: selectedCoin.id,
                symbol: selectedCoin.symbol,
                name: selectedCoin.name,
                targetPrice: parseFloat(alertForm.targetPrice),
                condition: alertForm.condition
            });
            toast.success('Alert created');
            setShowCreate(false);
            setSelectedCoin(null);
            setSearchQuery('');
            setAlertForm({ targetPrice: '', condition: 'above' });
            fetchAlerts();
        } catch (error) {
            toast.error('Failed to create alert');
        }
    };

    const handleDelete = async (id) => {
        try {
            await alertsAPI.delete(id);
            setAlerts(prev => prev.filter(a => a._id !== id));
            toast.success('Alert deleted');
        } catch (error) {
            toast.error('Failed to delete alert');
        }
    };

    const handleToggle = async (id) => {
        try {
            await alertsAPI.toggle(id);
            setAlerts(prev => prev.map(a =>
                a._id === id ? { ...a, isActive: !a.isActive } : a
            ));
        } catch (error) {
            toast.error('Failed to toggle alert');
        }
    };

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-4">
                        Price Alerts
                    </h1>
                    <p className="text-dark-600 dark:text-dark-400 mb-8">
                        Please login to manage your price alerts
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
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 skeleton rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">
                        Price Alerts
                    </h1>
                    <p className="text-dark-600 dark:text-dark-400">
                        Get notified when prices hit your targets
                    </p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary">
                    + Create Alert
                </button>
            </div>

            {alerts.length > 0 ? (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div key={alert._id} className="card p-4 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${alert.isActive ? 'bg-crypto-green' : 'bg-dark-400'}`} />
                                <div>
                                    <p className="font-medium text-dark-900 dark:text-white">
                                        {alert.name} ({alert.symbol})
                                    </p>
                                    <p className="text-sm text-dark-500 dark:text-dark-400">
                                        Alert when price goes {alert.condition === 'above' ? 'above' : 'below'}{' '}
                                        <span className="font-medium">{formatPrice(alert.targetPrice)}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm text-dark-500 dark:text-dark-400">Current Price</p>
                                    <p className="font-medium text-dark-900 dark:text-white">
                                        {formatPrice(alert.currentPrice)}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggle(alert._id)}
                                        className={`btn-secondary text-sm ${alert.isActive ? '' : 'opacity-50'}`}
                                    >
                                        {alert.isActive ? 'Disable' : 'Enable'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(alert._id)}
                                        className="btn-danger text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card p-8 text-center">
                    <p className="text-dark-600 dark:text-dark-400 mb-4">
                        No alerts set. Create one to track price movements.
                    </p>
                    <button onClick={() => setShowCreate(true)} className="btn-primary">
                        Create Your First Alert
                    </button>
                </div>
            )}

            {/* Create Alert Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="card p-6 w-full max-w-md m-4 animate-in">
                        <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">Create Price Alert</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
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
                                <label className="label">Condition</label>
                                <select
                                    value={alertForm.condition}
                                    onChange={(e) => setAlertForm({ ...alertForm, condition: e.target.value })}
                                    className="input"
                                >
                                    <option value="above">Price goes above</option>
                                    <option value="below">Price goes below</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Target Price (USD)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={alertForm.targetPrice}
                                    onChange={(e) => setAlertForm({ ...alertForm, targetPrice: e.target.value })}
                                    className="input"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    Create Alert
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
