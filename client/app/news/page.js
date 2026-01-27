'use client';

import { useState, useEffect } from 'react';
import { newsAPI } from '@/lib/api';

export default function NewsPage() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await newsAPI.getAll(20);
                setNews(response.data.data || []);
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="h-10 w-48 skeleton rounded mb-6" />
                    <div className="grid gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-32 skeleton rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffHours < 48) return 'Yesterday';
        return date.toLocaleDateString();
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">
                    Crypto News
                </h1>
                <p className="text-dark-600 dark:text-dark-400">
                    Stay updated with the latest cryptocurrency news
                </p>
            </div>

            <div className="grid gap-4">
                {news.map((article) => (
                    <a
                        key={article.id}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-hover p-4 block"
                    >
                        <div className="flex flex-col sm:flex-row gap-4">
                            {article.imageUrl && (
                                <img
                                    src={article.imageUrl}
                                    alt=""
                                    className="w-full sm:w-48 h-32 object-cover rounded-lg"
                                />
                            )}
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-2 hover:text-primary-500 transition-colors">
                                    {article.title}
                                </h2>
                                <p className="text-dark-600 dark:text-dark-400 text-sm mb-3 line-clamp-2">
                                    {article.summary}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-dark-500 dark:text-dark-400">
                                    <span className="font-medium">{article.source}</span>
                                    <span>{formatDate(article.publishedAt)}</span>
                                    {article.categories?.length > 0 && (
                                        <div className="flex gap-1">
                                            {article.categories.slice(0, 3).map((cat, i) => (
                                                <span key={i} className="badge bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300">
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {news.length === 0 && (
                <div className="card p-8 text-center">
                    <p className="text-dark-600 dark:text-dark-400">
                        No news available at the moment.
                    </p>
                </div>
            )}
        </div>
    );
}
