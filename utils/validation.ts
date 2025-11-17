import { Role } from '../types';

// Simple type guards
const isString = (v: any): v is string => typeof v === 'string';
const isNumber = (v: any): v is number => typeof v === 'number';
const isArray = (v: any): v is any[] => Array.isArray(v);
const isBoolean = (v: any): v is boolean => typeof v === 'boolean';
// FIX: Change 'object' to 'Record<string, unknown>' to allow property access on validated objects.
const isObject = (v: any): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isRole = (v: any): v is Role => ['Admin', 'Owner', 'Member'].includes(v);

const validateMember = (member: any): string | null => {
    if (!isObject(member)) return 'Member must be an object.';
    if (!isNumber(member.id)) return 'Member ID must be a number.';
    if (!isString(member.name) || member.name.trim() === '') return 'Member name must be a non-empty string.';
    if (!isRole(member.role)) return 'Member role is invalid.';
    // Optional fields
    if (member.teamId !== undefined && !isNumber(member.teamId)) return 'Member teamId must be a number if present.';
    if (member.phone !== undefined && !isString(member.phone)) return 'Member phone must be a string if present.';
    if (member.timezone !== undefined && !isString(member.timezone)) return 'Member timezone must be a string if present.';
    return null;
};

const validateNotifications = (notifications: any): string | null => {
    if (!isObject(notifications)) return 'Notifications must be an object.';
    if (!isBoolean(notifications.enabled)) return 'Notification enabled flag must be a boolean.';
    if (!isNumber(notifications.notifyBefore)) return 'Notification notifyBefore must be a number.';
    if (!isBoolean(notifications.notifyAtStart)) return 'Notification notifyAtStart must be a boolean.';
    if (!isBoolean(notifications.notifyAtEnd)) return 'Notification notifyAtEnd must be a boolean.';
    return null;
};

const validateRoutine = (routine: any): string | null => {
    if (!isObject(routine)) return 'Routine must be an object.';
    if (!isNumber(routine.id)) return 'Routine ID must be a number.';
    if (!isString(routine.name) || routine.name.trim() === '') return 'Routine name must be a non-empty string.';
    if (!isNumber(routine.memberId)) return 'Routine memberId must be a number.';
    if (!isString(routine.color) || !routine.color.startsWith('#')) return 'Routine color is invalid.';
    // FIX: Add a type check for 'repetition' before using it in 'includes'.
    if (!isString(routine.repetition) || !['Daily', 'Weekly', 'Monthly', 'Annually', 'None'].includes(routine.repetition)) return 'Routine repetition is invalid.';
    if (routine.tasks && !isArray(routine.tasks)) return 'Routine tasks must be an array.';
    
    // Validate optional notifications object
    if (routine.notifications) {
        const notificationError = validateNotifications(routine.notifications);
        if (notificationError) return `Invalid routine.notifications data: ${notificationError}`;
    }

    return null;
};

const validateTeam = (team: any): string | null => {
    if (!isObject(team)) return 'Team must be an object.';
    if (!isNumber(team.id)) return 'Team ID must be a number.';
    if (!isString(team.name) || team.name.trim() === '') return 'Team name must be a non-empty string.';
    return null;
}

const validateEvent = (event: any): string | null => {
    if (!isObject(event)) return 'Event must be an object.';
    if (!isNumber(event.id)) return 'Event ID must be a number.';
    if (!isString(event.name) || event.name.trim() === '') return 'Event name must be a non-empty string.';
    if (!isString(event.date)) return 'Event date must be a string.';
    return null;
}


export const validateImportData = (data: any): string | null => {
    if (typeof data !== 'object' || data === null) {
        return 'Imported data must be a JSON object.';
    }

    if (data.members) {
        if (!isArray(data.members)) return 'Data property "members" must be an array.';
        for (const item of data.members) {
            const error = validateMember(item);
            if (error) return `Invalid member data: ${error}`;
        }
    }

    if (data.routines) {
        if (!isArray(data.routines)) return 'Data property "routines" must be an array.';
        for (const item of data.routines) {
            const error = validateRoutine(item);
            if (error) return `Invalid routine data: ${error}`;
        }
    }
    
    if (data.teams) {
        if (!isArray(data.teams)) return 'Data property "teams" must be an array.';
        for (const item of data.teams) {
            const error = validateTeam(item);
            if (error) return `Invalid team data: ${error}`;
        }
    }

    if (data.events) {
        if (!isArray(data.events)) return 'Data property "events" must be an array.';
        for (const item of data.events) {
            const error = validateEvent(item);
            if (error) return `Invalid event data: ${error}`;
        }
    }
    
    return null; // All good
};