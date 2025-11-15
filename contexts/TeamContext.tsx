import React, { createContext, useContext, useMemo } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { Team } from '../types';

interface TeamContextType {
    teams: Team[];
    setTeams: (teams: Team[] | ((prev: Team[]) => Team[])) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [teams, setTeams] = usePersistentState<Team[]>('teams', []);

    const value = useMemo(() => ({
        teams,
        setTeams,
    }), [teams, setTeams]);

    return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

export const useTeamContext = (): TeamContextType => {
    const context = useContext(TeamContext);
    if (!context) throw new Error('useTeamContext must be used within a TeamProvider');
    return context;
};
