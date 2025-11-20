
import React, { createContext, useContext, useMemo, useCallback } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { Member, Routine, Team } from '../types';
import { validateImportData } from '../utils/validation';
import { useToast } from './ToastContext';

interface AppDataContextType {
    // State
    members: Member[];
    routines: Routine[];
    teams: Team[];
    completedTasks: Record<number, number[]>;

    // Actions
    setMembers: (members: Member[] | ((prev: Member[]) => Member[])) => void;
    setRoutines: (routines: Routine[] | ((prev: Routine[]) => Routine[])) => void;
    setTeams: (teams: Team[] | ((prev: Team[]) => Team[])) => void;
    
    addMember: (details: { name: string; phone: string; timezone: string; teamId?: number; }) => void;
    updateMember: (id: number, updates: Partial<Pick<Member, 'name' | 'role' | 'teamId' | 'phone' | 'timezone' | 'shareData'>>) => void;
    changePassword: (memberId: number, currentPass: string, newPass: string) => boolean;
    
    addRoutine: (routine: Omit<Routine, 'id'>) => void;
    updateRoutine: (routine: Routine) => void;
    deleteRoutine: (id: number) => void;
    deleteMemberAndRoutines: (id: number) => void;
    
    addTeam: (name: string) => void;
    updateTeam: (id: number, updates: Partial<Pick<Team, 'name'>>) => void;
    deleteTeam: (id: number) => void;
    
    handleToggleTask: (routineId: number, taskId: number) => void;

    fetchRemoteData: () => Promise<void>;
    importData: (jsonString: string) => void;
    exportData: (selection: { [key: string]: boolean }) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [members, setMembers] = usePersistentState<Member[]>('members', []);
    const [routines, setRoutines] = usePersistentState<Routine[]>('routines', []);
    const [teams, setTeams] = usePersistentState<Team[]>('teams', []);
    const [completedTasks, setCompletedTasks] = usePersistentState<Record<number, number[]>>('completedTasks', {});
    const { addToast } = useToast();

    const handleToggleTask = useCallback((routineId: number, taskId: number) => {
        setCompletedTasks(prev => {
            const newCompletedState = { ...prev };
            const completedTasksForRoutine = new Set(newCompletedState[routineId] || []);
    
            if (completedTasksForRoutine.has(taskId)) {
                completedTasksForRoutine.delete(taskId);
            } else {
                completedTasksForRoutine.add(taskId);
            }
    
            if (completedTasksForRoutine.size === 0) {
                delete newCompletedState[routineId];
            } else {
                newCompletedState[routineId] = Array.from(completedTasksForRoutine);
            }
    
            return newCompletedState;
        });
      }, [setCompletedTasks]);

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
            shareData: true,
        };
        setMembers(prev => [...prev, newMember]);
        addToast(`Member "${details.name.trim()}" created.`, 'success');
    }, [setMembers, addToast]);

    const updateMember = useCallback((id: number, updates: Partial<Pick<Member, 'name' | 'role' | 'teamId' | 'phone' | 'timezone' | 'shareData'>>) => {
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
    
    const deleteMemberAndRoutines = useCallback((memberId: number) => {
        setMembers(prev => prev.filter(m => m.id !== memberId));
        setRoutines(prev => prev.filter(r => r.memberId !== memberId));
        addToast('Member and their items have been deleted.', 'success');
    }, [setMembers, setRoutines, addToast]);

    const addTeam = useCallback((name: string) => {
        if (name.trim() === '') return;
        const newTeam: Team = { id: Date.now(), name: name.trim() };
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

    const fetchRemoteData = useCallback(async () => {
        try {
            const response = await fetch('https://lyndsey-supersweet-greatheartedly.ngrok-free.dev/webhook-test/data', {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            
            if (data.teams) setTeams(data.teams);
            if (data.members) setMembers(data.members);
            if (data.routines) setRoutines(data.routines);
            
            addToast('Data synced successfully.', 'success');
        } catch (error) {
            console.error('Sync failed', error);
            addToast('Failed to sync data from server.', 'error');
        }
    }, [setTeams, setMembers, setRoutines, addToast]);

    const importData = useCallback((jsonString: string) => {
        if (!window.confirm('This will replace all current data with the imported data. Are you sure?')) return;
        try {
            const data = JSON.parse(jsonString);
            const validationError = validateImportData(data);
            if (validationError) throw new Error(validationError);
            setTeams(data.teams || []);
            setMembers(data.members || []);
            setRoutines(data.routines || []);
            setCompletedTasks({});
            addToast('Data imported successfully!', 'success');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Invalid JSON file.';
            addToast(message, 'error');
            console.error("Failed to import data:", error);
        }
    }, [setTeams, setMembers, setRoutines, setCompletedTasks, addToast]);
    
    const exportData = useCallback((selection: { [key: string]: boolean }) => {
        const dataToExport: { [key: string]: any } = {};
        if (selection.teams) dataToExport.teams = teams;
        if (selection.members) dataToExport.members = members;
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
        members, routines, teams, completedTasks,
        setMembers, setRoutines, setTeams,
        addMember, updateMember, changePassword,
        addRoutine, updateRoutine, deleteRoutine, deleteMemberAndRoutines,
        addTeam, updateTeam, deleteTeam,
        handleToggleTask,
        fetchRemoteData, importData, exportData,
    }), [
        members, routines, teams, completedTasks,
        setMembers, setRoutines, setTeams,
        addMember, updateMember, changePassword,
        addRoutine, updateRoutine, deleteRoutine, deleteMemberAndRoutines,
        addTeam, updateTeam, deleteTeam,
        handleToggleTask,
        fetchRemoteData, importData, exportData,
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
