import React, { createContext, useState, useCallback, useContext, useMemo } from 'react';

interface SettingsPanelContextType {
    isSettingsOpen: boolean;
    openSettings: () => void;
    closeSettings: () => void;
}

const SettingsPanelContext = createContext<SettingsPanelContextType | undefined>(undefined);

export const SettingsPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const openSettings = useCallback(() => setIsSettingsOpen(true), []);
    const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

    const value = useMemo(() => ({
        isSettingsOpen,
        openSettings,
        closeSettings,
    }), [isSettingsOpen, openSettings, closeSettings]);

    return <SettingsPanelContext.Provider value={value}>{children}</SettingsPanelContext.Provider>;
};

export const useSettingsPanel = (): SettingsPanelContextType => {
    const context = useContext(SettingsPanelContext);
    if (context === undefined) {
        throw new Error('useSettingsPanel must be used within a SettingsPanelProvider');
    }
    return context;
};