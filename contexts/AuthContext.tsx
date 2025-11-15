import React, { createContext, useContext, useMemo, useCallback } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { Member } from '../types';
import { useMemberContext } from './MemberContext';

interface AuthContextType {
    currentUser: Member | null;
    login: (name: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = usePersistentState<Member | null>('currentUser', null);
    const { members } = useMemberContext();

    const login = useCallback((name: string, password: string): boolean => {
        const user = members.find(m => m.name === name);
        if (user && user.password === password) {
            setCurrentUser(user);
            return true;
        }
        setCurrentUser(null);
        return false;
    }, [members, setCurrentUser]);

    const logout = useCallback(() => {
        setCurrentUser(null);
    }, [setCurrentUser]);

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