import { Routine } from '../types';

export const formatRepetition = (routine: Routine): string => {
    switch (routine.repetition) {
        case 'Daily':
            return 'Every day';
        case 'Weekly': {
            if (!routine.weekdays || routine.weekdays.length === 0) return 'Weekly';
            if (routine.weekdays.length === 7) return 'Every day';
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return routine.weekdays.map(d => dayNames[d]).join(', ');
        }
        case 'Monthly': {
            if (!routine.monthDays || routine.monthDays.length === 0) return 'Monthly';
            const getOrdinal = (n: number) => {
                const s = ["th", "st", "nd", "rd"];
                const v = n % 100;
                return n + (s[(v - 20) % 10] || s[v] || s[0]);
            }
            return `On the ${routine.monthDays.map(getOrdinal).join(', ')}`;
        }
        case 'Annually':
             if (!routine.annualDates || routine.annualDates.length === 0) return 'Annually';
             return routine.annualDates.map(d => new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })).join(', ');
        case 'None':
            return 'Does not repeat';
        default:
            return routine.repetition;
    }
};
