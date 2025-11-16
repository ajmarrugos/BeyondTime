import { Member, Routine, PermissionSet } from '../types';

export const can = (permissionSet: PermissionSet, permission: keyof PermissionSet): boolean => {
    const scope = permissionSet[permission];
    return !!scope && scope !== 'None';
};

export const getVisibleRoutinesSelector = (
    routines: Routine[],
    members: Member[],
    currentUser: Member,
    permissionSet: PermissionSet
): Routine[] => {
    const scope = permissionSet.viewRoutines;
    switch (scope) {
        case 'All':
            return routines;
        case 'Team':
            const teamMemberIds = members
                .filter(m => m.teamId === currentUser.teamId)
                .map(m => m.id);
            return routines.filter(r => teamMemberIds.includes(r.memberId));
        case 'Self':
            return routines.filter(r => r.memberId === currentUser.id);
        default:
            return [];
    }
};

export const getManageableMembersSelector = (
    members: Member[],
    currentUser: Member,
    permissionSet: PermissionSet
): Member[] => {
    const scope = permissionSet.manageMembers;
    switch (scope) {
        case 'All':
            return members;
        case 'Team':
            return members.filter(m => m.teamId === currentUser.teamId && m.id !== currentUser.id);
        case 'Self':
            return members.filter(m => m.id === currentUser.id);
        default:
            return [];
    }
};

export const canManageRoutineSelector = (
    routine: Routine,
    members: Member[],
    currentUser: Member,
    permissionSet: PermissionSet
): boolean => {
    const scope = permissionSet.manageRoutines;
    switch (scope) {
        case 'All':
            return true;
        case 'Team':
            const member = members.find(m => m.id === routine.memberId);
            return member?.teamId === currentUser.teamId;
        case 'Self':
            return routine.memberId === currentUser.id;
        default:
            return false;
    }
};

export const getAssignableMembersSelector = (
    members: Member[],
    currentUser: Member,
    permissionSet: PermissionSet
): Member[] => {
    const scope = permissionSet.viewRoutines; // Logic is based on what you can SEE to assign
    switch (scope) {
        case 'All':
            return members;
        case 'Team':
            return members.filter(m => m.teamId === currentUser.teamId);
        case 'Self':
            return members.filter(m => m.id === currentUser.id);
        default:
            return [];
    }
};
