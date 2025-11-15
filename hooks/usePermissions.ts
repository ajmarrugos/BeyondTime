import { useAuth } from '../contexts/AuthContext';
import { useMemberContext } from '../contexts/MemberContext';
import { useRoutineContext } from '../contexts/RoutineContext';
import { usePermissionsContext } from '../contexts/PermissionsContext';
// Fix: Import PermissionName to correctly type the 'can' function parameter.
import { Routine, PermissionName } from '../types';
import { useMemo } from 'react';
import {
    can as canSelector,
    getVisibleRoutinesSelector,
    getManageableMembersSelector,
    canManageRoutineSelector
} from '../utils/permissions';

export const usePermissions = () => {
    const { currentUser } = useAuth();
    const { members } = useMemberContext();
    const { routines } = useRoutineContext();
    const { permissions } = usePermissionsContext();

    const userPermissions = useMemo(() => {
        return currentUser ? permissions[currentUser.role] || {} : {};
    }, [currentUser, permissions]);

    // Fix: Use the specific 'PermissionName' type for the permission parameter to ensure type safety.
    const can = (permission: PermissionName): boolean => {
        return canSelector(userPermissions, permission);
    };

    const getVisibleRoutines = () => {
        if (!currentUser) return [];
        return getVisibleRoutinesSelector(routines, members, currentUser, userPermissions);
    };

    const getManageableMembers = () => {
        if (!currentUser) return [];
        return getManageableMembersSelector(members, currentUser, userPermissions);
    };

    const canManageRoutine = (routine: Routine) => {
        if (!currentUser) return false;
        return canManageRoutineSelector(routine, members, currentUser, userPermissions);
    };

    return useMemo(() => ({
        canViewSettingsPanel: () => !!currentUser,
        canViewIntegrations: () => can('viewIntegrations'),
        canManagePermissions: () => can('managePermissions'),
        canManageMembers: () => can('manageMembers'),

        getVisibleRoutines,
        getManageableMembers,
        canEditRoutine: canManageRoutine,
        canDeleteRoutine: canManageRoutine,
    }), [userPermissions, currentUser, members, routines]);
};