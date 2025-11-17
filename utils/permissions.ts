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

    const isVisible = (routine: Routine): boolean => {
        // Always show your own routines
        if (routine.memberId === currentUser.id) return true;
        
        // Find the owner of the routine
        const routineOwner = members.find(m => m.id === routine.memberId);
        
        // If owner not found, or they have disabled sharing, hide it.
        // Default to true if shareData is not set (for backward compatibility).
        if (!routineOwner || routineOwner.shareData === false) return false;
        
        return true;
    };

    switch (scope) {
        case 'All':
            return routines.filter(isVisible);
        case 'Team':
            const teamMemberIds = members
                .filter(m => m.teamId === currentUser.teamId)
                .map(m => m.id);
            return routines.filter(r => teamMemberIds.includes(r.memberId) && isVisible(r));
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

    // If you are the owner, you can always manage if scope is at least 'Self'
    if (routine.memberId === currentUser.id) {
        return scope === 'Self' || scope === 'Team' || scope === 'All';
    }

    // Find the owner of the routine
    const routineOwner = members.find(m => m.id === routine.memberId);

    // If you are not the owner, you cannot manage if the owner has disabled sharing.
    // Default to true if shareData is not set.
    if (!routineOwner || routineOwner.shareData === false) {
        return false;
    }

    // If sharing is enabled, proceed with original permission logic
    switch (scope) {
        case 'All':
            return true;
        case 'Team':
            return routineOwner?.teamId === currentUser.teamId;
        case 'Self':
            // This case is already handled above for the owner
            return false;
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