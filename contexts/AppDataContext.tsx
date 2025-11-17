

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { Member, Routine, Team } from '../types';
import { sampleData } from '../config/sampleData';
import { validateImportData } from '../utils/validation';
import { useToast } from './ToastContext';

interface AppDataContextType {
    // State
    members: Member[];
    routines: Routine[];
    teams: Team[];
    
    // Actions
    setRoutines: (routines: Routine[] | ((prev: Routine[]) => Routine[])) => void;
    addMember: (details: { name: string; phone: string; timezone: string; teamId?: number; }) => void;
    updateMember: (id: number, updates: Partial<Pick<Member, 'name' | 'role' | 'teamId' | 'phone' | 'timezone'>>) => void;
    addRoutine: (routine: Omit<Routine, 'id'>) => void;
    updateRoutine: (routine: Routine) => void;
    deleteRoutine: (id: number) => void;
    deleteMemberAndRoutines: (id: number) => void;
    
    // Team Actions
    addTeam: (name: string) => void;
    updateTeam: (id: number, updates: Partial<Pick<Team, 'name'>>) => void;
    deleteTeam: (id: number) => void;

    // Data Management
    loadSampleData: (skipConfirmation?: boolean) => void;
    importData: (jsonString: string) => void;
    exportData: (selection: { [key: string]: boolean }) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [members, setMembers] = usePersistentState<Member[]>('members', []);
    const [routines, setRoutines] = usePersistentState<Routine[]>('routines', []);
    const [teams, setTeams] = usePersistentState<Team[]>('teams', []);
    const { addToast } = useToast();

    // --- Member Actions ---
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
            password: 'password'
        };
        setMembers(prev => [...prev, newMember]);
        addToast(`Member "${details.name.trim()}" created.`, 'success');
    }, [setMembers, addToast]);

    const updateMember = useCallback((id: number, updates: Partial<Pick<Member, 'name' | 'role' | 'teamId' | 'phone' | 'timezone'>>) => {
        setMembers(prev => prev.map(m => {
            if (m.id === id) {
                const updatedMember = { ...m, ...updates };
                // Ensure name is trimmed if provided and not empty
                if (updates.name) {
                    const trimmedName = updates.name.trim();
                    if (trimmedName === '') {
                        addToast('Member name cannot be empty.', 'error');
                        return m; // Revert to original if name is empty
                    }
                    updatedMember.name = trimmedName;
                }
                 // Handle teamId being set to undefined (unassigned)
                if ('teamId' in updates && updates.teamId === undefined) {
                    delete updatedMember.teamId;
                }
                return updatedMember;
            }
            return m;
        }));
    }, [setMembers, addToast]);

    // --- Routine Actions ---
    const addRoutine = useCallback((routine: Omit<Routine, 'id'>) => {
        const newRoutine = { ...routine, id: Date.now() };
        setRoutines(prev => [...prev, newRoutine]);
        addToast(`"${newRoutine.name}" created.`, 'success');
    }, [setRoutines, addToast]);

    const updateRoutine = useCallback((updatedRoutine: Routine) => {
        setRoutines(prev => prev.map(r => (r.id === updatedRoutine.id ? updatedRoutine : r)));
        addToast(`"${updatedRoutine.name}" updated.`, 'success');
    }, [setRoutines, addToast]);

    const deleteRoutine = useCallback((id: number) => {
        setRoutines(prev => prev.filter(r => r.id !== id));
    }, [setRoutines]);
    
    // --- Combined Actions ---
    const deleteMemberAndRoutines = useCallback((memberId: number) => {
        setMembers(prev => prev.filter(m => m.id !== memberId));
        setRoutines(prev => prev.filter(r => r.memberId !== memberId));
        addToast('Member and their items have been deleted.', 'success');
    }, [setMembers, setRoutines, addToast]);

    // --- Team Actions ---
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
        // First, unassign all members from this team
        setMembers(prev => prev.map(m => m.teamId === id ? { ...m, teamId: undefined } : m));
        // Then, delete the team
        setTeams(prev => prev.filter(t => t.id !== id));
        if(teamName) addToast(`Team "${teamName}" and its member assignments have been removed.`, 'success');
    }, [setTeams, setMembers, teams, addToast]);


    // --- Data Management ---
    const loadSampleData = useCallback((skipConfirmation = false) => {
        const confirmed = skipConfirmation || window.confirm('This will replace all current data. Are you sure?');
        if (confirmed) {
            setTeams(sampleData.teams);
            setMembers(sampleData.members);
            setRoutines(sampleData.routines);
            if (!skipConfirmation) {
              addToast('Sample data loaded!', 'success');
            }
        }
    }, [setTeams, setMembers, setRoutines, addToast]);

    const importData = useCallback((jsonString: string) => {
        if (!window.confirm('This will replace all current data with the imported data. Are you sure?')) {
            return;
        }
        try {
            const data = JSON.parse(jsonString);
            const validationError = validateImportData(data);
            if (validationError) {
                throw new Error(validationError);
            }
            setTeams(data.teams || []);
            setMembers(data.members || []);
            setRoutines(data.routines || []);
            addToast('Data imported successfully!', 'success');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Invalid JSON file.';
            addToast(message, 'error');
            console.error("Failed to import data:", error);
        }
    }, [setTeams, setMembers, setRoutines, addToast]);
    
    const exportData = useCallback((selection: { [key: string]: boolean }) => {
        const dataToExport: { [key: string]: any } = {};
        if (selection.teams) dataToExport.teams = teams;
        if (selection.members) dataToExport.members = members;
        // Filter routines/events based on selection
        const routinesToExport = routines.filter(r => 
            (selection.routines && (r.tags.includes('Routine') || r.tags.includes('Task') || r.tags.includes('Payment'))) ||
            (selection.events && r.tags.includes('Event'))
        );
        dataToExport.routines = routinesToExport;

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "beyond-time-data.json";
        link.click();
    }, [teams, members, routines]);


    const value = useMemo(() => ({
        members, routines, teams,
        setRoutines, addMember, updateMember, addRoutine, updateRoutine, deleteRoutine, deleteMemberAndRoutines,
        loadSampleData, importData, exportData,
        addTeam, updateTeam, deleteTeam
    }), [
        members, routines, teams, 
        setRoutines, addMember, updateMember, addRoutine, updateRoutine, deleteRoutine, deleteMemberAndRoutines, 
        loadSampleData, importData, exportData,
        addTeam, updateTeam, deleteTeam
    ]);

    return (
        <AppDataContext.Provider value={value}>
            {children}
        </AppDataContext.Provider>
    );
};

export const useAppData = (): AppDataContextType => {
    const context = useContext(AppDataContext);
    if (context === undefined) {
        throw new Error('useAppData must be used within an AppDataProvider');
    }
    return context;
};