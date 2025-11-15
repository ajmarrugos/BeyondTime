import React, { createContext, useContext, useMemo, useCallback } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { Member } from '../types';

interface MemberContextType {
    members: Member[];
    setMembers: (members: Member[] | ((prev: Member[]) => Member[])) => void;
    addMember: (name: string) => void;
    updateMember: (id: number, updates: Partial<Pick<Member, 'name' | 'role'>>) => void;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export const MemberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [members, setMembers] = usePersistentState<Member[]>('members', []);

    const addMember = useCallback((name: string) => {
        if (name.trim() === '') return;
        const newMember: Member = {
            id: Date.now(),
            name: name.trim(),
            role: 'Member',
            password: 'password'
        };
        setMembers(prev => [...prev, newMember]);
    }, [setMembers]);

    const updateMember = useCallback((id: number, updates: Partial<Pick<Member, 'name' | 'role'>>) => {
        if (updates.name && updates.name.trim() === '') return;

        setMembers(prev => prev.map(m => {
            if (m.id === id) {
                const updatedMember = { ...m, ...updates };
                if (updates.name) {
                    updatedMember.name = updates.name.trim();
                }
                return updatedMember;
            }
            return m;
        }));
    }, [setMembers]);

    const value = useMemo(() => ({
        members,
        setMembers,
        addMember,
        updateMember,
    }), [members, setMembers, addMember, updateMember]);

    return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
};

export const useMemberContext = (): MemberContextType => {
    const context = useContext(MemberContext);
    if (!context) throw new Error('useMemberContext must be used within a MemberProvider');
    return context;
};
