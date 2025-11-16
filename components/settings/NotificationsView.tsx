import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotificationContext } from '../../contexts/NotificationContext';
import ToggleSwitch from '../forms/ToggleSwitch';
import ExpandableSection from '../ui/ExpandableSection';

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
        <div className="overflow-y-auto h-full space-y-4">
            <ExpandableSection title="Global Toggle" defaultOpen={true}>
                 <p className={`text-sm mb-3 ${themeConfig.subtextColor}`}>Enable or disable all app notifications.</p>
                 <ToggleSwitch
                    label="Enable All Notifications"
                    enabled={notificationsEnabled}
                    setEnabled={setNotificationsEnabled}
                />
            </ExpandableSection>
            
            <ExpandableSection title="Browser Permissions" defaultOpen={true}>
                <p className={`text-sm mb-3 ${themeConfig.subtextColor}`}>Control this app's ability to send notifications.</p>
                 <p className={`${themeConfig.subtextColor} text-sm mb-3`}>
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
            </ExpandableSection>
        </div>
    );
};

export default React.memo(NotificationsView);
