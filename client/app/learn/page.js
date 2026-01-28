'use client';

import { useState } from 'react';
import Link from 'next/link';

const guides = [
    {
        id: 'what-is-crypto',
        title: 'What is Cryptocurrency?',
        icon: '🪙',
        content: `
            <h3>Understanding Digital Currency</h3>
            <p>Cryptocurrency is a digital or virtual form of money that uses cryptography for security. Unlike traditional currencies issued by governments (like USD or INR), cryptocurrencies operate on decentralized networks based on blockchain technology.</p>
            
            <h4>Key Features:</h4>
            <ul>
                <li><strong>Decentralized:</strong> No central authority (like a bank) controls it</li>
                <li><strong>Secure:</strong> Cryptography makes transactions secure and verifiable</li>
                <li><strong>Transparent:</strong> All transactions are recorded on a public ledger</li>
                <li><strong>Global:</strong> Can be sent anywhere in the world instantly</li>
            </ul>

            <h4>Popular Cryptocurrencies:</h4>
            <ul>
                <li><strong>Bitcoin (BTC):</strong> The first and most well-known cryptocurrency</li>
                <li><strong>Ethereum (ETH):</strong> A platform for smart contracts and dApps</li>
                <li><strong>Stablecoins (USDT, USDC):</strong> Cryptocurrencies pegged to the US dollar</li>
            </ul>
        `
    },
    {
        id: 'blockchain-basics',
        title: 'How Blockchain Works',
        icon: '⛓️',
        content: `
            <h3>The Technology Behind Crypto</h3>
            <p>A blockchain is a distributed digital ledger that records all transactions across a network of computers. Think of it as a shared Google Doc that everyone can read but no one can secretly edit.</p>

            <h4>Key Concepts:</h4>
            <ul>
                <li><strong>Blocks:</strong> Groups of transactions bundled together</li>
                <li><strong>Chain:</strong> Blocks linked together in chronological order</li>
                <li><strong>Nodes:</strong> Computers that maintain copies of the blockchain</li>
                <li><strong>Mining/Validation:</strong> Process of verifying and adding new blocks</li>
            </ul>

            <h4>Why Blockchain is Secure:</h4>
            <p>Each block contains a cryptographic hash of the previous block. If someone tries to alter a past transaction, it would change the hash and break the chain, making tampering immediately detectable.</p>
        `
    },
    {
        id: 'getting-started',
        title: 'Getting Started with Crypto',
        icon: '🚀',
        content: `
            <h3>Your First Steps</h3>
            
            <h4>1. Learn Before You Invest</h4>
            <p>Take time to understand what you're investing in. Never invest more than you can afford to lose.</p>

            <h4>2. Choose a Reliable Exchange</h4>
            <p>Popular exchanges include Coinbase, Binance, and Kraken. Look for:</p>
            <ul>
                <li>Strong security features (2FA, cold storage)</li>
                <li>Good reputation and reviews</li>
                <li>Available in your country</li>
                <li>Reasonable fees</li>
            </ul>

            <h4>3. Set Up a Wallet</h4>
            <p>Wallets store your crypto. Types include:</p>
            <ul>
                <li><strong>Hot Wallets:</strong> Connected to internet (convenient but less secure)</li>
                <li><strong>Cold Wallets:</strong> Offline storage (more secure for large amounts)</li>
            </ul>

            <h4>4. Start Small</h4>
            <p>Begin with a small amount to learn the process before investing more.</p>
        `
    },
    {
        id: 'wallets',
        title: 'Understanding Wallets',
        icon: '👛',
        content: `
            <h3>Storing Your Cryptocurrency</h3>
            <p>A crypto wallet doesn't actually store your coins - it stores the private keys that give you access to your crypto on the blockchain.</p>

            <h4>Types of Wallets:</h4>
            
            <h5>🔥 Hot Wallets (Online)</h5>
            <ul>
                <li><strong>Exchange Wallets:</strong> Provided by exchanges like Coinbase</li>
                <li><strong>Mobile Wallets:</strong> Apps like Trust Wallet, MetaMask</li>
                <li><strong>Desktop Wallets:</strong> Software on your computer</li>
            </ul>

            <h5>❄️ Cold Wallets (Offline)</h5>
            <ul>
                <li><strong>Hardware Wallets:</strong> Devices like Ledger, Trezor</li>
                <li><strong>Paper Wallets:</strong> Printed private keys (not recommended)</li>
            </ul>

            <h4>⚠️ Important Security Tips:</h4>
            <ul>
                <li>Never share your private keys or seed phrase</li>
                <li>Enable two-factor authentication (2FA)</li>
                <li>Write down your seed phrase and store it safely offline</li>
                <li>Use hardware wallets for large amounts</li>
            </ul>
        `
    },
    {
        id: 'trading-basics',
        title: 'Trading Basics',
        icon: '📊',
        content: `
            <h3>How Crypto Trading Works</h3>

            <h4>Key Terms:</h4>
            <ul>
                <li><strong>Market Cap:</strong> Total value of all coins (Price × Supply)</li>
                <li><strong>Volume:</strong> Amount traded in 24 hours</li>
                <li><strong>Bull Market:</strong> Prices rising over time</li>
                <li><strong>Bear Market:</strong> Prices falling over time</li>
                <li><strong>ATH (All-Time High):</strong> Highest price ever reached</li>
                <li><strong>HODL:</strong> "Hold On for Dear Life" - long-term holding strategy</li>
            </ul>

            <h4>Order Types:</h4>
            <ul>
                <li><strong>Market Order:</strong> Buy/sell immediately at current price</li>
                <li><strong>Limit Order:</strong> Buy/sell at a specific price you set</li>
                <li><strong>Stop-Loss:</strong> Automatically sell if price drops to a certain level</li>
            </ul>

            <h4>Trading Tips for Beginners:</h4>
            <ul>
                <li>Don't try to time the market</li>
                <li>Consider Dollar-Cost Averaging (DCA) - invest fixed amounts regularly</li>
                <li>Set profit targets and stop-losses</li>
                <li>Never invest based on FOMO (Fear Of Missing Out)</li>
            </ul>
        `
    },
    {
        id: 'risks',
        title: 'Risks & Safety',
        icon: '⚠️',
        content: `
            <h3>Understanding the Risks</h3>

            <h4>Common Risks:</h4>
            <ul>
                <li><strong>Volatility:</strong> Prices can swing 20%+ in a single day</li>
                <li><strong>Scams:</strong> Fake projects, phishing, rug pulls</li>
                <li><strong>Hacks:</strong> Exchanges and wallets can be compromised</li>
                <li><strong>Regulatory:</strong> Laws around crypto are still evolving</li>
                <li><strong>Loss of Access:</strong> Losing your private keys means losing your crypto</li>
            </ul>

            <h4>🚨 Red Flags to Avoid:</h4>
            <ul>
                <li>Promises of guaranteed returns</li>
                <li>Pressure to invest quickly</li>
                <li>Projects with anonymous teams</li>
                <li>Requests for your private keys</li>
                <li>"Too good to be true" opportunities</li>
            </ul>

            <h4>✅ Safety Best Practices:</h4>
            <ul>
                <li>Do your own research (DYOR)</li>
                <li>Only invest what you can afford to lose</li>
                <li>Diversify your investments</li>
                <li>Use reputable exchanges and wallets</li>
                <li>Enable all security features available</li>
            </ul>
        `
    },
    {
        id: 'defi-nft',
        title: 'DeFi & NFTs',
        icon: '🎨',
        content: `
            <h3>Advanced Crypto Concepts</h3>

            <h4>DeFi (Decentralized Finance)</h4>
            <p>Financial services built on blockchain without traditional intermediaries like banks.</p>
            <ul>
                <li><strong>Lending/Borrowing:</strong> Earn interest or borrow against your crypto</li>
                <li><strong>DEXs:</strong> Trade directly peer-to-peer (Uniswap, PancakeSwap)</li>
                <li><strong>Yield Farming:</strong> Earn rewards by providing liquidity</li>
                <li><strong>Staking:</strong> Lock up coins to earn passive income</li>
            </ul>

            <h4>NFTs (Non-Fungible Tokens)</h4>
            <p>Unique digital assets representing ownership of items like art, music, or collectibles.</p>
            <ul>
                <li>Each NFT is one-of-a-kind (unlike Bitcoin where each coin is identical)</li>
                <li>Stored on blockchain, proving authenticity and ownership</li>
                <li>Popular platforms: OpenSea, Rarible, Magic Eden</li>
            </ul>

            <h4>⚠️ Note for Beginners:</h4>
            <p>DeFi and NFTs are more complex and carry additional risks. Master the basics before exploring these areas.</p>
        `
    }
];

const glossary = [
    { term: 'Altcoin', definition: 'Any cryptocurrency other than Bitcoin' },
    { term: 'Bear Market', definition: 'Period of declining prices' },
    { term: 'Bull Market', definition: 'Period of rising prices' },
    { term: 'DApp', definition: 'Decentralized Application running on blockchain' },
    { term: 'DYOR', definition: 'Do Your Own Research' },
    { term: 'FOMO', definition: 'Fear Of Missing Out' },
    { term: 'FUD', definition: 'Fear, Uncertainty, and Doubt' },
    { term: 'Gas', definition: 'Fee paid for Ethereum transactions' },
    { term: 'HODL', definition: 'Hold On for Dear Life (long-term holding)' },
    { term: 'Market Cap', definition: 'Total value of all coins in circulation' },
    { term: 'Seed Phrase', definition: '12-24 words to recover your wallet' },
    { term: 'Smart Contract', definition: 'Self-executing code on blockchain' },
    { term: 'Staking', definition: 'Locking crypto to earn rewards' },
    { term: 'Whale', definition: 'Person/entity holding large amounts of crypto' },
];

export default function LearnPage() {
    const [activeGuide, setActiveGuide] = useState(guides[0]);
    const [showGlossary, setShowGlossary] = useState(false);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-dark-900 dark:text-white mb-4">
                    📚 Beginner's Guide to Crypto
                </h1>
                <p className="text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
                    New to cryptocurrency? Start here! Learn the basics of blockchain,
                    trading, and how to safely invest in digital assets.
                </p>
            </div>

            {/* Quick Start Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                <div className="card p-6 bg-gradient-to-br from-primary-500/10 to-primary-600/5 border-primary-200 dark:border-primary-800">
                    <div className="text-3xl mb-3">🎯</div>
                    <h3 className="font-bold text-dark-900 dark:text-white mb-2">Start Learning</h3>
                    <p className="text-sm text-dark-600 dark:text-dark-400">
                        Read our beginner guides below to understand crypto fundamentals
                    </p>
                </div>
                <div className="card p-6 bg-gradient-to-br from-crypto-green/10 to-crypto-green/5 border-crypto-green/30">
                    <div className="text-3xl mb-3">💼</div>
                    <h3 className="font-bold text-dark-900 dark:text-white mb-2">Track Portfolio</h3>
                    <p className="text-sm text-dark-600 dark:text-dark-400">
                        <Link href="/portfolio" className="text-primary-600 hover:underline">Create a portfolio</Link> to track your investments
                    </p>
                </div>
                <div className="card p-6 bg-gradient-to-br from-crypto-gold/10 to-crypto-gold/5 border-crypto-gold/30">
                    <div className="text-3xl mb-3">💬</div>
                    <h3 className="font-bold text-dark-900 dark:text-white mb-2">Ask Questions</h3>
                    <p className="text-sm text-dark-600 dark:text-dark-400">
                        Use our AI chatbot (bottom right) to get answers to your crypto questions
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar - Guide Navigation */}
                <div className="lg:col-span-1">
                    <div className="card p-4 sticky top-24">
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Topics</h3>
                        <nav className="space-y-2">
                            {guides.map((guide) => (
                                <button
                                    key={guide.id}
                                    onClick={() => {
                                        setActiveGuide(guide);
                                        setShowGlossary(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2
                                        ${activeGuide.id === guide.id && !showGlossary
                                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                                            : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-700'
                                        }`}
                                >
                                    <span>{guide.icon}</span>
                                    <span>{guide.title}</span>
                                </button>
                            ))}
                            <hr className="border-dark-200 dark:border-dark-700 my-2" />
                            <button
                                onClick={() => setShowGlossary(true)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2
                                    ${showGlossary
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                                        : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-700'
                                    }`}
                            >
                                <span>📖</span>
                                <span>Glossary</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    {showGlossary ? (
                        <div className="card p-8">
                            <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">
                                📖 Crypto Glossary
                            </h2>
                            <div className="grid gap-4">
                                {glossary.map((item, index) => (
                                    <div key={index} className="border-b border-dark-200 dark:border-dark-700 pb-4 last:border-0">
                                        <dt className="font-semibold text-dark-900 dark:text-white">
                                            {item.term}
                                        </dt>
                                        <dd className="text-dark-600 dark:text-dark-400 mt-1">
                                            {item.definition}
                                        </dd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="card p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-4xl">{activeGuide.icon}</span>
                                <h2 className="text-2xl font-bold text-dark-900 dark:text-white">
                                    {activeGuide.title}
                                </h2>
                            </div>
                            <div
                                className="prose prose-dark dark:prose-invert max-w-none
                                    prose-headings:text-dark-900 dark:prose-headings:text-white
                                    prose-h3:text-xl prose-h3:font-bold prose-h3:mt-0
                                    prose-h4:text-lg prose-h4:font-semibold prose-h4:mt-6
                                    prose-h5:text-base prose-h5:font-semibold prose-h5:mt-4
                                    prose-p:text-dark-600 dark:prose-p:text-dark-300
                                    prose-li:text-dark-600 dark:prose-li:text-dark-300
                                    prose-strong:text-dark-900 dark:prose-strong:text-white
                                    prose-ul:space-y-2"
                                dangerouslySetInnerHTML={{ __html: activeGuide.content }}
                            />

                            {/* Navigation */}
                            <div className="flex justify-between mt-8 pt-6 border-t border-dark-200 dark:border-dark-700">
                                {guides.indexOf(activeGuide) > 0 ? (
                                    <button
                                        onClick={() => setActiveGuide(guides[guides.indexOf(activeGuide) - 1])}
                                        className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
                                    >
                                        ← {guides[guides.indexOf(activeGuide) - 1].title}
                                    </button>
                                ) : <div />}

                                {guides.indexOf(activeGuide) < guides.length - 1 ? (
                                    <button
                                        onClick={() => setActiveGuide(guides[guides.indexOf(activeGuide) + 1])}
                                        className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
                                    >
                                        {guides[guides.indexOf(activeGuide) + 1].title} →
                                    </button>
                                ) : <div />}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center card p-8 bg-gradient-to-r from-primary-600 to-primary-700">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Start?</h3>
                <p className="text-primary-100 mb-6 max-w-xl mx-auto">
                    Now that you understand the basics, start tracking the crypto market
                    and build your first portfolio!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/" className="px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-colors">
                        Explore Market →
                    </Link>
                    <Link href="/portfolio" className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-400 transition-colors border border-primary-400">
                        Create Portfolio →
                    </Link>
                </div>
            </div>
        </div>
    );
}
