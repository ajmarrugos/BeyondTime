

import React, { useState, useMemo } from 'react';
import { Routine } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { getMonthGrid, isRoutineOnDate, getDayNames } from '../../utils/calendar';
import CalendarItem from '../ui/CalendarItem';
import { useModal } from '../../contexts/ModalContext';

interface MonthlyViewProps {
    routines: Routine[];
}

type ScheduledItem = {
    type: 'routine' | 'event';
    data: Routine;
};

const MonthlyView: React.FC<MonthlyViewProps> = ({ routines }) => {
    const { themeConfig, startOfWeek } = useTheme();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const { openRoutineDetailModal } = useModal();

    const monthGridDays = useMemo(() => getMonthGrid(currentMonth, startOfWeek), [currentMonth, startOfWeek]);

    const handlePrevMonth = () => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    };

    const scheduleByDay = useMemo(() => {
        const schedule = new Map<string, ScheduledItem[]>();
        monthGridDays.forEach(day => {
            const dayKey = day.toISOString().split('T')[0];
            const items: ScheduledItem[] = [];

            routines.forEach(item => {
                if (isRoutineOnDate(item, day)) {
                    const type = item.tags.includes('Event') ? 'event' : 'routine';
                    items.push({ type, data: item });
                }
            });
            
            if (items.length > 0) {
                 items.sort((a, b) => a.data.startTime.localeCompare(b.data.startTime));
                 schedule.set(dayKey, items);
            }
        });
        return schedule;
    }, [monthGridDays, routines]);
    
    const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
    const dayNames = useMemo(() => getDayNames(startOfWeek), [startOfWeek]);
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];

    return (
        <div className="w-full flex flex-col max-w-5xl mx-auto">
            <header className="flex-shrink-0 flex items-center justify-between py-2 w-full">
                <button onClick={handlePrevMonth} aria-label="Previous month" className={`p-2 rounded-full hover:bg-white/10 ${themeConfig.textColor}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                <div className="text-center">
                    <h2 className={`text-lg font-semibold ${themeConfig.textColor}`}>{monthFormatter.format(currentMonth)}</h2>
                    <button onClick={() => setCurrentMonth(new Date())} className={`text-sm font-medium ${themeConfig.subtextColor} hover:text-accent`}>Today</button>
                </div>
                <button onClick={handleNextMonth} aria-label="Next month" className={`p-2 rounded-full hover:bg-white/10 ${themeConfig.textColor}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
            </header>

            <div className="flex flex-col w-full">
                <div className="grid grid-cols-7 gap-1">
                    {dayNames.map(day => (
                        <div key={day} className={`text-center text-sm font-bold pb-2 ${themeConfig.subtextColor}`}>{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 grid-rows-6 gap-1">
                    {monthGridDays.map((day, index) => {
                        const dayKey = day.toISOString().split('T')[0];
                        const items = scheduleByDay.get(dayKey) || [];
                        const isToday = dayKey === todayKey;
                        const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

                        return (
                            <div key={index} className={`flex flex-col rounded-lg bg-black/10 p-1.5 overflow-hidden transition-opacity duration-300 ${isCurrentMonth ? 'opacity-100' : 'opacity-40'} min-h-[12vh]`}>
                                <div className="flex-shrink-0 text-center mb-1">
                                    <span className={`text-xs font-medium ${isToday ? 'bg-accent text-white rounded-full w-5 h-5 inline-flex items-center justify-center' : themeConfig.textColor}`}>{day.getDate()}</span>
                                </div>
                                <div className="flex-1 flex flex-wrap gap-1 content-start overflow-y-auto p-1 -m-1">
                                    {items.map(item => (
                                        <CalendarItem
                                            key={`${item.type}-${item.data.id}`}
                                            title={item.data.name}
                                            icon={item.data.icon}
                                            color={item.type === 'routine' ? item.data.color : undefined}
                                            type={item.type}
                                            onClick={() => openRoutineDetailModal(item.data)}
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

export default MonthlyView;