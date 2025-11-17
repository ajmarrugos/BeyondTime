
import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissionsContext } from '../../contexts/PermissionsContext';
import { permissionNames, PermissionScope, Role, PermissionName, PermissionsModel } from '../../types';
import ToggleSwitch from '../forms/ToggleSwitch';
import { useModal } from '../../contexts/ModalContext';
import { useToast } from '../../contexts/ToastContext';
import { initialPermissions } from '../../config/initialPermissions';
import ExpandableSection from '../ui/ExpandableSection';

// A simple spinner component or SVG to be used inline
const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const PermissionsView: React.FC = () => {
    const { themeConfig } = useTheme();
    const { currentUser } = useAuth();
    const { permissions, commitPermissionChanges, refreshPermissions: refreshPermissionsInContext } = usePermissionsContext();
    const { confirm } = useModal();
    const { addToast } = useToast();

    const [draftPermissions, setDraftPermissions] = useState<PermissionsModel>(permissions);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedRoles, setExpandedRoles] = useState<Record<Role, boolean>>({
        Admin: false,
        Owner: false,
        Member: false,
    });
    
    // State for temporary admin edit access
    const [isAdminEditEnabled, setIsAdminEditEnabled] = useState(false);
    const [adminEditTimeRemaining, setAdminEditTimeRemaining] = useState(0);
    const [isRequestingAdminEdit, setIsRequestingAdminEdit] = useState(false);

    // Sync local draft with context changes (e.g., after a save or refresh)
    useEffect(() => {
        setDraftPermissions(permissions);
    }, [permissions]);

    // Countdown timer effect for admin edit window
    useEffect(() => {
        // FIX: Use ReturnType<typeof setTimeout> for browser compatibility instead of NodeJS.Timeout.
        let timerId: ReturnType<typeof setTimeout>;
        if (isAdminEditEnabled && adminEditTimeRemaining > 0) {
            timerId = setTimeout(() => {
                setAdminEditTimeRemaining(adminEditTimeRemaining - 1);
            }, 1000);
        } else if (adminEditTimeRemaining === 0 && isAdminEditEnabled) {
            setIsAdminEditEnabled(false);
            addToast('Admin edit window has expired.', 'info');
        }
        return () => clearTimeout(timerId);
    }, [isAdminEditEnabled, adminEditTimeRemaining, addToast]);

    const isDirty = useMemo(() => {
        return JSON.stringify(draftPermissions) !== JSON.stringify(permissions);
    }, [draftPermissions, permissions]);
    
    const toggleRoleExpansion = (role: Role) => {
        setExpandedRoles(prev => ({ ...prev, [role]: !prev[role] }));
    };

    const handlePermissionChange = (role: Role, permission: PermissionName, scope: PermissionScope) => {
        setDraftPermissions(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [permission]: scope,
            },
        }));
    };

    const handleDiscard = () => {
        setDraftPermissions(permissions);
        addToast('Changes discarded.', 'info');
    };

    const handleSave = async () => {
        setIsSaving(true);
        addToast('Submitting permission changes for approval...', 'info');
        try {
            await commitPermissionChanges(draftPermissions);
            addToast('Permissions updated successfully!', 'success');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            addToast(`Failed to update permissions: ${errorMessage}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRefresh = () => {
        confirm({
            title: 'Reset Permissions',
            message: 'This will reset all role permissions to their default state. This action cannot be undone.',
            onConfirm: () => {
                refreshPermissionsInContext();
                setDraftPermissions(initialPermissions); // also reset local draft immediately
                addToast('Permissions have been reset to default.', 'success');
            },
            confirmText: 'Reset',
        });
    };
    
    const handleRequestAdminEdit = async () => {
        setIsRequestingAdminEdit(true);
        addToast('Requesting temporary admin access...', 'info');
        try {
            // This fetch simulates a call to an external webhook (like n8n) for approval
            const response = await fetch('http://localhost:5678/webhook/request-admin-edit-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: currentUser?.role }),
            });

            if (!response.ok) {
                // The n8n workflow returns a non-200 status for non-admin roles
                throw new Error('Access denied by administrator.');
            }

            setIsAdminEditEnabled(true);
            setAdminEditTimeRemaining(60);
            addToast('Admin edit access granted for 1 minute.', 'success');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            addToast(`Failed to get access: ${errorMessage}`, 'error');
        } finally {
            setIsRequestingAdminEdit(false);
        }
    };
    
    const scopedPermissions: PermissionName[] = ['manageMembers', 'manageRoutines', 'viewRoutines'];
    const scopeOptions: PermissionScope[] = ['None', 'Self', 'Team', 'All'];
    
    return (
        <div className="flex flex-col h-full">
            <fieldset disabled={isSaving} className="flex-1 overflow-y-auto space-y-4 pb-24">
                <ExpandableSection title="Role Permissions" defaultOpen={true}>
                    <p className={`text-sm mb-3 ${themeConfig.subtextColor}`}>Toggle permissions for each role.</p>
                    <p className={`text-xs italic p-2 rounded-lg bg-black/10 ${themeConfig.subtextColor} mb-3`}>
                        Note: The 'View Routines' and 'Manage Routines' permissions are subject to each member's individual "Share schedule" privacy setting.
                    </p>
                    <div className="space-y-4">
                        {(Object.keys(draftPermissions) as Role[]).map(role => {
                            const isRoleDisabled = (currentUser?.role === 'Admin' && role === 'Admin' && !isAdminEditEnabled);
                            const isExpanded = expandedRoles[role];
                            return (
                                <div key={role} className={`p-4 rounded-xl bg-black/10 transition-all duration-300 ${isRoleDisabled && !isExpanded ? 'opacity-75' : ''}`}>
                                    <div className="w-full flex items-center justify-between">
                                        <h4 className={`font-semibold text-lg capitalize ${themeConfig.textColor}`}>{role}</h4>
                                        <div className="flex items-center space-x-2">
                                            {currentUser?.role === 'Admin' && role === 'Admin' && (
                                                <>
                                                    {isAdminEditEnabled ? (
                                                        <div className="flex items-center space-x-2 text-sm font-mono px-3 py-1 rounded-full bg-accent/20 text-accent">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            <span>{String(Math.floor(adminEditTimeRemaining / 60)).padStart(2, '0')}:{String(adminEditTimeRemaining % 60).padStart(2, '0')}</span>
                                                        </div>
                                                    ) : (
                                                        <button onClick={handleRequestAdminEdit} disabled={isRequestingAdminEdit} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center space-x-1.5">
                                                            {isRequestingAdminEdit && <Spinner />}
                                                            <span>Request Edit Access</span>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            <button
                                                onClick={() => toggleRoleExpansion(role)}
                                                aria-expanded={isExpanded}
                                                aria-controls={`permissions-panel-${role}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {isRoleDisabled && !isExpanded && (
                                        <p className={`text-xs mt-1 ${themeConfig.subtextColor}`}>
                                            Editing Admin privileges requires temporary access.
                                        </p>
                                    )}
                                    
                                    <div
                                        id={`permissions-panel-${role}`}
                                        className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[30rem] mt-3 pt-3 border-t border-white/10' : 'max-h-0'}`}
                                    >
                                        {isRoleDisabled && (
                                            <p className={`text-xs mb-3 ${themeConfig.subtextColor}`}>
                                                Admin privileges are fixed. Use "Request Edit Access" to make changes.
                                            </p>
                                        )}
                                        <div className="space-y-3">
                                            {permissionNames.map(pName => {
                                                const currentScope = draftPermissions[role]?.[pName] ?? 'None';
                                                const isScoped = scopedPermissions.includes(pName);
                                                return (
                                                    <div key={pName} className="flex items-center justify-between">
                                                        <label className={`text-sm capitalize ${themeConfig.textColor}`}>{pName.replace(/([A-Z])/g, ' $1').trim()}</label>
                                                        {isScoped ? (
                                                            <div className="relative">
                                                                <select 
                                                                    value={currentScope} 
                                                                    onChange={(e) => handlePermissionChange(role, pName, e.target.value as PermissionScope)}
                                                                    className={`appearance-none text-sm py-1 pl-2 pr-7 rounded-md bg-white/5 ${themeConfig.textColor} border border-transparent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed`}
                                                                    disabled={isRoleDisabled || isSaving}
                                                                >
                                                                    {scopeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                                </select>
                                                                <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 ${themeConfig.textColor}`}>
                                                                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <ToggleSwitch 
                                                                label=""
                                                                enabled={currentScope !== 'None'}
                                                                setEnabled={(enabled) => handlePermissionChange(role, pName, enabled ? 'All' : 'None')}
                                                                disabled={isRoleDisabled || isSaving}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ExpandableSection>
                <ExpandableSection title="Manage Model">
                    <p className={`text-sm mb-3 ${themeConfig.subtextColor}`}>Refresh the permissions model to its default state.</p>
                    <button onClick={handleRefresh} className={`w-full p-3 rounded-xl font-semibold text-center ${themeConfig.textColor} bg-white/5 hover:bg-white/10 transition-colors`}>Refresh from Source</button>
                </ExpandableSection>
            </fieldset>
             {isDirty && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
                    <div className="flex justify-between items-center">
                        <p className={`text-sm ${themeConfig.textColor}`}>You have unsaved changes.</p>
                        <div className="flex space-x-2">
                            <button onClick={handleDiscard} disabled={isSaving} className={`px-4 py-2 rounded-lg text-sm font-semibold ${themeConfig.textColor} hover:bg-white/10 transition-colors disabled:opacity-50`}>
                                Discard
                            </button>
                            <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-accent hover:shadow-lg hover:shadow-accent/30 transition-shadow disabled:opacity-50 flex items-center space-x-2">
                                {isSaving && <Spinner />}
                                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(PermissionsView);