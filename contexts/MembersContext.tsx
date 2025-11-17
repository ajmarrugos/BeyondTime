import React, { createContext, useContext, useMemo, useCallback } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { Member, Team, PersonalizationSettings } from '../types';
import { useToast } from './ToastContext';

interface MembersContextType {
    members: Member[];
    setMembers: (members: Member[] | ((prev: Member[]) => Member[])) => void;
    teams: Team[];
    setTeams: (teams: Team[] | ((prev: Team[]) => Team[])) => void;
    addMember: (details: { name: string; phone: string; timezone: string; teamId?: number; }) => void;
    updateMember: (id: number, updates: Partial<Pick<Member, 'name' | 'role' | 'teamId' | 'phone' | 'timezone' | 'shareData' | 'personalization'>>) => void;
    addTeam: (name: string) => void;
    updateTeam: (id: number, updates: Partial<Pick<Team, 'name'>>) => void;
    deleteTeam: (id: number) => void;
    changePassword: (memberId: number, currentPass: string, newPass: string) => boolean;
}

const MembersContext = createContext<MembersContextType | undefined>(undefined);

export const MembersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [members, setMembers] = usePersistentState<Member[]>('members', []);
    const [teams, setTeams] = usePersistentState<Team[]>('teams', []);
    const { addToast } = useToast();

    const addMember = useCallback((details: { name: string; phone: string; timezone: string; teamId?: number; }) => {
        if (details.name.trim() === '') {
            addToast('Member name cannot be empty.', 'error');
            return;
        }
        const newMember: Member = {
            id: Date.now(),
            name: details.name.trim(),
            phone: details.phone.trim(),
            timezone: details.timezone,
            teamId: details.teamId,
            role: 'Member',
            password: 'password',
            shareData: true, // Default to sharing
        };
        setMembers(prev => [...prev, newMember]);
        addToast(`Member "${details.name.trim()}" created.`, 'success');
    }, [setMembers, addToast]);

    const updateMember = useCallback((id: number, updates: Partial<Pick<Member, 'name' | 'role' | 'teamId' | 'phone' | 'timezone' | 'shareData' | 'personalization'>>) => {
        setMembers(prev => prev.map(m => {
            if (m.id === id) {
                const updatedMember = { ...m, ...updates };
                if (updates.name) {
                    const trimmedName = updates.name.trim();
                    if (trimmedName === '') {
                        addToast('Member name cannot be empty.', 'error');
                        return m;
                    }
                    updatedMember.name = trimmedName;
                }
                if ('teamId' in updates && updates.teamId === undefined) {
                    delete updatedMember.teamId;
                }
                if ('personalization' in updates && updates.personalization === undefined) {
                    delete (updatedMember as Partial<Member>).personalization;
                }
                return updatedMember;
            }
            return m;
        }));
    }, [setMembers, addToast]);
    
    const changePassword = useCallback((memberId: number, currentPass: string, newPass: string): boolean => {
        let success = false;
        setMembers(prev => {
            const memberToUpdate = prev.find(m => m.id === memberId);
            if (memberToUpdate?.password !== currentPass) {
                addToast("Current password does not match.", 'error');
                success = false;
                return prev;
            }
            if (newPass.length < 6) {
                addToast("New password must be at least 6 characters.", 'warning');
                success = false;
                return prev;
            }
            
            success = true;
            addToast("Password changed successfully.", 'success');
            return prev.map(m => m.id === memberId ? { ...m, password: newPass } : m);
        });
        return success;
    }, [setMembers, addToast]);


    const addTeam = useCallback((name: string) => {
        if (name.trim() === '') return;
        const newTeam: Team = {
            id: Date.now(),
            name: name.trim(),
        };
        setTeams(prev => [...prev, newTeam]);
        addToast(`Team "${name.trim()}" created.`, 'success');
    }, [setTeams, addToast]);

    const updateTeam = useCallback((id: number, updates: Partial<Pick<Team, 'name'>>) => {
        if (updates.name && updates.name.trim() === '') return;
        setTeams(prev => prev.map(t => t.id === id ? { ...t, name: updates.name!.trim() } : t));
        addToast(`Team updated.`, 'success');
    }, [setTeams, addToast]);
    
    const deleteTeam = useCallback((id: number) => {
        const teamName = teams.find(t => t.id === id)?.name;
        setMembers(prev => prev.map(m => m.teamId === id ? { ...m, teamId: undefined } : m));
        setTeams(prev => prev.filter(t => t.id !== id));
        if(teamName) addToast(`Team "${teamName}" and its member assignments have been removed.`, 'success');
    }, [setTeams, setMembers, teams, addToast]);

    const value = useMemo(() => ({
        members, setMembers,
        teams, setTeams,
        addMember, updateMember,
        addTeam, updateTeam, deleteTeam,
        changePassword,
    }), [
        members, setMembers,
        teams, setTeams,
        addMember, updateMember,
        addTeam, updateTeam, deleteTeam,
        changePassword,
    ]);

    return (
        <MembersContext.Provider value={value}>
            {children}
        </MembersContext.Provider>
    );
};

export const useMembers = (): MembersContextType => {
    const context = useContext(MembersContext);
    if (context === undefined) {
        throw new Error('useMembers must be used within a MembersProvider');
    }
    return context;
};