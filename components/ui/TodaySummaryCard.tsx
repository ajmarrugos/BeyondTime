import React, { useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Routine } from '../../types';

interface TodaySummaryCardProps {
    todaysRoutines: Routine[];
    completedTasks: Record<number, number[]>;
    onNavigateToRoutines: () => void;
}

const TodaySummaryCard: React.FC<TodaySummaryCardProps> = ({
    todaysRoutines,
    completedTasks,
    onNavigateToRoutines,
}) => {
    const { themeConfig } = useTheme();

    const summary = useMemo(() => {
        if (todaysRoutines.length === 0) {
            return null;
        }

        let totalTasks = 0;
        let completedCount = 0;

        todaysRoutines.forEach(routine => {
            totalTasks += routine.tasks.length;
            const completedForRoutine = completedTasks[routine.id] || [];
            completedCount += completedForRoutine.length;
        });

        return {
            totalRoutines: todaysRoutines.length,
            completedTasks: completedCount,
            totalTasks: totalTasks,
        };
    }, [todaysRoutines, completedTasks]);

    if (!summary) {
        return null;
    }

    return (
        <button 
            onClick={onNavigateToRoutines}
            className={`mt-4 px-6 py-3 rounded-2xl w-full max-w-sm ${themeConfig.engravedBg} hover:bg-white/10 transition-colors duration-200 text-left`}
            aria-label={`View today's ${summary.totalRoutines} routines`}
            data-no-swipe="true"
        >
            <div className="flex justify-between items-center">
                <div>
                    <p className={`font-semibold ${themeConfig.textColor}`}>{summary.totalRoutines} {summary.totalRoutines > 1 ? 'Routines' : 'Routine'} Today</p>
                    <p className={`text-sm ${themeConfig.subtextColor}`}>
                        {summary.completedTasks} of {summary.totalTasks} tasks completed
                    </p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${themeConfig.subtextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </button>
    );
};

export default TodaySummaryCard;