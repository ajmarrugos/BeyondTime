import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { useToast } from './ToastContext';

type PermissionStatus = NotificationPermission;

interface NotificationContextType {
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => void;
    permissionStatus: PermissionStatus;
    requestPermission: () => Promise<PermissionStatus>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notificationsEnabled, setNotificationsEnabled] = usePersistentState<boolean>('notificationsEnabled', true);
    const [permissionStatus, setPermissionStatus] = usePersistentState<PermissionStatus>('notificationPermission', 'default');
    const { addToast } = useToast();

    useEffect(() => {
        // Sync state with the actual browser permission if it's already been set
        if ('permission' in Notification) {
            setPermissionStatus(Notification.permission);
        }
    }, [setPermissionStatus]);

    const requestPermission = useCallback(async (): Promise<PermissionStatus> => {
        if (!('Notification' in window)) {
            addToast('This browser does not support desktop notifications.', 'warning');
            return 'denied';
        }

        try {
            const status = await Notification.requestPermission();
            setPermissionStatus(status);
            if (status === 'granted') {
                addToast('Notification permissions granted!', 'success');
            } else if (status === 'denied') {
                addToast('Notification permissions denied.', 'warning');
            }
            return status;
        } catch (error) {
            console.error('Notification permission request failed:', error);
            addToast('Failed to request notification permissions.', 'error');
            return 'denied';
        }
    }, [setPermissionStatus, addToast]);

    const value = useMemo(() => ({
        notificationsEnabled,
        setNotificationsEnabled,
        permissionStatus,
        requestPermission,
    }), [notificationsEnabled, setNotificationsEnabled, permissionStatus, requestPermission]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};
