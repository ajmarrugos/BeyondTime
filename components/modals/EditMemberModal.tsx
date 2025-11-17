import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { timezones } from '../../config/timezones';
import { useToast } from '../../contexts/ToastContext';
import { Member } from '../../types';
import { vibrate } from '../../utils/haptics';
import { useMembers } from '../../contexts/MembersContext';

interface EditMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: Member | null;
}

const getDefaultTimezone = () => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
        return 'UTC';
    }
};

const EditMemberModal: React.FC<EditMemberModalProps> = ({ isOpen, onClose, member }) => {
    const { themeConfig } = useTheme();
    const { teams, updateMember } = useMembers();
    const { addToast } = useToast();
    const modalRef = useFocusTrap(isOpen);

    const [name, setName] = useState('');
    const [teamId, setTeamId] = useState<number | undefined>(undefined);
    const [phone, setPhone] = useState('');
    const [timezone, setTimezone] = useState(getDefaultTimezone());

    useEffect(() => {
        if (isOpen && member) {
            setName(member.name);
            setTeamId(member.teamId);
            setPhone(member.phone || '');
            setTimezone(member.timezone || getDefaultTimezone());
        }
    }, [isOpen, member]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!member) return;
        if (!name.trim()) {
            addToast('Member name cannot be empty.', 'warning');
            return;
        }
        updateMember(member.id, { name, teamId, phone, timezone });
        addToast(`${name} updated successfully.`, 'success');
        vibrate();
        onClose();
    };

    if (!member) return null;

    const inputBaseStyle = `w-full p-3.5 rounded-xl bg-black/20 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 border-2 border-transparent focus:border-accent`;

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} 
            aria-modal="true" role="dialog"
        >
            <div 
                ref={modalRef as React.RefObject<HTMLDivElement>} 
                className={`w-full max-w-md p-6 rounded-3xl shadow-2xl border border-white/10 flex flex-col ${themeConfig.cardBg} transition-transform duration-300 ease-in-out ${isOpen ? 'scale-100' : 'scale-95'}`}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-2xl font-bold ${themeConfig.textColor}`}>Edit {member.name}</h2>
                    <button onClick={onClose} aria-label="Close" className={`p-2 rounded-full hover:bg-white/10 transition-colors ${themeConfig.textColor}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="edit-member-name" className={`block mb-1 font-medium ${themeConfig.textColor}`}>Name</label>
                        <input id="edit-member-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name..." className={inputBaseStyle} required />
                    </div>
                     <div className="relative">
                        <label htmlFor="edit-member-team" className={`block mb-1 font-medium ${themeConfig.textColor}`}>Team</label>
                        <select id="edit-member-team" value={teamId ?? 'unassigned'} onChange={(e) => setTeamId(e.target.value === 'unassigned' ? undefined : Number(e.target.value))} className={`${inputBaseStyle} appearance-none`}>
                            <option value="unassigned">Unassigned</option>
                            {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                        <div className={`pointer-events-none absolute bottom-3 right-0 flex items-center px-3 ${themeConfig.textColor}`}><svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                    </div>
                     <div>
                        <label htmlFor="edit-member-phone" className={`block mb-1 font-medium ${themeConfig.textColor}`}>Phone (Optional)</label>
                        <input id="edit-member-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1-555-0100" className={inputBaseStyle} />
                    </div>
                    <div className="relative">
                        <label htmlFor="edit-member-timezone" className={`block mb-1 font-medium ${themeConfig.textColor}`}>Timezone</label>
                        <select id="edit-member-timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} className={`${inputBaseStyle} appearance-none`}>
                            {timezones.map(group => (<optgroup key={group.group} label={group.group}>{group.zones.map(zone => (<option key={zone.value} value={zone.value}>{zone.name}</option>))}</optgroup>))}
                        </select>
                        <div className={`pointer-events-none absolute bottom-3 right-0 flex items-center px-3 ${themeConfig.textColor}`}><svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 ${themeConfig.textColor} bg-white/5 hover:bg-white/10`}>Cancel</button>
                        <button type="submit" className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-accent hover:shadow-lg hover:shadow-accent/30 transition-all">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMemberModal;