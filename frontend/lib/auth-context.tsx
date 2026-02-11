'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, MOCK_USERS } from './constants';
import { delay } from './utils';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        // Simulate API delay
        await delay(800);

        // Find user by email
        const userKey = Object.keys(MOCK_USERS).find(
            (key) => MOCK_USERS[key].email === email
        );

        if (userKey && password === 'password') {
            setUser(MOCK_USERS[userKey]);
            setIsLoading(false);
            return true;
        } else {
            setError('Invalid email or password');
            setIsLoading(false);
            return false;
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setError(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
