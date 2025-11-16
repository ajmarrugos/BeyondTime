import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { usePermissionsContext } from '../contexts/PermissionsContext';
// Fix: Import PermissionName to correctly type the 'can' function parameter.
import { Routine, PermissionName } from '../types';
import { useMemo, useCallback } from 'react';
import {
    can as canSelector,
    getVisibleRoutinesSelector,
    getManageableMembersSelector,
    canManageRoutineSelector,
    getAssignableMembersSelector
} from '../utils/permissions';

export const usePermissions = () => {
    const { currentUser } = useAuth();
    const { members, routines } = useAppData();
    const { permissions } = usePermissionsContext();

    const userPermissions = useMemo(() => {
        return currentUser ? permissions[currentUser.role] || {} : {};
    }, [currentUser, permissions]);

    // Fix: Use the specific 'PermissionName' type for the permission parameter to ensure type safety.
    const can = useCallback((permission: PermissionName): boolean => {
        return canSelector(userPermissions, permission);
    }, [userPermissions]);

    const getVisibleRoutines = useCallback(() => {
        if (!currentUser) return [];
        return getVisibleRoutinesSelector(routines, members, currentUser, userPermissions);
    }, [routines, members, currentUser, userPermissions]);

    const getManageableMembers = useCallback(() => {
        if (!currentUser) return [];
        return getManageableMembersSelector(members, currentUser, userPermissions);
    }, [members, currentUser, userPermissions]);

    const getAssignableMembers = useCallback(() => {
        if (!currentUser) return [];
        return getAssignableMembersSelector(members, currentUser, userPermissions);
    }, [members, currentUser, userPermissions]);

    const canManageRoutine = useCallback((routine: Routine) => {
        if (!currentUser) return false;
        return canManageRoutineSelector(routine, members, currentUser, userPermissions);
    }, [members, currentUser, userPermissions]);

    return useMemo(() => ({
        canViewSettingsPanel: () => !!currentUser,
        canViewIntegrations: () => can('viewIntegrations'),
        canManagePermissions: () => can('managePermissions'),
        canManageMembers: () => can('manageMembers'),

        getVisibleRoutines,
        getManageableMembers,
        getAssignableMembers,
        canEditRoutine: canManageRoutine,
        canDeleteRoutine: canManageRoutine,
    }), [currentUser, can, getVisibleRoutines, getManageableMembers, getAssignableMembers, canManageRoutine]);
};