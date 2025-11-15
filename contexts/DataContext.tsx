import React, { createContext, useContext, useMemo, useCallback } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { Member, Routine, Team, Event } from '../types';
import { sampleData } from '../config/sampleData';

interface DataContextType {
    members: Member[];
    routines: Routine[];
    setRoutines: (routines: Routine[]) => void;
    teams: Team[];
    events: Event[];
    addMember: (name: string) => void;
    updateMember: (id: number, updates: Partial<Pick<Member, 'name' | 'role'>>) => void;
    deleteMember: (id: number) => void;
    addRoutine: (routine: Routine) => void;
    updateRoutine: (routine: Routine) => void;
    deleteRoutine: (id: number) => void;
    loadSampleData: (skipConfirmation?: boolean) => void;
    importData: (jsonString: string) => void;
    exportData: (selection: { [key: string]: boolean }) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [members, setMembers] = usePersistentState<Member[]>('members', []);
    const [routines, setRoutines] = usePersistentState<Routine[]>('routines', []);
    const [teams, setTeams] = usePersistentState<Team[]>('teams', []);
    const [events, setEvents] = usePersistentState<Event[]>('events', []);

    const addMember = useCallback((name: string) => {
        if (name.trim() === '') return;
        // In a real app, you would handle password and role assignment here.
        // For this app, we'll assign a default role and password.
        const newMember: Member = {
            id: Date.now(),
            name: name.trim(),
            role: 'Member',
            password: 'password'
        };
        setMembers(prev => [...prev, newMember]);
    }, [setMembers]);

    const updateMember = useCallback((id: number, updates: Partial<Pick<Member, 'name' | 'role'>>) => {
        if (updates.name && updates.name.trim() === '') return; // Prevent updating to empty name

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

    const deleteMember = useCallback((id: number) => {
        setMembers(prev => prev.filter(m => m.id !== id));
        // Also delete routines assigned to this member
        setRoutines(prev => prev.filter(r => r.memberId !== id));
    }, [setMembers, setRoutines]);
    
    const addRoutine = useCallback((routine: Routine) => {
        setRoutines(prev => [...prev, routine]);
    }, [setRoutines]);

    const updateRoutine = useCallback((updatedRoutine: Routine) => {
        setRoutines(prev => prev.map(r => (r.id === updatedRoutine.id ? updatedRoutine : r)));
    }, [setRoutines]);

    const deleteRoutine = useCallback((id: number) => {
        setRoutines(prev => prev.filter(r => r.id !== id));
    }, [setRoutines]);

    const loadSampleData = useCallback((skipConfirmation = false) => {
        const confirmed = skipConfirmation || window.confirm('This will replace all current data. Are you sure?');
        if (confirmed) {
            setTeams(sampleData.teams);
            setMembers(sampleData.members);
            setRoutines(sampleData.routines);
            setEvents(sampleData.events);
            if (!skipConfirmation) {
              alert('Sample data loaded!');
            }
        }
    }, [setTeams, setMembers, setRoutines, setEvents]);

    const importData = useCallback((jsonString: string) => {
        if (window.confirm('This will replace all current data with the imported data. Are you sure?')) {
            try {
                const data = JSON.parse(jsonString);
                if (data.teams) setTeams(data.teams);
                if (data.members) setMembers(data.members);
                if (data.routines) setRoutines(data.routines);
                if (data.events) setEvents(data.events);
                alert('Data imported successfully!');
            } catch (error) {
                alert('Invalid JSON file.');
                console.error("Failed to parse JSON:", error);
            }
        }
    }, [setTeams, setMembers, setRoutines, setEvents]);

    const exportData = useCallback((selection: { [key: string]: boolean }) => {
        const dataToExport: { [key: string]: any } = {};
        if (selection.teams) dataToExport.teams = teams;
        if (selection.members) dataToExport.members = members;
        if (selection.routines) dataToExport.routines = routines;
        if (selection.events) dataToExport.events = events;

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "beyond-time-data.json";
        link.click();
    }, [teams, members, routines, events]);

    const value = useMemo(() => ({
        members,
        routines,
        setRoutines,
        teams,
        events,
        addMember,
        updateMember,
        deleteMember,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        loadSampleData,
        importData,
        exportData
    }), [members, routines, setRoutines, teams, events, addMember, updateMember, deleteMember, addRoutine, updateRoutine, deleteRoutine, loadSampleData, importData, exportData]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};