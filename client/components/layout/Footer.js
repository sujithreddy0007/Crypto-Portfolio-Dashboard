import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-dark-900 border-t border-dark-200 dark:border-dark-700 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                                <span className="text-white font-bold text-lg">C</span>
                            </div>
                            <span className="font-bold text-xl text-dark-900 dark:text-white">
                                CryptoTracker
                            </span>
                        </div>
                        <p className="text-sm text-dark-600 dark:text-dark-400 max-w-md">
                            Track cryptocurrency prices, manage your portfolio, and stay updated with the latest market trends. Your all-in-one crypto dashboard.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm text-dark-600 dark:text-dark-400 hover:text-primary-500 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/cryptocurrencies" className="text-sm text-dark-600 dark:text-dark-400 hover:text-primary-500 transition-colors">
                                    Cryptocurrencies
                                </Link>
                            </li>
                            <li>
                                <Link href="/portfolio" className="text-sm text-dark-600 dark:text-dark-400 hover:text-primary-500 transition-colors">
                                    Portfolio
                                </Link>
                            </li>
                            <li>
                                <Link href="/news" className="text-sm text-dark-600 dark:text-dark-400 hover:text-primary-500 transition-colors">
                                    News
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="https://www.coingecko.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-dark-600 dark:text-dark-400 hover:text-primary-500 transition-colors"
                                >
                                    Data by CoinGecko
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-dark-600 dark:text-dark-400 hover:text-primary-500 transition-colors"
                                >
                                    GitHub
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t border-dark-200 dark:border-dark-700">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-dark-500 dark:text-dark-400">
                            © {new Date().getFullYear()} CryptoTracker. All rights reserved.
                        </p>
                        <p className="text-xs text-dark-400 dark:text-dark-500">
                            Cryptocurrency data provided by CoinGecko API
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
