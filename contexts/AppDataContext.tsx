
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
    addMember: (name: string) => void;
    updateMember: (id: number, updates: Partial<Pick<Member, 'name' | 'role'>>) => void;
    addRoutine: (routine: Omit<Routine, 'id'>) => void;
    updateRoutine: (routine: Routine) => void;
    deleteRoutine: (id: number) => void;
    deleteMemberAndRoutines: (id: number) => void;
    
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
        if (selection.routines) dataToExport.routines = routines;

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "beyond-time-data.json";
        link.click();
    }, [teams, members, routines]);


    const value = useMemo(() => ({
        members, routines, teams,
        setRoutines, addMember, updateMember, addRoutine, updateRoutine, deleteRoutine, deleteMemberAndRoutines,
        loadSampleData, importData, exportData
    }), [members, routines, teams, setRoutines, addMember, updateMember, addRoutine, updateRoutine, deleteRoutine, deleteMemberAndRoutines, loadSampleData, importData, exportData]);

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
