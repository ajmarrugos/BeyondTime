import React, { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Member, Role, Team } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useAppData } from '../../contexts/AppDataContext';
import ExpandableSection from '../ui/ExpandableSection';
import { useModal } from '../../contexts/ModalContext';
import { timezones } from '../../config/timezones';
import Flag from '../ui/Flag';
import { timezoneToCountry } from '../../utils/timezoneToCountry';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const getDefaultTimezone = () => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
        return 'UTC';
    }
};

interface TeamManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}


const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ isOpen, onClose }) => {
    const { themeConfig } = useTheme();
    const { members, teams, addMember, updateMember, deleteMemberAndRoutines, addTeam, updateTeam, deleteTeam } = useAppData();
    const { getManageableMembers } = usePermissions();
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { confirm } = useModal();
    const modalRef = useFocusTrap(isOpen);
    
    const manageableMembers = getManageableMembers();
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberPhone, setNewMemberPhone] = useState('');
    const [newMemberTimezone, setNewMemberTimezone] = useState(getDefaultTimezone());
    const [newMemberTeamId, setNewMemberTeamId] = useState<number | undefined>(undefined);
    const [newTeamName, setNewTeamName] = useState('');
    
    const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState({ name: '', phone: '', timezone: '' });
    
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<number, boolean>>({});
    
    const canManageTeams = currentUser?.role === 'Owner' || currentUser?.role === 'Admin';

    const { membersByTeam, unassignedMembers } = useMemo(() => {
        const byTeam: Record<number, Member[]> = {};
        const unassigned: Member[] = [];
        teams.forEach(t => byTeam[t.id] = []);

        manageableMembers.forEach(member => {
            if (member.teamId && byTeam[member.teamId]) {
                byTeam[member.teamId].push(member);
            } else {
                unassigned.push(member);
            }
        });
        return { membersByTeam: byTeam, unassignedMembers: unassigned };
    }, [manageableMembers, teams]);
    
    const handleAddMemberClick = () => {
        addMember({ name: newMemberName, phone: newMemberPhone, timezone: newMemberTimezone, teamId: newMemberTeamId });
        setNewMemberName('');
        setNewMemberPhone('');
        setNewMemberTimezone(getDefaultTimezone());
        setNewMemberTeamId(undefined);
    };
    
    const handleAddTeamClick = () => {
        addTeam(newTeamName);
        setNewTeamName('');
    };

    const handleUpdateTeamClick = () => {
        if (editingTeam) {
            updateTeam(editingTeam.id, { name: editingTeam.name });
            setEditingTeam(null);
        }
    };
    
    const handleDeleteTeamClick = (team: Team) => {
        confirm({
            title: 'Delete Team',
            message: `Are you sure you want to delete the team "${team.name}"? All members will be unassigned. This cannot be undone.`,
            onConfirm: () => deleteTeam(team.id),
            confirmText: 'Delete',
        });
    };

    const handleStartEditMember = (member: Member) => {
        setEditingMemberId(member.id);
        setEditFormData({
            name: member.name,
            phone: member.phone || '',
            timezone: member.timezone || getDefaultTimezone(),
        });
    };
    
    const handleCancelEdit = () => {
        setEditingMemberId(null);
    };

    const handleUpdateMemberClick = () => {
        if (editingMemberId) {
            updateMember(editingMemberId, {
                name: editFormData.name,
                phone: editFormData.phone,
                timezone: editFormData.timezone,
            });
            setEditingMemberId(null);
            addToast("Member updated successfully.", 'success');
        }
    };
    
    const handleMemberTeamChange = (memberId: number, newTeamIdStr: string) => {
        const teamId = newTeamIdStr === 'unassigned' ? undefined : Number(newTeamIdStr);
        updateMember(memberId, { teamId });
    };

    const handleRoleChangeRequest = async (member: Member, newRole: Role) => {
        if (currentUser?.id === member.id || member.role === newRole) return;
        setPendingRoleChanges(prev => ({ ...prev, [member.id]: true }));
        updateMember(member.id, { role: newRole });
        addToast(`Role for ${member.name} updated to ${newRole}.`, 'success');
        setPendingRoleChanges(prev => {
            const newState = { ...prev };
            delete newState[member.id];
            return newState;
        });
    };

    const roles: Role[] = ['Admin', 'Owner', 'Member'];
    const inputBase = `p-3 rounded-xl bg-black/10 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent`;
    
    const MemberRow: React.FC<{ member: Member }> = ({ member }) => {
        const isEditing = editingMemberId === member.id;
        const isPending = !!pendingRoleChanges[member.id];
        const selectStyle = `w-full sm:w-auto appearance-none text-sm py-1 pl-2 pr-7 rounded-md bg-white/5 ${themeConfig.textColor} border border-transparent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed`;
        const countryCode = member.timezone ? timezoneToCountry(member.timezone) : null;
        
        if (isEditing) {
            return (
                 <li className="p-3 rounded-lg bg-black/20 space-y-3">
                     <input type="text" value={editFormData.name} onChange={(e) => setEditFormData(f => ({ ...f, name: e.target.value }))} placeholder="Name" className={`${inputBase} w-full`} autoFocus />
                     <div className="flex space-x-2">
                        <input type="tel" value={editFormData.phone} onChange={(e) => setEditFormData(f => ({ ...f, phone: e.target.value }))} placeholder="Phone (e.g., +1-555-1234)" className={`${inputBase} flex-grow`} />
                        <div className="relative flex-grow">
                             <select value={editFormData.timezone} onChange={(e) => setEditFormData(f => ({ ...f, timezone: e.target.value }))} className={`${inputBase} w-full appearance-none pr-8`}>
                                {timezones.map(group => (<optgroup key={group.group} label={group.group}>{group.zones.map(zone => (<option key={zone.value} value={zone.value}>{zone.name}</option>))}</optgroup>))}
                            </select>
                            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${themeConfig.textColor}`}><svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                        </div>
                     </div>
                     <div className="flex justify-end space-x-2">
                        <button onClick={handleCancelEdit} className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/5 hover:bg-white/10">Cancel</button>
                        <button onClick={handleUpdateMemberClick} className="px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-white hover:shadow-lg">Save</button>
                     </div>
                </li>
            )
        }

        return (
             <li className="flex flex-wrap items-center justify-between p-2 rounded-lg bg-black/10 gap-2">
                <div className="flex-grow min-w-0">
                    <p className={`font-medium truncate ${themeConfig.textColor}`}>{member.name}</p>
                    <p className={`text-xs truncate ${themeConfig.subtextColor} flex items-center space-x-1.5`}>
                        {member.phone && <span>{member.phone} &middot;</span>}
                        {countryCode && <Flag countryCode={countryCode} />}
                        <span>{member.timezone || 'No Timezone'}</span>
                    </p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    {canManageTeams && (
                        <div className="relative">
                            <select value={member.teamId ?? 'unassigned'} onChange={(e) => handleMemberTeamChange(member.id, e.target.value)} className={selectStyle}>
                                <option value="unassigned">Unassigned</option>
                                {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                            </select>
                             <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 ${themeConfig.textColor}`}><svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                        </div>
                    )}
                    <div className="relative">
                        <select value={member.role} onChange={(e) => handleRoleChangeRequest(member, e.target.value as Role)} disabled={currentUser?.id === member.id || isPending} className={selectStyle}>
                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 ${themeConfig.textColor}`}><svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                    </div>
                    <button onClick={() => handleStartEditMember(member)} className={`p-1.5 rounded-full hover:bg-white/5 ${themeConfig.textColor}`} aria-label={`Edit ${member.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button>
                    <button onClick={() => deleteMemberAndRoutines(member.id)} className={`p-1.5 rounded-full hover:bg-white/5 ${themeConfig.textColor}`} aria-label={`Delete ${member.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
            </li>
        );
    };

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} 
            aria-modal="true" role="dialog"
        >
            <div 
                ref={modalRef as React.RefObject<HTMLDivElement>} 
                className={`flex flex-col w-full h-full overflow-hidden ${themeConfig.background} md:max-w-xl lg:max-w-2xl md:h-auto md:max-h-[90vh] md:rounded-3xl md:shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'scale-100' : 'scale-95'}`}
            >
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className={`text-xl font-bold ${themeConfig.textColor} ml-4`}>Team & Member Management</h2>
                    <button onClick={onClose} aria-label="Close" className={`p-2 rounded-full hover:bg-white/10 transition-colors ${themeConfig.textColor}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <div className="overflow-y-auto h-full p-6 space-y-4">
                    <div className={`p-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/5 space-y-4`}>
                        {canManageTeams && (
                            <div>
                                <h3 className={`text-lg font-semibold mb-2 ${themeConfig.textColor}`}>Create New Team</h3>
                                <div className="flex space-x-2">
                                    <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTeamClick()} placeholder="New team name..." className={`${inputBase} flex-grow min-w-0`} />
                                    <button onClick={handleAddTeamClick} disabled={!newTeamName} className={`flex-shrink-0 px-4 rounded-xl font-semibold ${themeConfig.textColor} bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>Create</button>
                                </div>
                            </div>
                        )}
                        <div>
                            <h3 className={`text-lg font-semibold mb-2 ${themeConfig.textColor}`}>Add New Member</h3>
                            <div className="space-y-2">
                                <input type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="New member name..." className={`${inputBase} w-full`} />
                                <div className="relative">
                                    <select value={newMemberTeamId ?? 'unassigned'} onChange={(e) => setNewMemberTeamId(e.target.value === 'unassigned' ? undefined : Number(e.target.value))} className={`${inputBase} w-full appearance-none pr-8`}>
                                        <option value="unassigned">Unassigned</option>
                                        {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                                    </select>
                                    <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${themeConfig.textColor}`}><svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                                </div>
                                <div className="flex space-x-2">
                                    <input type="tel" value={newMemberPhone} onChange={(e) => setNewMemberPhone(e.target.value)} placeholder="Phone (optional)" className={`${inputBase} flex-grow`} />
                                    <div className="relative flex-grow">
                                        <select value={newMemberTimezone} onChange={(e) => setNewMemberTimezone(e.target.value)} className={`${inputBase} w-full appearance-none pr-8`}>
                                            {timezones.map(group => (<optgroup key={group.group} label={group.group}>{group.zones.map(zone => (<option key={zone.value} value={zone.value}>{zone.name}</option>))}</optgroup>))}
                                        </select>
                                        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${themeConfig.textColor}`}><svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                                    </div>
                                </div>
                                <button onClick={handleAddMemberClick} disabled={!newMemberName} className={`w-full px-4 py-3 rounded-xl font-semibold ${themeConfig.textColor} bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>Add Member</button>
                            </div>
                        </div>
                    </div>

                    {canManageTeams && teams.map(team => (
                        <ExpandableSection key={team.id} title={editingTeam?.id === team.id ? '' : `${team.name} (${membersByTeam[team.id]?.length || 0})`} defaultOpen={true}
                            headerContent={
                                editingTeam?.id === team.id ? (
                                    <div className="flex-grow flex items-center space-x-2">
                                        <input type="text" value={editingTeam.name} onChange={(e) => setEditingTeam({...editingTeam, name: e.target.value})} className={`flex-grow bg-transparent focus:outline-none ${themeConfig.textColor} p-1 rounded-md ring-1 ring-accent`} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleUpdateTeamClick()} />
                                        <button onClick={handleUpdateTeamClick} className={`p-1 rounded-full hover:bg-white/5 ${themeConfig.textColor}`} aria-label="Save changes"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg></button>
                                        <button onClick={() => setEditingTeam(null)} className={`p-1 rounded-full hover:bg-white/5 ${themeConfig.textColor}`} aria-label="Cancel edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <button onClick={() => setEditingTeam(team)} className={`p-1.5 rounded-full hover:bg-white/5 ${themeConfig.textColor}`} aria-label={`Edit ${team.name} team name`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button>
                                        <button onClick={() => handleDeleteTeamClick(team)} className={`p-1.5 rounded-full hover:bg-white/5 ${themeConfig.textColor}`} aria-label={`Delete ${team.name} team`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                    </div>
                                )
                            }
                        >
                            <ul className="space-y-1">
                                {(membersByTeam[team.id] && membersByTeam[team.id].length > 0) ? 
                                    membersByTeam[team.id].map(member => <MemberRow key={member.id} member={member} />) : 
                                    <li><p className={`text-sm text-center py-2 ${themeConfig.subtextColor}`}>No manageable members in this team.</p></li>}
                            </ul>
                        </ExpandableSection>
                    ))}
                    
                    <ExpandableSection title={`Unassigned Members (${unassignedMembers.length})`} defaultOpen={unassignedMembers.length > 0}>
                        <ul className="space-y-1">
                            {unassignedMembers.length > 0 ? 
                                unassignedMembers.map(member => <MemberRow key={member.id} member={member} />) :
                                <li><p className={`text-sm text-center py-2 ${themeConfig.subtextColor}`}>All manageable members are in a team.</p></li>
                            }
                        </ul>
                    </ExpandableSection>
                </div>
            </div>
        </div>
    );
};

export default TeamManagementModal;
