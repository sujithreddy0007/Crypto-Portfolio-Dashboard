'use client';

import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function CurrencySelector() {
    const { currency, currencies, changeCurrency, loading } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (code) => {
        changeCurrency(code);
        setIsOpen(false);
    };

    const currentCurrency = currencies.find(c => c.code === currency);

    if (loading) {
        return (
            <div className="w-20 h-9 bg-dark-100 dark:bg-dark-700 rounded-lg animate-pulse" />
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors text-sm font-medium"
            >
                <span className="text-lg">{currentCurrency?.symbol || '$'}</span>
                <span className="hidden sm:inline">{currency}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-dark-200 dark:border-dark-700 z-50 animate-in">
                    <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">
                            Select Currency
                        </div>
                        {currencies.map((curr) => (
                            <button
                                key={curr.code}
                                onClick={() => handleSelect(curr.code)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${currency === curr.code
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                        : 'hover:bg-dark-100 dark:hover:bg-dark-700'
                                    }`}
                            >
                                <span className="text-xl w-6 text-center">{curr.symbol}</span>
                                <div className="flex-1">
                                    <div className="font-medium">{curr.code}</div>
                                    <div className="text-xs text-dark-500 dark:text-dark-400">
                                        {curr.name}
                                    </div>
                                </div>
                                {currency === curr.code && (
                                    <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
