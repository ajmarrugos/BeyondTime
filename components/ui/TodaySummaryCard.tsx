import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Routine } from '../../types';
import CalendarItem from './CalendarItem';

interface TodaySummaryCardProps {
    todaysRoutines: Routine[];
    onItemClick: (routine: Routine) => void;
}

const TodaySummaryCard: React.FC<TodaySummaryCardProps> = ({
    todaysRoutines,
    onItemClick,
}) => {
    const { themeConfig } = useTheme();

    if (todaysRoutines.length === 0) {
        return (
            <div className={`mt-4 px-6 py-3 rounded-full w-full max-w-sm ${themeConfig.engravedBg} text-center`}>
                <p className={`text-sm ${themeConfig.subtextColor}`}>No items scheduled for today.</p>
            </div>
        );
    }

    return (
        <div 
            className={`mt-4 px-4 py-3 rounded-full w-full max-w-sm ${themeConfig.engravedBg}`}
            data-no-swipe="true"
        >
            <div className="flex items-center justify-center flex-wrap gap-3">
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
        </div>
    );
};

export default TodaySummaryCard;