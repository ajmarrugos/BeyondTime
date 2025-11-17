import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMembers } from '../../contexts/MembersContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { timezones } from '../../config/timezones';
import ExpandableSection from '../ui/ExpandableSection';
import ToggleSwitch from '../forms/ToggleSwitch';

const AccountSettingsView: React.FC = () => {
    const { currentUser } = useAuth();
    const { teams, updateMember, changePassword } = useMembers();
    const { themeConfig } = useTheme();
    const { addToast } = useToast();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [timezone, setTimezone] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setPhone(currentUser.phone || '');
            setTimezone(currentUser.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
    }, [currentUser]);

    if (!currentUser) return null;
    
    const team = teams.find(t => t.id === currentUser.teamId);

    const handleProfileUpdate = () => {
        if (name.trim() === '') {
            addToast('Name cannot be empty.', 'error');
            return;
        }
        updateMember(currentUser.id, { name, phone, timezone });
        addToast('Profile updated successfully.', 'success');
    };

    const handlePasswordChange = () => {
        if (newPassword !== confirmPassword) {
            addToast('New passwords do not match.', 'error');
            return;
        }
        const success = changePassword(currentUser.id, currentPassword, newPassword);
        if (success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    const handleShareDataToggle = (enabled: boolean) => {
        updateMember(currentUser.id, { shareData: enabled });
        addToast(`Schedule sharing ${enabled ? 'enabled' : 'disabled'}.`, 'info');
    };
    
    const inputBaseStyle = `w-full p-3 rounded-xl bg-black/10 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent`;

    return (
        <div className="overflow-y-auto h-full space-y-4">
            <div className="flex items-center space-x-4 p-2">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-bold">
                    {currentUser.name.charAt(0)}
                </div>
                <div>
                    <h3 className={`text-xl font-bold ${themeConfig.textColor}`}>{currentUser.name}</h3>
                    <p className={`${themeConfig.subtextColor}`}>{currentUser.role}{team ? ` • ${team.name}` : ''}</p>
                </div>
            </div>

            <ExpandableSection title="Profile Information" defaultOpen>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="account-name" className={`block mb-1 text-sm font-medium ${themeConfig.textColor}`}>Name</label>
                        <input id="account-name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputBaseStyle} />
                    </div>
                    <div>
                        <label htmlFor="account-phone" className={`block mb-1 text-sm font-medium ${themeConfig.textColor}`}>Phone</label>
                        <input id="account-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputBaseStyle} />
                    </div>
                    <div className="relative">
                        <label htmlFor="account-timezone" className={`block mb-1 text-sm font-medium ${themeConfig.textColor}`}>Timezone</label>
                        <select id="account-timezone" value={timezone} onChange={e => setTimezone(e.target.value)} className={`${inputBaseStyle} appearance-none pr-8`}>
                            {timezones.map(group => <optgroup key={group.group} label={group.group}>{group.zones.map(zone => <option key={zone.value} value={zone.value}>{zone.name}</option>)}</optgroup>)}
                        </select>
                         <div className={`pointer-events-none absolute bottom-3 right-0 flex items-center px-3 ${themeConfig.textColor}`}><svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                    </div>
                    <button onClick={handleProfileUpdate} className="w-full p-3 rounded-xl font-semibold bg-white/5 hover:bg-white/10 transition-colors">Update Profile</button>
                </div>
            </ExpandableSection>
            
            <ExpandableSection title="Change Password">
                <div className="space-y-4">
                    <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputBaseStyle} />
                    <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputBaseStyle} />
                    <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputBaseStyle} />
                    <button onClick={handlePasswordChange} className="w-full p-3 rounded-xl font-semibold bg-white/5 hover:bg-white/10 transition-colors">Change Password</button>
                </div>
            </ExpandableSection>

            {currentUser.role === 'Member' && (
                <ExpandableSection title="Privacy">
                    <ToggleSwitch
                        label="Share schedule with Admins/Owners"
                        enabled={currentUser.shareData ?? true}
                        setEnabled={handleShareDataToggle}
                    />
                    <p className={`text-xs mt-2 ${themeConfig.subtextColor}`}>
                        If disabled, your routines and events will not be visible to administrators or team owners in any view.
                    </p>
                </ExpandableSection>
            )}
        </div>
    );
};

export default AccountSettingsView;