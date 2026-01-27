'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308',
    '#22c55e', '#06b6d4', '#6366f1', '#f43f5e', '#14b8a6'
];

function formatValue(value) {
    if (!value) return '$0';
    if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K';
    return '$' + value.toFixed(2);
}

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
        <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-600 rounded-lg shadow-lg p-3">
            <p className="font-medium text-dark-900 dark:text-white mb-1">
                {data.name} ({data.symbol})
            </p>
            <p className="text-sm text-dark-600 dark:text-dark-300">
                {formatValue(data.value)}
            </p>
            <p className="text-xs text-dark-500 dark:text-dark-400">
                {data.percentage?.toFixed(1)}% of portfolio
            </p>
        </div>
    );
};

const CustomLegend = ({ payload }) => {
    return (
        <div className="flex flex-wrap justify-center gap-3 mt-4">
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-dark-600 dark:text-dark-400">
                        {entry.payload.symbol} ({entry.payload.percentage?.toFixed(1)}%)
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function AllocationPieChart({ data = [], loading }) {
    if (loading) {
        return (
            <div className="card p-6">
                <h3 className="section-title mb-4">Portfolio Allocation</h3>
                <div className="h-64 skeleton rounded" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="card p-6">
                <h3 className="section-title mb-4">Portfolio Allocation</h3>
                <div className="h-64 flex items-center justify-center text-dark-500 dark:text-dark-400">
                    No holdings to display
                </div>
            </div>
        );
    }

    const chartData = data.map(item => ({
        name: item.name,
        symbol: item.symbol,
        value: item.value,
        percentage: item.percentage
    }));

    return (
        <div className="card p-6">
            <h3 className="section-title mb-4">Portfolio Allocation</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
