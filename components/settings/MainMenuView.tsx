import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

interface MainMenuViewProps {
    setMenuView: (view: 'main' | 'settings' | 'integrations' | 'permissions' | 'notifications' | 'about') => void;
}

const MenuItem: React.FC<{ onClick: () => void, children: React.ReactNode, icon: React.ReactNode }> = ({ onClick, children, icon }) => {
    const { themeConfig } = useTheme();
    return (
        <li role="presentation">
            <button onClick={onClick} role="menuitem" className={`w-full flex items-center p-4 rounded-xl text-left transition-colors duration-200 hover:bg-white/5 ${themeConfig.textColor}`}>
                <div className="w-6 h-6 mr-3 opacity-80">{icon}</div>
                <span className="flex-1 font-medium">{children}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
            </button>
        </li>
    );
};

const MainMenuView: React.FC<MainMenuViewProps> = ({ setMenuView }) => {
    const { logout } = useAuth();
    const { canViewIntegrations, canManagePermissions } = usePermissions();

    return (
        <div className="flex flex-col h-full">
            <ul role="menu" className="space-y-2 flex-grow">
                <MenuItem 
                    onClick={() => setMenuView('settings')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}
                >
                    Appearance
                </MenuItem>
                 <MenuItem 
                    onClick={() => setMenuView('notifications')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                >
                    Notifications
                </MenuItem>
                {canManagePermissions() && (
                    <MenuItem 
                        onClick={() => setMenuView('permissions')}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                    >
                        Roles & Permissions
                    </MenuItem>
                )}
                {canViewIntegrations() && (
                    <MenuItem 
                        onClick={() => setMenuView('integrations')}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7a8 8 0 0116 0" /></svg>}
                    >
                        Integrations & Data
                    </MenuItem>
                )}
                <MenuItem
                    onClick={() => setMenuView('about')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                >
                    About BeyondTime
                </MenuItem>
            </ul>
            <div className="flex-shrink-0">
                <button onClick={logout} role="menuitem" className={`w-full flex items-center space-x-3 p-4 rounded-xl text-left transition-colors duration-200 hover:bg-red-500/10 text-red-400`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default MainMenuView;