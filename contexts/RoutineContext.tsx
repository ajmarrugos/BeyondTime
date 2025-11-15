import React, { createContext, useContext, useMemo, useCallback } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { Routine } from '../types';

interface RoutineContextType {
    routines: Routine[];
    setRoutines: (routines: Routine[] | ((prev: Routine[]) => Routine[])) => void;
    addRoutine: (routine: Routine) => void;
    updateRoutine: (routine: Routine) => void;
    deleteRoutine: (id: number) => void;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

export const RoutineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [routines, setRoutines] = usePersistentState<Routine[]>('routines', []);
    
    const addRoutine = useCallback((routine: Routine) => {
        setRoutines(prev => [...prev, routine]);
    }, [setRoutines]);

    const updateRoutine = useCallback((updatedRoutine: Routine) => {
        setRoutines(prev => prev.map(r => (r.id === updatedRoutine.id ? updatedRoutine : r)));
    }, [setRoutines]);

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

    return <RoutineContext.Provider value={value}>{children}</RoutineContext.Provider>;
};

export const useRoutineContext = (): RoutineContextType => {
    const context = useContext(RoutineContext);
    if (!context) throw new Error('useRoutineContext must be used within a RoutineProvider');
    return context;
};
