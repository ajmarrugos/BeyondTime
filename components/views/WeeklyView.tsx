
import React, { useState, useMemo } from 'react';
import { Routine } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { getWeek, isRoutineOnDate, getDayNames } from '../../utils/calendar';
import CalendarItem from '../ui/CalendarItem';

interface WeeklyViewProps {
    routines: Routine[];
}

type ScheduledItem = {
    type: 'routine' | 'event';
    data: Routine;
};

const WeeklyView: React.FC<WeeklyViewProps> = ({ routines }) => {
    const { themeConfig, startOfWeek } = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());

    const weekDays = useMemo(() => getWeek(currentDate, startOfWeek), [currentDate, startOfWeek]);

    const handlePrevWeek = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() - 7);
            return newDate;
        });
    };

    const handleNextWeek = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 7);
            return newDate;
        });
    };
    
    const scheduleByDay = useMemo(() => {
        const schedule = new Map<string, ScheduledItem[]>();
        weekDays.forEach(day => {
            const dayKey = day.toISOString().split('T')[0];
            const items: ScheduledItem[] = [];

            routines.forEach(item => {
                if (isRoutineOnDate(item, day)) {
                    const type = item.tags.includes('Event') ? 'event' : 'routine';
                    items.push({ type, data: item });
                }
            });
            
            items.sort((a, b) => a.data.startTime.localeCompare(b.data.startTime));

            schedule.set(dayKey, items);
        });
        return schedule;
    }, [weekDays, routines]);

    const weekFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
    const yearFormatter = new Intl.DateTimeFormat(undefined, { year: 'numeric' });
    const weekRange = `${weekFormatter.format(weekDays[0])} - ${weekFormatter.format(weekDays[6])}, ${yearFormatter.format(currentDate)}`;

    const dayNames = useMemo(() => getDayNames(startOfWeek), [startOfWeek]);

    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];

    return (
        <div className="w-full h-full flex flex-col max-w-5xl mx-auto">
            <header className="flex-shrink-0 flex items-center justify-between py-2 w-full">
                <button onClick={handlePrevWeek} aria-label="Previous week" className={`p-2 rounded-full hover:bg-white/10 ${themeConfig.textColor}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                <div className="text-center">
                    <h2 className={`text-lg font-semibold ${themeConfig.textColor}`}>{weekRange}</h2>
                    <button onClick={() => setCurrentDate(new Date())} className={`text-sm font-medium ${themeConfig.subtextColor} hover:text-accent`}>Today</button>
                </div>
                <button onClick={handleNextWeek} aria-label="Next week" className={`p-2 rounded-full hover:bg-white/10 ${themeConfig.textColor}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
            </header>

            <div className="flex-1 flex flex-col w-full overflow-hidden">
                <div className="grid grid-cols-7 gap-2">
                    {dayNames.map(day => (
                        <div key={day} className={`text-center text-sm font-bold pb-2 ${themeConfig.subtextColor}`}>{day}</div>
                    ))}
                </div>
                <div className="flex-1 grid grid-cols-7 gap-2 overflow-hidden">
                    {weekDays.map(day => {
                        const dayKey = day.toISOString().split('T')[0];
                        const items = scheduleByDay.get(dayKey) || [];
                        const isToday = dayKey === todayKey;

                        return (
                            <div key={dayKey} className={`flex flex-col rounded-xl bg-black/10 p-2 overflow-hidden border ${isToday ? 'border-accent' : 'border-transparent'}`}>
                                <div className="flex-shrink-0 text-center mb-2">
                                    <span className={`text-sm font-medium ${isToday ? themeConfig.textColor : themeConfig.subtextColor}`}>{day.getDate()}</span>
                                </div>
                                <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 -mr-1">
                                    {items.map(item => (
                                        <CalendarItem
                                            key={`${item.type}-${item.data.id}`}
                                            title={item.data.name}
                                            color={item.type === 'routine' ? item.data.color : undefined}
                                            type={item.type}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WeeklyView;
