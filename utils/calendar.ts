

import { Routine, StartOfWeek } from '../types';

export const isRoutineOnDate = (routine: Routine, date: Date): boolean => {
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    switch (routine.repetition) {
        case 'Daily': return true;
        case 'Weekly': return routine.weekdays?.includes(dayOfWeek) ?? false;
        case 'Monthly': return routine.monthDays?.includes(dayOfMonth) ?? false;
        case 'Annually': return routine.annualDates?.includes(isoDate) ?? false;
        default: return false;
    }
};

// --- Date Helpers ---

export const getDayNames = (startOfWeek: StartOfWeek): string[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (startOfWeek === 'monday') {
        return [...days.slice(1), days[0]]; // Mon, Tue, ..., Sun
    }
    return days; // Sun, Mon, ...
};

export const getWeek = (date: Date, startOfWeek: StartOfWeek): Date[] => {
    const start = new Date(date);
    const day = start.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    if (startOfWeek === 'monday') {
        const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days. Otherwise, go back to Monday.
        start.setDate(start.getDate() + diff);
    } else { // Sunday start
        start.setDate(start.getDate() - day);
    }
    
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(day.getDate() + i);
        week.push(day);
    }
    return week;
};

export const getMonthGrid = (date: Date, startOfWeek: StartOfWeek): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    
    const startDate = new Date(firstDayOfMonth);
    const day = startDate.getDay();

    if (startOfWeek === 'monday') {
        const diff = day === 0 ? -6 : 1 - day;
        startDate.setDate(startDate.getDate() + diff);
    } else { // Sunday start
        startDate.setDate(startDate.getDate() - day);
    }

    const grid: Date[] = [];
    let currentDate = new Date(startDate);

    // Always generate 6 weeks (42 days) for a consistent grid layout
    for (let i = 0; i < 42; i++) {
        grid.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return grid;
};