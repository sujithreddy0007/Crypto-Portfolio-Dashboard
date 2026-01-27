'use client';

import { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

const TIME_OPTIONS = [
    { label: '1D', value: 1 },
    { label: '7D', value: 7 },
    { label: '1M', value: 30 },
    { label: '3M', value: 90 },
    { label: '1Y', value: 365 },
    { label: 'ALL', value: 'max' },
];

function formatPrice(price) {
    if (!price) return '$0.00';
    if (price >= 1) return '$' + price.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return '$' + price.toFixed(6);
}

function formatDate(timestamp, days) {
    const date = new Date(timestamp);
    if (days <= 1) {
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
    if (days <= 30) {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-600 rounded-lg shadow-lg p-3">
            <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">
                {new Date(label).toLocaleString()}
            </p>
            <p className="font-semibold text-dark-900 dark:text-white">
                {formatPrice(payload[0].value)}
            </p>
        </div>
    );
};

export default function PriceChart({ data, loading, onTimeChange, selectedTime = 7 }) {
    const [hoveredPrice, setHoveredPrice] = useState(null);

    if (loading) {
        return (
            <div className="card p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-32 skeleton rounded" />
                    <div className="flex gap-2">
                        {TIME_OPTIONS.map((_, i) => (
                            <div key={i} className="h-8 w-10 skeleton rounded" />
                        ))}
                    </div>
                </div>
                <div className="h-80 skeleton rounded" />
            </div>
        );
    }

    const chartData = data?.prices?.map(item => ({
        timestamp: item.timestamp,
        price: item.price
    })) || [];

    const priceChange = chartData.length > 1
        ? ((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price) * 100
        : 0;
    const isPositive = priceChange >= 0;
    const chartColor = isPositive ? '#16c784' : '#ea3943';

    return (
        <div className="card p-6">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">Price Chart</p>
                    {hoveredPrice && (
                        <p className="text-2xl font-bold text-dark-900 dark:text-white">
                            {formatPrice(hoveredPrice)}
                        </p>
                    )}
                </div>
                <div className="flex gap-1 bg-dark-100 dark:bg-dark-700 rounded-lg p-1">
                    {TIME_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onTimeChange?.(option.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${selectedTime === option.value
                                    ? 'bg-white dark:bg-dark-600 text-dark-900 dark:text-white shadow-sm'
                                    : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        onMouseMove={(e) => {
                            if (e.activePayload) {
                                setHoveredPrice(e.activePayload[0].value);
                            }
                        }}
                        onMouseLeave={() => setHoveredPrice(null)}
                    >
                        <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(ts) => formatDate(ts, selectedTime)}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={50}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tickFormatter={formatPrice}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke={chartColor}
                            strokeWidth={2}
                            fill="url(#priceGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
