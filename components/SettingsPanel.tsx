import React, { useState, useEffect, memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
// Fix: DURATION_NORMAL is exported from constants.ts, not animations.ts.
import { DURATION_NORMAL } from '../config/constants';
import { useFocusTrap } from '../hooks/useFocusTrap';

// Sub-views
import MainMenuView from './settings/MainMenuView';
import AppearanceSettingsView from './settings/AppearanceSettingsView';
import IntegrationsDataView from './settings/IntegrationsDataView';
import PermissionsView from './settings/PermissionsView';
import NotificationsView from './settings/NotificationsView';
import AboutView from './settings/AboutView';
import AccountSettingsView from './settings/AccountSettingsView';

type MenuView = 'main' | 'account' | 'settings' | 'integrations' | 'permissions' | 'notifications' | 'about';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const viewTitles: Record<MenuView, string> = {
    main: 'Menu',
    account: 'Account',
    settings: 'Appearance',
    integrations: 'Integrations & Data',
    permissions: 'Roles & Permissions',
    notifications: 'Notifications',
    about: 'About',
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
    const { themeConfig } = useTheme();
    const [menuView, setMenuView] = useState<MenuView>('main');
    const panelRef = useFocusTrap(isOpen);

    // Reset menu view when panel is closed
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setMenuView('main');
            }, DURATION_NORMAL);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const renderView = (view: MenuView) => {
        const commonStyle = `absolute top-0 left-0 w-full h-full p-6 transition-transform duration-300 ease-in-out`;
        const activeStyle = menuView === view ? 'translate-x-0' : (view === 'main' ? '-translate-x-full' : 'translate-x-full');
        
        switch(view) {
            case 'main':
                return <div className={`${commonStyle} ${activeStyle}`}><MainMenuView setMenuView={setMenuView} /></div>;
            case 'account':
                return <div className={`${commonStyle} ${activeStyle}`}><AccountSettingsView /></div>;
            case 'settings':
                return <div className={`${commonStyle} ${activeStyle}`}><AppearanceSettingsView /></div>;
            case 'integrations':
                return <div className={`${commonStyle} ${activeStyle}`}><IntegrationsDataView /></div>;
            case 'permissions':
                return <div className={`${commonStyle} ${activeStyle}`}><PermissionsView /></div>;
            case 'notifications':
                return <div className={`${commonStyle} ${activeStyle}`}><NotificationsView /></div>;
            case 'about':
                return <div className={`${commonStyle} ${activeStyle}`}><AboutView /></div>;
            default:
                return null;
        }
    };
    
    return (
        <>
            {isOpen && (
                <div onClick={onClose} className="absolute inset-0 bg-black/30 z-30" aria-hidden="true" />
            )}

            <aside
                ref={panelRef as React.RefObject<HTMLDivElement>}
                id="side-menu"
                className={`fixed top-0 right-0 h-full w-80 z-40 transform transition-transform duration-300 ease-in-out ${themeConfig.cardBg} backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                aria-hidden={!isOpen}
            >
                <header className="flex items-center p-4 border-b border-white/10">
                    {menuView !== 'main' && (
                        <button onClick={() => setMenuView('main')} aria-label="Go back to main menu" className={`p-2 rounded-full hover:bg-white/10 transition-colors ${themeConfig.textColor}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                    )}
                    <h2 className={`text-xl font-semibold ${themeConfig.textColor} mx-auto`}>
                        {viewTitles[menuView]}
                    </h2>
                    <button onClick={onClose} aria-label="Close menu" className={`p-2 rounded-full hover:bg-white/10 transition-colors ${themeConfig.textColor}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <div className="relative flex-1 overflow-hidden">
                    {renderView('main')}
                    {renderView('account')}
                    {renderView('settings')}
                    {renderView('integrations')}
                    {renderView('permissions')}
                    {renderView('notifications')}
                    {renderView('about')}
                </div>
            </aside>
        </>
    );
};

export default memo(SettingsPanel);