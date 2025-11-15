import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface MetricItemProps {
    value: number;
    label: string;
    icon?: React.ReactNode;
}

const MetricItem: React.FC<MetricItemProps> = ({ value, label, icon }) => {
    const { themeConfig } = useTheme();
    // Detailed view with icon
    if (icon) {
        return (
             <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-black/20 ${themeConfig.subtextColor}`}>
                    {icon}
                </div>
                <div>
                    <p className={`text-xl font-bold ${themeConfig.textColor}`}>{value}</p>
                    <p className={`text-xs font-medium uppercase tracking-wider ${themeConfig.subtextColor}`}>{label}</p>
                </div>
            </div>
        );
    }
    // Compact view without icon
    return (
        <div className="text-center p-2">
            <p className={`text-xl font-bold ${themeConfig.textColor}`}>{value}</p>
            <p className={`text-xs font-medium uppercase tracking-wider ${themeConfig.subtextColor}`}>{label}</p>
        </div>
    );
};


interface RoutineMetricsProps {
    totalRoutines: number;
    liveNow: number;
    completed: number;
    totalTasks: number;
    totalTasksOfWeek: number;
    totalTasksOfMonth: number;
}

const RoutineMetrics: React.FC<RoutineMetricsProps> = ({
    totalRoutines,
    liveNow,
    completed,
    totalTasks,
    totalTasksOfWeek,
    totalTasksOfMonth,
}) => {
    const { themeConfig } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="w-full max-w-3xl mx-auto mb-3 p-2 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/5">
            <div className="flex items-center">
                <div className="flex-grow grid grid-cols-3 divide-x divide-white/10">
                    <MetricItem value={totalRoutines} label="Routines" />
                    <MetricItem value={liveNow} label="Live Now" />
                    <MetricItem value={completed} label="Completed" />
                </div>
                <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className={`p-3 rounded-full hover:bg-white/10 transition-colors ${themeConfig.textColor}`}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Collapse metrics' : 'Expand metrics'}
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 mt-2 pt-3 border-t border-white/10' : 'max-h-0'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 px-1">
                    <MetricItem 
                        value={totalTasks}
                        label="Tasks Today"
                        icon={
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        }
                    />
                     <MetricItem 
                        value={totalTasksOfWeek}
                        label="Tasks This Week"
                        icon={
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        }
                    />
                     <MetricItem 
                        value={totalTasksOfMonth}
                        label="Tasks this Month"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default RoutineMetrics;