import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useModal } from '../../contexts/ModalContext';
import { Team } from '../../types';
import { vibrate } from '../../utils/haptics';

interface TeamSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TeamSettingsModal: React.FC<TeamSettingsModalProps> = ({ isOpen, onClose }) => {
    const { themeConfig } = useTheme();
    const { teams, addTeam, updateTeam, deleteTeam } = useAppData();
    const { confirm } = useModal();
    const modalRef = useFocusTrap(isOpen);

    const [newTeamName, setNewTeamName] = useState('');
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    
    const handleAddTeamClick = (e: React.FormEvent) => {
        e.preventDefault();
        addTeam(newTeamName);
        setNewTeamName('');
    };

    const handleUpdateTeamClick = () => {
        if (editingTeam && editingTeam.name.trim()) {
            updateTeam(editingTeam.id, { name: editingTeam.name });
            setEditingTeam(null);
        }
    };
    
    const handleDeleteTeamClick = (team: Team) => {
        confirm({
            title: 'Delete Team',
            message: `Are you sure you want to delete the team "${team.name}"? All members will be unassigned. This action cannot be undone.`,
            onConfirm: () => deleteTeam(team.id),
            confirmText: 'Delete',
        });
    };

    const handleClose = () => {
        onClose();
        vibrate();
    };

    const inputBaseStyle = `w-full p-3 rounded-xl bg-black/10 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent`;

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
                    <h2 className={`text-2xl font-bold ${themeConfig.textColor}`}>Manage Teams</h2>
                    <button onClick={onClose} aria-label="Close" className={`p-2 rounded-full hover:bg-white/10 transition-colors ${themeConfig.textColor}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <form onSubmit={handleAddTeamClick} className="flex space-x-2 mb-4">
                    <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="New team name..." className={`${inputBaseStyle} flex-grow min-w-0`} />
                    <button type="submit" disabled={!newTeamName.trim()} className={`flex-shrink-0 px-4 rounded-xl font-semibold ${themeConfig.textColor} bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>Create</button>
                </form>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 -mr-2">
                    {teams.map(team => (
                        editingTeam?.id === team.id ? (
                            <div key={team.id} className="flex items-center space-x-2 p-2 rounded-lg bg-black/20">
                                <input type="text" value={editingTeam.name} onChange={(e) => setEditingTeam({...editingTeam, name: e.target.value})} className={`flex-grow bg-transparent focus:outline-none ${themeConfig.textColor} p-1 rounded-md ring-1 ring-accent`} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleUpdateTeamClick()} />
                                <button onClick={handleUpdateTeamClick} className={`p-1.5 rounded-full hover:bg-white/5 ${themeConfig.textColor}`} aria-label="Save changes"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button>
                                <button onClick={() => setEditingTeam(null)} className={`p-1.5 rounded-full hover:bg-white/5 ${themeConfig.textColor}`} aria-label="Cancel edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                        ) : (
                            <div key={team.id} className="flex items-center justify-between p-2 rounded-lg bg-black/10">
                                <span className={`font-medium ${themeConfig.textColor}`}>{team.name}</span>
                                <div className="flex items-center space-x-1">
                                    <button onClick={() => setEditingTeam(team)} className={`p-1.5 rounded-full hover:bg-white/5 ${themeConfig.textColor}`} aria-label={`Edit ${team.name} team name`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button>
                                    <button onClick={() => handleDeleteTeamClick(team)} className={`p-1.5 rounded-full hover:bg-white/5 ${themeConfig.textColor}`} aria-label={`Delete ${team.name} team`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </div>
                            </div>
                        )
                    ))}
                </div>
                <div className="flex justify-end pt-4 mt-2 border-t border-white/10">
                    <button onClick={handleClose} className={`px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-accent hover:shadow-lg hover:shadow-accent/30 transition-all`}>Done</button>
                </div>
            </div>
        </div>
    );
};

export default TeamSettingsModal;
