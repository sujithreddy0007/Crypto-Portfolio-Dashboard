'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await authAPI.getMe();
                setUser(response.data.data);
            }
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await authAPI.login({ email, password });
        const { data, token } = response.data;
        localStorage.setItem('token', token);
        setUser(data);
        return data;
    };

    const signup = async (name, email, password) => {
        const response = await authAPI.signup({ name, email, password });
        const { data, token } = response.data;
        localStorage.setItem('token', token);
        setUser(data);
        return data;
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            // Ignore error
        }
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
