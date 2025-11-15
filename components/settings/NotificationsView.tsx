import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotificationContext } from '../../contexts/NotificationContext';
import SectionHeader from '../ui/SectionHeader';
import ToggleSwitch from '../forms/ToggleSwitch';

const NotificationsView: React.FC = () => {
    const { themeConfig } = useTheme();
    const {
        notificationsEnabled,
        setNotificationsEnabled,
        permissionStatus,
        requestPermission,
    } = useNotificationContext();

    const getPermissionStatusText = () => {
        switch (permissionStatus) {
            case 'granted':
                return "You have granted notification permissions.";
            case 'denied':
                return "You have denied notification permissions. You must change this in your browser settings.";
            case 'default':
            default:
                return "You have not yet granted notification permissions.";
        }
    };

    return (
        <div className="overflow-y-auto h-full space-y-6">
            <SectionHeader title="Notification Settings" description="Manage how you receive alerts." />

            <div className="p-4 rounded-xl bg-black/20">
                <ToggleSwitch
                    label="Enable All Notifications"
                    enabled={notificationsEnabled}
                    setEnabled={setNotificationsEnabled}
                />
            </div>

            <SectionHeader title="Browser Permissions" description="Control this app's ability to send notifications." />

            <div className="p-4 rounded-xl bg-black/20 space-y-3">
                <p className={`${themeConfig.subtextColor} text-sm`}>
                    {getPermissionStatusText()}
                </p>
                {(permissionStatus === 'default' || permissionStatus === 'denied') && (
                    <button
                        onClick={requestPermission}
                        disabled={permissionStatus === 'denied'}
                        className={`w-full p-3 rounded-xl font-semibold text-center text-white bg-accent hover:shadow-lg hover:shadow-accent/30 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {permissionStatus === 'denied' ? 'Permissions Denied' : 'Request Permissions'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default React.memo(NotificationsView);
