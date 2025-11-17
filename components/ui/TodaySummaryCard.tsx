import React, { useMemo, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Routine } from '../../types';
import CalendarItem from './CalendarItem';

interface TodaySummaryCardProps {
    todaysRoutines: Routine[];
    onItemClick: (routine: Routine) => void;
}

const MetricItem: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({ icon, value, label }) => {
    const { themeConfig } = useTheme();
    return (
        <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-black/20 ${themeConfig.subtextColor}`}>
                {icon}
            </div>
            <div>
                <p className={`text-base font-bold ${themeConfig.textColor}`}>{value}</p>
                <p className={`text-xs font-medium uppercase tracking-wider ${themeConfig.subtextColor}`}>{label}</p>
            </div>
        </div>
    );
};

const TodaySummaryCard: React.FC<TodaySummaryCardProps> = ({
    todaysRoutines,
    onItemClick,
}) => {
    const { themeConfig } = useTheme();
    const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);

    const timeMetrics = useMemo(() => {
        const restTags = ['sleep', 'rest', 'nap', 'lay down'];
        let restingHours = 0;
        let busyHours = 0;

        const getDurationInHours = (startTime: string, endTime: string): number => {
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            const startTotalMinutes = startH * 60 + startM;
            const endTotalMinutes = endH * 60 + endM;

            if (endTotalMinutes <= startTotalMinutes) { // Overnight schedule
                return ((24 * 60 - startTotalMinutes) + endTotalMinutes) / 60;
            } else { // Same-day schedule
                return (endTotalMinutes - startTotalMinutes) / 60;
            }
        };

        todaysRoutines.forEach(routine => {
            // Tasks and Payments are considered instantaneous and don't contribute to duration
            if (routine.tags.includes('Task') || routine.tags.includes('Payment')) {
                return;
            }

            const duration = getDurationInHours(routine.startTime, routine.endTime);
            const isRest = routine.tags.some(tag => restTags.includes(tag.toLowerCase()));
            
            if (isRest) {
                restingHours += duration;
            } else {
                busyHours += duration;
            }
        });
        
        const upHours = Math.max(0, 24 - restingHours);
        const freeHours = Math.max(0, 24 - restingHours - busyHours);

        return {
            resting: restingHours,
            busy: busyHours,
            up: upHours,
            free: freeHours,
        };
    }, [todaysRoutines]);

    const formatHours = (hours: number): string => {
        if (hours <= 0) return '0h';
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        if (m === 0) return `${h}h`;
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    };

    if (todaysRoutines.length === 0) {
        return (
            <div className={`mt-4 px-6 py-3 rounded-full w-full max-w-sm ${themeConfig.engravedBg} text-center`}>
                <p className={`text-sm ${themeConfig.subtextColor}`}>No items scheduled for today.</p>
            </div>
        );
    }
    
    return (
        <div 
            className={`mt-4 p-4 rounded-2xl w-full max-w-sm ${themeConfig.engravedBg} backdrop-blur-sm border border-white/5`}
            data-no-swipe="true"
        >
            {/* Top Section: Icons + Toggle Button */}
            <div className="flex items-center">
                 <div className={`flex-grow flex items-center justify-start flex-wrap gap-3 transition-all duration-300 ${!isMetricsExpanded ? 'h-10 overflow-hidden' : ''}`}>
                    {todaysRoutines.map(routine => (
                        <CalendarItem
                            key={routine.id}
                            title={routine.name}
                            icon={routine.icon}
                            color={!routine.tags.includes('Event') ? routine.color : undefined}
                            type={routine.tags.includes('Event') ? 'event' : 'routine'}
                            onClick={() => onItemClick(routine)}
                            size="md"
                        />
                    ))}
                </div>
                 <button 
                    onClick={() => setIsMetricsExpanded(!isMetricsExpanded)} 
                    className={`p-2 ml-2 rounded-full self-start hover:bg-white/10 transition-colors ${themeConfig.textColor}`}
                    aria-expanded={isMetricsExpanded}
                    aria-label={isMetricsExpanded ? 'Collapse time summary' : 'Expand time summary'}
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isMetricsExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>


            {/* Expandable Section */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isMetricsExpanded ? 'max-h-96 mt-3 pt-3 border-t border-white/10' : 'max-h-0'}`}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <MetricItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                        value={formatHours(timeMetrics.resting)}
                        label="Resting"
                    />
                    <MetricItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                        value={formatHours(timeMetrics.busy)}
                        label="Busy"
                    />
                    <MetricItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                        value={formatHours(timeMetrics.up)}
                        label="Up"
                    />
                    <MetricItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.343A8 8 0 0112 20c-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8s8 3.582 8 8c0 1.956-.7 3.75-1.85 5.143M18 8a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        value={formatHours(timeMetrics.free)}
                        label="Free"
                    />
                </div>
            </div>
        </div>
    );
};

export default TodaySummaryCard;