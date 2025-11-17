import { Role, Member, Routine, Team, Task } from '../types';

const isObject = (v: any): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

const validateString = (v: any, optional = false): boolean => optional ? (v === undefined || typeof v === 'string') : (typeof v === 'string');
const validateNumber = (v: any, optional = false): boolean => optional ? (v === undefined || typeof v === 'number') : (typeof v === 'number');
const validateBoolean = (v: any): boolean => typeof v === 'boolean';
const validateArray = (v: any, optional = false): boolean => optional ? (v === undefined || Array.isArray(v)) : Array.isArray(v);

const validateMember = (data: any): string | null => {
    if (!isObject(data)) return 'Member must be an object.';
    if (!validateNumber(data.id)) return 'Member.id is missing or not a number.';
    if (!validateString(data.name) || (data.name as string).trim() === '') return 'Member.name is missing or invalid.';
    if (!['Admin', 'Owner', 'Member'].includes(data.role as Role)) return `Member.role is invalid: ${data.role}`;
    if (!validateNumber(data.teamId, true)) return 'Member.teamId must be a number if present.';
    if (!validateString(data.phone, true)) return 'Member.phone must be a string if present.';
    if (!validateString(data.timezone, true)) return 'Member.timezone must be a string if present.';
    if (!validateString(data.password, true)) return 'Member.password must be a string if present.';
    return null;
};

const validateTask = (data: any): string | null => {
    if (!isObject(data)) return 'Task must be an object.';
    if (!validateNumber(data.id)) return 'Task.id is missing or not a number.';
    if (!validateString(data.text) || (data.text as string).trim() === '') return 'Task.text is missing or invalid.';
    if (!validateNumber(data.budget, true)) return 'Task.budget must be a number if present.';
    return null;
};

const validateNotifications = (data: any): string | null => {
    if (!isObject(data)) return 'Notifications must be an object.';
    if (!validateBoolean(data.enabled)) return 'Notifications.enabled must be a boolean.';
    if (!validateNumber(data.notifyBefore)) return 'Notifications.notifyBefore must be a number.';
    if (!validateBoolean(data.notifyAtStart)) return 'Notifications.notifyAtStart must be a boolean.';
    if (!validateBoolean(data.notifyAtEnd)) return 'Notifications.notifyAtEnd must be a boolean.';
    return null;
};

const validateRoutine = (data: any): string | null => {
    if (!isObject(data)) return 'Routine must be an object.';
    if (!validateNumber(data.id)) return 'Routine.id is missing or not a number.';
    if (!validateNumber(data.memberId)) return 'Routine.memberId is missing or not a number.';
    if (!validateString(data.name) || (data.name as string).trim() === '') return 'Routine.name is missing or invalid.';
    if (!validateString(data.description, true)) return 'Routine.description must be a string if present.';
    if (!validateString(data.color) || !(data.color as string).startsWith('#')) return 'Routine.color is invalid.';
    if (!validateString(data.icon)) return 'Routine.icon is missing or not a string.';
    if (!validateBoolean(data.autoLive)) return 'Routine.autoLive must be a boolean.';
    if (!validateString(data.repetition) || !['Daily', 'Weekly', 'Monthly', 'Annually', 'None'].includes(data.repetition as string)) return 'Routine.repetition is invalid.';
    if (!validateArray(data.tags)) return 'Routine.tags must be an array.';
    if (!validateString(data.startTime)) return 'Routine.startTime is missing or invalid.';
    if (!validateString(data.endTime)) return 'Routine.endTime is missing or invalid.';
    
    if (!validateArray(data.tasks)) return 'Routine.tasks must be an array.';
    for (const task of data.tasks as any[]) {
        const taskError = validateTask(task);
        if (taskError) return `Invalid task in routine ${data.id}: ${taskError}`;
    }

    if (data.notifications) {
        const notificationError = validateNotifications(data.notifications);
        if (notificationError) return `Invalid notifications in routine ${data.id}: ${notificationError}`;
    } else {
        return `Routine.notifications object is missing for routine ${data.id}.`;
    }

    // Optional fields
    if (!validateArray(data.weekdays, true)) return 'Routine.weekdays must be an array if present.';
    if (!validateArray(data.monthDays, true)) return 'Routine.monthDays must be an array if present.';
    if (!validateArray(data.annualDates, true)) return 'Routine.annualDates must be an array if present.';
    if (!validateNumber(data.budget, true)) return 'Routine.budget must be a number if present.';

    return null;
};

const validateTeam = (data: any): string | null => {
    if (!isObject(data)) return 'Team must be an object.';
    if (!validateNumber(data.id)) return 'Team.id must be a number.';
    if (!validateString(data.name) || (data.name as string).trim() === '') return 'Team.name must be a non-empty string.';
    return null;
}

export const validateImportData = (data: any): string | null => {
    if (!isObject(data)) {
        return 'Imported data must be a JSON object.';
    }

    if (data.members) {
        if (!Array.isArray(data.members)) return 'Data property "members" must be an array.';
        for (const item of data.members) {
            const error = validateMember(item);
            if (error) return `Invalid member data: ${error}`;
        }
    }

    if (data.routines) {
        if (!Array.isArray(data.routines)) return 'Data property "routines" must be an array.';
        for (const item of data.routines) {
            const error = validateRoutine(item);
            if (error) return `Invalid routine data: ${error}`;
        }
    }
    
    if (data.teams) {
        if (!Array.isArray(data.teams)) return 'Data property "teams" must be an array.';
        for (const item of data.teams) {
            const error = validateTeam(item);
            if (error) return `Invalid team data: ${error}`;
        }
    }
    
    return null; // All good
};