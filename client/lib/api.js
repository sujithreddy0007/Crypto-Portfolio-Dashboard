import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add token from localStorage if available
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                // Optionally redirect to login
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
};

// Market API
export const marketAPI = {
    getGlobal: () => api.get('/market/global'),
    getListings: (page = 1, perPage = 100, order = 'market_cap_desc') =>
        api.get('/market/listings', { params: { page, per_page: perPage, order } }),
    getTrending: () => api.get('/market/trending'),
    search: (query) => api.get('/market/search', { params: { query } }),
    getGainersLosers: () => api.get('/market/gainers-losers'),
};

// Coins API
export const coinsAPI = {
    getCoin: (id) => api.get(`/coins/${id}`),
    getHistory: (id, days = 7) => api.get(`/coins/${id}/history`, { params: { days } }),
    getList: () => api.get('/coins/list/all'),
};

// Portfolio API
export const portfolioAPI = {
    getAll: () => api.get('/portfolio'),
    get: (id) => api.get(`/portfolio/${id}`),
    create: (data) => api.post('/portfolio', data),
    update: (id, data) => api.put(`/portfolio/${id}`, data),
    delete: (id) => api.delete(`/portfolio/${id}`),
    addHolding: (portfolioId, data) => api.post(`/portfolio/${portfolioId}/holdings`, data),
    updateHolding: (holdingId, data) => api.put(`/portfolio/holdings/${holdingId}`, data),
    deleteHolding: (holdingId) => api.delete(`/portfolio/holdings/${holdingId}`),
    sellHolding: (portfolioId, holdingId, data) => api.post(`/portfolio/${portfolioId}/holdings/${holdingId}/sell`, data),
    getTransactions: (portfolioId) => api.get(`/portfolio/${portfolioId}/transactions`),
    getSummary: () => api.get('/portfolio/summary/all'),
    getReport: (portfolioId) => api.get(`/portfolio/${portfolioId}/report`),
    downloadCSV: (portfolioId) => `/api/portfolio/${portfolioId}/report/csv`,
    downloadHTML: (portfolioId) => `/api/portfolio/${portfolioId}/report/html`,
};

// Watchlist API
export const watchlistAPI = {
    getAll: () => api.get('/watchlist'),
    add: (data) => api.post('/watchlist', data),
    remove: (coinId) => api.delete(`/watchlist/${coinId}`),
    check: (coinId) => api.get(`/watchlist/check/${coinId}`),
};

// Alerts API
export const alertsAPI = {
    getAll: () => api.get('/alerts'),
    create: (data) => api.post('/alerts', data),
    update: (id, data) => api.put(`/alerts/${id}`, data),
    delete: (id) => api.delete(`/alerts/${id}`),
    toggle: (id) => api.post(`/alerts/${id}/toggle`),
};

// News API
export const newsAPI = {
    getAll: (limit = 10) => api.get('/news', { params: { limit } }),
    getByCoin: (coinId, limit = 5) => api.get(`/news/coin/${coinId}`, { params: { limit } }),
};

export default api;
