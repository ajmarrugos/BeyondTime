import React, { createContext, useContext, useMemo, useCallback } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { Member } from '../types';
import { useAppData } from './AppDataContext';

interface AuthContextType {
    currentUser: Member | null;
    login: (name: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUserId, setCurrentUserId] = usePersistentState<number | null>('currentUserId', null);
    const { members } = useAppData();

    const currentUser = useMemo(() => {
        if (currentUserId === null) return null;
        // This derived state ensures that if the member's data is updated
        // elsewhere, the currentUser object here will reflect those changes instantly.
        return members.find(m => m.id === currentUserId) ?? null;
    }, [currentUserId, members]);

    const login = useCallback((name: string, password: string): boolean => {
        const user = members.find(m => m.name === name);
        if (user && user.password === password) {
            setCurrentUserId(user.id);
            return true;
        }
        setCurrentUserId(null);
        return false;
    }, [members, setCurrentUserId]);

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