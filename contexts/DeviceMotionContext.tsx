import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import usePersistentState from '../hooks/usePersistentState';

type PermissionStatus = 'prompt' | 'granted' | 'denied';

interface TiltData {
    beta: number;  // front-back tilt
    gamma: number; // left-right tilt
}

interface DeviceMotionContextType {
    tilt: TiltData | null;
    permissionStatus: PermissionStatus;
    requestPermission: () => Promise<PermissionStatus>;
}

const DeviceMotionContext = createContext<DeviceMotionContextType | undefined>(undefined);

export const DeviceMotionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tilt, setTilt] = useState<TiltData | null>(null);
    const [permissionStatus, setPermissionStatus] = usePersistentState<PermissionStatus>('deviceMotionPermission', 'prompt');

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
        const { x, y } = event.accelerationIncludingGravity || { x: 0, y: 0 };
        setTilt({ beta: y ?? 0, gamma: x ?? 0 });
    };

    useEffect(() => {
        if (permissionStatus === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
        } else {
            window.removeEventListener('devicemotion', handleDeviceMotion);
        }

        return () => {
            window.removeEventListener('devicemotion', handleDeviceMotion);
        };
    }, [permissionStatus]);

    const requestPermission = useCallback(async (): Promise<PermissionStatus> => {
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            try {
                const status = await (DeviceMotionEvent as any).requestPermission();
                if (status === 'granted') {
                    setPermissionStatus('granted');
                    return 'granted';
                } else {
                    setPermissionStatus('denied');
                    return 'denied';
                }
            } catch (error) {
                console.error('Device motion permission request failed:', error);
                setPermissionStatus('denied');
                return 'denied';
            }
        } else {
            setPermissionStatus('granted');
            return 'granted';
        }
    }, [setPermissionStatus]);
    
    const value = { tilt, permissionStatus, requestPermission };

    return (
        <DeviceMotionContext.Provider value={value}>
            {children}
        </DeviceMotionContext.Provider>
    );
};

export const useDeviceMotion = (): DeviceMotionContextType => {
    const context = useContext(DeviceMotionContext);
    if (!context) {
        throw new Error('useDeviceMotion must be used within a DeviceMotionProvider');
    }
    return context;
};
