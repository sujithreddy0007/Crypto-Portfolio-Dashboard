'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CurrencyContext = createContext();

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

export function CurrencyProvider({ children }) {
    const [currency, setCurrency] = useState('USD');
    const [currencySymbol, setCurrencySymbol] = useState('$');
    const [currencies, setCurrencies] = useState([]);
    const [exchangeRates, setExchangeRates] = useState({});
    const [loading, setLoading] = useState(true);

    // Load saved currency preference
    useEffect(() => {
        const savedCurrency = localStorage.getItem('preferredCurrency');
        if (savedCurrency) {
            setCurrency(savedCurrency);
        }
        fetchCurrencies();
        fetchExchangeRates();
    }, []);

    // Fetch supported currencies
    const fetchCurrencies = async () => {
        try {
            const response = await axios.get('/api/currency/list');
            if (response.data.success) {
                setCurrencies(response.data.data);
                // Set symbol for current currency
                const current = response.data.data.find(c => c.code === currency);
                if (current) setCurrencySymbol(current.symbol);
            }
        } catch (error) {
            console.error('Error fetching currencies:', error);
            // Fallback currencies
            setCurrencies([
                { code: 'USD', symbol: '$', name: 'US Dollar' },
                { code: 'EUR', symbol: '€', name: 'Euro' },
                { code: 'GBP', symbol: '£', name: 'British Pound' },
                { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch exchange rates
    const fetchExchangeRates = async () => {
        try {
            const response = await axios.get('/api/currency/rates');
            if (response.data.success) {
                setExchangeRates(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching rates:', error);
        }
    };

    // Change currency
    const changeCurrency = (newCurrency) => {
        setCurrency(newCurrency);
        localStorage.setItem('preferredCurrency', newCurrency);

        const currencyInfo = currencies.find(c => c.code === newCurrency);
        if (currencyInfo) {
            setCurrencySymbol(currencyInfo.symbol);
        }
    };

    // Convert USD price to selected currency
    const convertPrice = (priceInUsd) => {
        if (!priceInUsd || currency === 'USD') return priceInUsd;

        // If exchangeRates is null or empty, return original price
        if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
            return priceInUsd;
        }

        const rate = exchangeRates[currency];
        if (!rate) return priceInUsd;

        return priceInUsd * rate;
    };

    // Format price with currency symbol
    const formatPrice = (price, options = {}) => {
        if (price === null || price === undefined) return '-';

        const convertedPrice = options.alreadyConverted ? price : convertPrice(price);

        const formatted = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: convertedPrice >= 1 ? 2 : 6
        }).format(convertedPrice);

        return `${currencySymbol}${formatted}`;
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            currencySymbol,
            currencies,
            exchangeRates,
            loading,
            changeCurrency,
            convertPrice,
            formatPrice,
            refreshRates: fetchExchangeRates
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}
