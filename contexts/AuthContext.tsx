
import React, { createContext, useContext, useMemo, useCallback } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { Member } from '../types';
import { useAppData } from './AppDataContext';
import { useToast } from './ToastContext';

interface AuthContextType {
    currentUser: Member | null;
    login: (name: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUserId, setCurrentUserId] = usePersistentState<number | null>('currentUserId', null);
    const { members, fetchRemoteData } = useAppData();
    const { addToast } = useToast();

    const currentUser = useMemo(() => {
        if (currentUserId === null) return null;
        return members.find(m => m.id === currentUserId) ?? null;
    }, [currentUserId, members]);

    const login = useCallback(async (name: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch('https://lyndsey-supersweet-greatheartedly.ngrok-free.dev/webhook-test/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ username: name, password: password }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.user) {
                setCurrentUserId(data.user.id);
                // Sync all data upon successful login
                await fetchRemoteData();
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Login error:", error);
            // If it's a NetworkError, it's often CORS preflight failure
            addToast('Login failed. Please check your internet connection.', 'error');
            return false;
        }
    }, [setCurrentUserId, fetchRemoteData, addToast]);

    const logout = useCallback(() => {
        setCurrentUserId(null);
    }, [setCurrentUserId]);

    const value = useMemo(() => ({
        currentUser,
        login,
        logout
    }), [currentUser, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
