import React, { createContext, useContext, useMemo } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { Event } from '../types';

interface EventContextType {
    events: Event[];
    setEvents: (events: Event[] | ((prev: Event[]) => Event[])) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [events, setEvents] = usePersistentState<Event[]>('events', []);

    const value = useMemo(() => ({
        events,
        setEvents,
    }), [events, setEvents]);

    return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEventContext = (): EventContextType => {
    const context = useContext(EventContext);
    if (!context) throw new Error('useEventContext must be used within an EventProvider');
    return context;
};
