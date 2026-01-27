const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.genAI = null;
        this.model = null;

        if (this.apiKey) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        }
    }

    async chat(message, context = {}) {
        try {
            if (!this.model) {
                console.error('GEMINI_API_KEY is not set or invalid');
                return {
                    success: false,
                    message: 'AI service is not configured. Please check the API key.'
                };
            }

            const systemPrompt = `You are CryptoBot, a helpful AI assistant for a cryptocurrency portfolio tracking application. 

You help users with:
- Understanding cryptocurrency concepts and terminology
- Explaining market trends and price movements
- Portfolio management tips and strategies
- Technical analysis basics
- DeFi, NFTs, and blockchain technology
- Answering questions about specific cryptocurrencies

Guidelines:
- Be helpful, accurate, and concise
- If you don't know something, say so
- For price predictions, remind users to do their own research (DYOR)
- Keep responses under 300 words unless asked for detailed explanations

App context: CryptoTracker - a portfolio tracking dashboard using CoinGecko API
${context.coinName ? `User is viewing: ${context.coinName}` : ''}
${context.portfolioValue ? `Portfolio value: $${context.portfolioValue}` : ''}

User question: ${message}`;

            console.log('Sending request to Gemini...');

            const result = await this.model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();

            console.log('Gemini response received successfully');

            if (text) {
                return {
                    success: true,
                    message: text
                };
            }

            return {
                success: false,
                message: 'Sorry, I could not generate a response. Please try again.'
            };
        } catch (error) {
            console.error('Gemini API error:', error.message);
            console.error('Full error:', error);

            if (error.message?.includes('API_KEY_INVALID')) {
                return {
                    success: false,
                    message: 'Invalid API key. Please check your Gemini API key configuration.'
                };
            } else if (error.message?.includes('QUOTA')) {
                return {
                    success: false,
                    message: 'API quota exceeded. Please try again later.'
                };
            } else if (error.message?.includes('SAFETY')) {
                return {
                    success: false,
                    message: 'I cannot respond to that query. Please try a different question.'
                };
            }

            return {
                success: false,
                message: 'Sorry, there was an error processing your request. Please try again.'
            };
        }
    }

    async getQuickSuggestions() {
        return [
            "What is Bitcoin?",
            "How does portfolio diversification work?",
            "Explain market cap vs volume",
            "What are gas fees?",
            "Tips for crypto beginners"
        ];
    }
}

module.exports = new GeminiService();
