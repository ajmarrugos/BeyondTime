
import React from 'react';
import ViewHeader from '../ui/ViewHeader';
import { useTheme } from '../../contexts/ThemeContext';

const EventsView: React.FC = () => {
    const { themeConfig } = useTheme();

    return (
        <div className="w-full h-full flex flex-col z-10 p-6 pt-0">
            <ViewHeader 
                title="Events"
                actionButton={{
                    label: "Add",
                    onClick: () => {},
                    disabled: true
                }}
            />

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center">
                    <svg className={`h-24 w-24 ${themeConfig.subtextColor} opacity-50 mx-auto`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h2 className={`text-2xl font-medium ${themeConfig.textColor} mt-6`}>Events Coming Soon</h2>
                    <p className={`mt-2 max-w-sm ${themeConfig.subtextColor}`}>
                        This is where you'll be able to schedule and manage all your life's events.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EventsView;