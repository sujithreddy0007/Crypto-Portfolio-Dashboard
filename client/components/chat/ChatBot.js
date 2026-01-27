'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm CryptoBot 🤖 I can help you with cryptocurrency questions, portfolio tips, and market insights. What would you like to know?"
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchSuggestions();
            inputRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchSuggestions = async () => {
        try {
            const response = await axios.get('/api/chat/suggestions');
            if (response.data.success) {
                setSuggestions(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const sendMessage = async (messageText = input) => {
        if (!messageText.trim() || loading) return;

        const userMessage = { role: 'user', content: messageText.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('/api/chat', {
                message: messageText.trim()
            });

            if (response.data.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.data.data.message
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again.'
                }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I could not connect to the server. Please check your connection and try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        sendMessage(suggestion);
        setSuggestions([]);
    };

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isOpen
                        ? 'bg-dark-600 hover:bg-dark-700'
                        : 'gradient-primary hover:scale-110'
                    }`}
                aria-label="Toggle chat"
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] card shadow-2xl flex flex-col animate-in">
                    {/* Header */}
                    <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                            <span className="text-white text-lg">🤖</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-dark-900 dark:text-white">CryptoBot</h3>
                            <p className="text-xs text-crypto-green flex items-center gap-1">
                                <span className="w-2 h-2 bg-crypto-green rounded-full animate-pulse" />
                                Online
                            </p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                        >
                            <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.role === 'user'
                                            ? 'bg-primary-600 text-white rounded-br-sm'
                                            : 'bg-dark-100 dark:bg-dark-700 text-dark-900 dark:text-white rounded-bl-sm'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-dark-100 dark:bg-dark-700 rounded-2xl rounded-bl-sm px-4 py-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions */}
                    {suggestions.length > 0 && messages.length === 1 && (
                        <div className="px-4 pb-2">
                            <p className="text-xs text-dark-500 dark:text-dark-400 mb-2">Quick questions:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.slice(0, 3).map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="text-xs px-3 py-1.5 rounded-full bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-dark-200 dark:border-dark-700">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything about crypto..."
                                className="flex-1 px-4 py-2 text-sm rounded-full bg-dark-100 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                disabled={loading}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-dark-400 dark:text-dark-500 mt-2 text-center">
                            Powered by Gemini AI
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
