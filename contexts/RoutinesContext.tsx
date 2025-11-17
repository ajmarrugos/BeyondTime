import React, { createContext, useContext, useMemo, useCallback } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { Routine } from '../types';
import { useToast } from './ToastContext';

interface RoutinesContextType {
    routines: Routine[];
    setRoutines: (routines: Routine[] | ((prev: Routine[]) => Routine[])) => void;
    addRoutine: (routine: Omit<Routine, 'id'>) => void;
    updateRoutine: (routine: Routine) => void;
    deleteRoutine: (id: number) => void;
}

const RoutinesContext = createContext<RoutinesContextType | undefined>(undefined);

export const RoutinesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [routines, setRoutines] = usePersistentState<Routine[]>('routines', []);
    const { addToast } = useToast();

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

    const value = useMemo(() => ({
        routines,
        setRoutines,
        addRoutine,
        updateRoutine,
        deleteRoutine,
    }), [routines, setRoutines, addRoutine, updateRoutine, deleteRoutine]);

    return (
        <RoutinesContext.Provider value={value}>
            {children}
        </RoutinesContext.Provider>
    );
};

export const useRoutines = (): RoutinesContextType => {
    const context = useContext(RoutinesContext);
    if (context === undefined) {
        throw new Error('useRoutines must be used within a RoutinesProvider');
    }
    return context;
};