import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/chat/ChatBot';
import { Toaster } from 'react-hot-toast';

export const metadata = {
    title: 'CryptoTracker - Cryptocurrency Portfolio Dashboard',
    description: 'Track cryptocurrency prices, manage your portfolio, and stay updated with the latest market trends.',
    keywords: 'cryptocurrency, bitcoin, ethereum, portfolio, tracker, crypto, market',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen flex flex-col">
                <ThemeProvider>
                    <AuthProvider>
                        <CurrencyProvider>
                            <Header />
                            <main className="flex-1">
                                {children}
                            </main>
                            <Footer />
                            <Toaster
                                position="bottom-right"
                                toastOptions={{
                                    className: 'bg-white dark:bg-dark-800 text-dark-900 dark:text-white border border-dark-200 dark:border-dark-700',
                                    duration: 3000,
                                }}
                            />
                            <ChatBot />
                        </CurrencyProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

