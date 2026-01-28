const axios = require('axios');

class ChatService {
    constructor() {
        // Ollama runs locally on port 11434 by default
        this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        // Lightweight models good for chatbot: phi, tinyllama, gemma:2b
        this.model = process.env.OLLAMA_MODEL || 'phi';

        // Fallback responses if Ollama is not running
        this.fallbackResponses = this.initFallbackResponses();
    }

    initFallbackResponses() {
        return {
            bitcoin: `**Bitcoin (BTC)** is the first cryptocurrency, created in 2009 by Satoshi Nakamoto.
• Decentralized digital currency
• Limited supply of 21 million coins
• Uses blockchain technology
• Largest crypto by market cap`,

            ethereum: `**Ethereum (ETH)** is a programmable blockchain platform.
• Supports smart contracts and dApps
• Powers DeFi and NFTs
• Uses Proof of Stake
• Second largest cryptocurrency`,

            portfolio: `**Portfolio Tips:**
1. Diversify across multiple coins
2. Mix large caps (BTC, ETH) with altcoins
3. Don't put >30% in any single asset
4. Rebalance periodically`,

            defi: `**DeFi (Decentralized Finance):**
• Financial services without intermediaries
• Lending, borrowing, trading on blockchain
• Popular protocols: Aave, Uniswap, Compound`,

            default: `I'm CryptoBot! 🤖 Ask me about:
• Bitcoin & Ethereum
• Portfolio tips
• DeFi & NFTs
• Staking & Wallets`
        };
    }

    async chat(message, context = {}) {
        // Try Ollama first
        try {
            console.log(`Calling Ollama (${this.model})...`);

            const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
                model: this.model,
                prompt: `You are CryptoBot, a helpful cryptocurrency assistant. Be concise (under 100 words). Answer this question: ${message}`,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 200
                }
            }, {
                timeout: 30000
            });

            if (response.data?.response) {
                console.log('Ollama response received');
                return { success: true, message: response.data.response };
            }
        } catch (error) {
            console.log('Ollama not available:', error.message);
        }

        // Fallback to rule-based responses
        return this.getFallbackResponse(message);
    }

    getFallbackResponse(message) {
        const lower = message.toLowerCase();
        let response = this.fallbackResponses.default;

        if (lower.includes('bitcoin') || lower.includes('btc')) {
            response = this.fallbackResponses.bitcoin;
        } else if (lower.includes('ethereum') || lower.includes('eth')) {
            response = this.fallbackResponses.ethereum;
        } else if (lower.includes('portfolio') || lower.includes('diversif')) {
            response = this.fallbackResponses.portfolio;
        } else if (lower.includes('defi')) {
            response = this.fallbackResponses.defi;
        } else if (lower.includes('hello') || lower.includes('hi')) {
            response = "Hello! 👋 I'm CryptoBot! Ask me about crypto!";
        }

        return { success: true, message: response };
    }

    async getQuickSuggestions() {
        return [
            "What is Bitcoin?",
            "Explain Ethereum",
            "Portfolio tips",
            "What is DeFi?",
            "Crypto for beginners"
        ];
    }
}

module.exports = new ChatService();
