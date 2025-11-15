import React, { createContext, useState, useCallback, useContext, useMemo } from 'react';

interface DragStateContextType {
    isDraggingRoutine: boolean;
    setIsDraggingRoutine: (isDragging: boolean) => void;
}

const DragStateContext = createContext<DragStateContextType | undefined>(undefined);

export const DragStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDraggingRoutine, setIsDraggingRoutine] = useState(false);

    const value = useMemo(() => ({
        isDraggingRoutine,
        setIsDraggingRoutine,
    }), [isDraggingRoutine]);

    return <DragStateContext.Provider value={value}>{children}</DragStateContext.Provider>;
};

export const useDragState = (): DragStateContextType => {
    const context = useContext(DragStateContext);
    if (context === undefined) {
        throw new Error('useDragState must be used within a DragStateProvider');
    }
    return context;
};
