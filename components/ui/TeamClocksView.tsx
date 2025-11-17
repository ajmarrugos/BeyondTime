import React, { useMemo } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Member, Routine, Team } from '../../types';
import ExpandableSection from './ExpandableSection';
import MiniClock from './MiniClock';
import { useAuth } from '../../contexts/AuthContext';

interface TeamClocksViewProps {
    members: Member[];
    teams: Team[];
    allRoutines: Routine[];
    time: Date;
    onEditMember: (member: Member) => void;
    onDeleteMember: (member: Member) => void;
    onAddItemForMember: (memberId: number) => void;
}

const TeamClocksView: React.FC<TeamClocksViewProps> = ({ members, teams, allRoutines, time, onEditMember, onDeleteMember, onAddItemForMember }) => {
    const { currentUser } = useAuth();
    const { getManageableMembers } = usePermissions();

    if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Owner') {
        return null;
    }

    const manageableMembers = useMemo(() => {
        return getManageableMembers().filter(m => m.id !== currentUser.id);
    }, [getManageableMembers, currentUser]);

    const { membersByTeam, unassignedMembers } = useMemo(() => {
        const byTeam: Record<number, Member[]> = {};
        const unassigned: Member[] = [];
        
        teams.forEach(t => { byTeam[t.id] = []; });

        manageableMembers.forEach(member => {
            if (member.teamId && byTeam[member.teamId]) {
                byTeam[member.teamId].push(member);
            } else {
                unassigned.push(member);
            }
        });

        return { membersByTeam: byTeam, unassignedMembers: unassigned };
    }, [manageableMembers, teams]);

    return (
        <div className="w-full max-w-5xl mx-auto mt-6 space-y-3 pb-4">
            {teams.map(team => {
                const teamMembers = membersByTeam[team.id];
                if (!teamMembers || teamMembers.length === 0) return null;

                return (
                    <ExpandableSection key={team.id} title={`${team.name} Team`} defaultOpen={true}>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-y-4 gap-x-2">
                            {teamMembers.map(member => (
                                <MiniClock 
                                    key={member.id} 
                                    member={member} 
                                    routines={allRoutines.filter(r => r.memberId === member.id)}
                                    time={time}
                                    onEdit={() => onEditMember(member)}
                                    onDelete={() => onDeleteMember(member)}
                                    onAdd={() => onAddItemForMember(member.id)}
                                />
                            ))}
                        </div>
                    </ExpandableSection>
                );
            })}
            
            {unassignedMembers.length > 0 && (
                 <ExpandableSection title="Unassigned Members" defaultOpen={true}>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-y-4 gap-x-2">
                        {unassignedMembers.map(member => (
                             <MiniClock 
                                key={member.id} 
                                member={member} 
                                routines={allRoutines.filter(r => r.memberId === member.id)}
                                time={time} 
                                onEdit={() => onEditMember(member)}
                                onDelete={() => onDeleteMember(member)}
                                onAdd={() => onAddItemForMember(member.id)}
                            />
                        ))}
                    </div>
                </ExpandableSection>
            )}
        </div>
    );
};

export default TeamClocksView;