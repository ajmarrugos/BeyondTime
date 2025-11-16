import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Member, Role } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useAppData } from '../../contexts/AppDataContext';
import ExpandableSection from '../ui/ExpandableSection';

// A simple spinner component or SVG to be used inline
const Spinner: React.FC = () => (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const MemberManagementView: React.FC = () => {
    const { themeConfig } = useTheme();
    const { addMember, updateMember, deleteMemberAndRoutines } = useAppData();
    const { getManageableMembers } = usePermissions();
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    
    const manageableMembers = getManageableMembers();
    const [newMemberName, setNewMemberName] = useState('');
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<number, boolean>>({});

    const handleAddMemberClick = () => {
        addMember(newMemberName);
        setNewMemberName('');
    };

    const handleUpdateMemberClick = () => {
        if (editingMember) {
            updateMember(editingMember.id, { name: editingMember.name });
            setEditingMember(null);
        }
    };

    const handleRoleChangeRequest = async (member: Member, newRole: Role) => {
        if (currentUser?.id === member.id || member.role === newRole) {
            return;
        }

        const originalRole = member.role;
        setPendingRoleChanges(prev => ({ ...prev, [member.id]: true }));

        // Optimistic UI Update
        updateMember(member.id, { role: newRole });
        addToast(`Updating role for ${member.name} to ${newRole}...`, 'info');

        try {
            // Simulate API call to webhook/n8n for validation
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Simulate a potential rejection from the validation service (20% chance of failure)
            if (Math.random() > 0.8) {
                throw new Error('Validation denied by the data administrator.');
            }

            addToast(`Role for ${member.name} successfully updated to ${newRole}.`, 'success');
        } catch (error) {
            // Revert UI on failure
            updateMember(member.id, { role: originalRole });
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            console.error("Role change validation failed:", errorMessage);
            addToast(`Role change for ${member.name} was rejected. Reverting.`, 'error');
        } finally {
            // Clear pending state regardless of outcome
            setPendingRoleChanges(prev => {
                const newState = { ...prev };
                delete newState[member.id];
                return newState;
            });
        }
    };

    const roles: Role[] = ['Admin', 'Owner', 'Member'];

    return (
        <div className="overflow-y-auto h-full space-y-4">
            <ExpandableSection title="Add New Member" defaultOpen={true}>
                <div className="flex space-x-2">
                    <input type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddMemberClick()} placeholder="New member name..." className={`flex-grow min-w-0 p-3 rounded-xl bg-black/10 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent`} />
                    <button onClick={handleAddMemberClick} disabled={!newMemberName} className={`flex-shrink-0 px-4 rounded-xl font-semibold ${themeConfig.textColor} bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>Add</button>
                </div>
            </ExpandableSection>
            
            <ExpandableSection title="Existing Members" defaultOpen={true}>
                {manageableMembers.length > 0 ? (
                    <ul className="space-y-2">
                        {manageableMembers.map(member => {
                            const isPending = !!pendingRoleChanges[member.id];
                            return (
                                <li key={member.id} className={`flex items-center p-3 rounded-xl bg-black/10`}>
                                    {editingMember?.id === member.id ? (
                                        <>
                                            <input type="text" value={editingMember.name} onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })} className={`flex-grow bg-transparent focus:outline-none ${themeConfig.textColor}`} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleUpdateMemberClick()} />
                                            <button onClick={handleUpdateMemberClick} className={`p-1 rounded-full hover:bg-white/5 ml-2 ${themeConfig.textColor}`} aria-label="Save changes"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg></button>
                                            <button onClick={() => setEditingMember(null)} className={`p-1 rounded-full hover:bg-white/5 ml-1 ${themeConfig.textColor}`} aria-label="Cancel edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                        </>
                                    ) : (
                                        <>
                                            <span className={`flex-grow ${themeConfig.textColor}`}>{member.name}</span>
                                            <div className="relative mx-2">
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChangeRequest(member, e.target.value as Role)}
                                                    disabled={currentUser?.id === member.id || isPending}
                                                    className={`appearance-none text-sm py-1 pl-2 pr-7 rounded-md bg-white/5 ${themeConfig.textColor} border border-transparent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    aria-label={`Role for ${member.name}`}
                                                >
                                                    {roles.map(role => <option key={role} value={role}>{role}</option>)}
                                                </select>
                                                <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 ${themeConfig.textColor}`}>
                                                    {isPending ? <Spinner /> : <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
                                                </div>
                                            </div>
                                            <button onClick={() => setEditingMember(member)} className={`p-1 rounded-full hover:bg-white/5 ml-2 ${themeConfig.textColor}`} aria-label={`Edit ${member.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button>
                                            <button onClick={() => deleteMemberAndRoutines(member.id)} className={`p-1 rounded-full hover:bg-white/5 ml-1 ${themeConfig.textColor}`} aria-label={`Delete ${member.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                        </>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                     <p className={`text-sm text-center py-4 ${themeConfig.subtextColor}`}>No other members to manage.</p>
                )}
            </ExpandableSection>
        </div>
    );
};

export default React.memo(MemberManagementView);