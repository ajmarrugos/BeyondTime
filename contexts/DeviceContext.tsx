
import React, { createContext, useContext, useMemo } from 'react';
import useDeviceType from '../hooks/useDeviceType';

export interface DeviceInfo {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}

const DeviceContext = createContext<DeviceInfo | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const deviceType = useDeviceType();
    
    // useMemo to prevent re-rendering consumers when the value hasn't changed
    const value = useMemo(() => deviceType, [deviceType]);

    return (
        <DeviceContext.Provider value={value}>
            {children}
        </DeviceContext.Provider>
    );
};

export const useDevice = (): DeviceInfo => {
    const context = useContext(DeviceContext);
    if (context === undefined) {
        throw new Error('useDevice must be used within a DeviceProvider');
    }
    return context;
};
