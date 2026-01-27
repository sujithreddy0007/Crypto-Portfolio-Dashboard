'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { marketAPI } from '@/lib/api';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchCoins = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const response = await marketAPI.search(query);
                setResults(response.data.data || []);
                setIsOpen(true);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(searchCoins, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const handleSelect = (coin) => {
        setQuery('');
        setIsOpen(false);
        router.push(`/coin/${coin.id}`);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder="Search coins..."
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 rounded-lg border border-dark-200 dark:border-dark-700 shadow-xl max-h-80 overflow-y-auto z-50 animate-fade-in">
                    {results.map((coin) => (
                        <button
                            key={coin.id}
                            onClick={() => handleSelect(coin)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors text-left"
                        >
                            {coin.image && (
                                <img
                                    src={coin.image}
                                    alt={coin.name}
                                    className="w-6 h-6 rounded-full"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-dark-900 dark:text-white truncate">
                                    {coin.name}
                                </p>
                                <p className="text-xs text-dark-500 dark:text-dark-400">
                                    {coin.symbol}
                                </p>
                            </div>
                            {coin.marketCapRank && (
                                <span className="text-xs text-dark-400 dark:text-dark-500">
                                    #{coin.marketCapRank}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
