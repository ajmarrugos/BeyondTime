import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMembers } from '../../contexts/MembersContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { timezones } from '../../config/timezones';
import ExpandableSection from '../ui/ExpandableSection';
import ToggleSwitch from '../forms/ToggleSwitch';
import { useModal } from '../../contexts/ModalContext';

const AccountSettingsView: React.FC = () => {
    const { currentUser } = useAuth();
    const { teams, updateMember, changePassword } = useMembers();
    const { addToast } = useToast();
    const { confirm } = useModal();
    const { 
        themeConfig,
        currentTheme, accentColor, clockLayout, clockEffects, startOfWeek, animationSpeed,
        handleThemeChange, handleAccentColorChange, handleClockLayoutChange, 
        setClockEffects, handleStartOfWeekChange, handleAnimationSpeedChange
    } = useTheme();

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

    const handleSaveSettings = () => {
        const personalization = {
            theme: currentTheme,
            accentColor,
            clockLayout,
            clockEffects,
            startOfWeek,
            animationSpeed,
        };
        updateMember(currentUser.id, { personalization });
        addToast('Personalization settings saved to your account.', 'success');
    };

    const handleLoadSettings = () => {
        if (currentUser.personalization) {
            const p = currentUser.personalization;
            handleThemeChange(p.theme);
            handleAccentColorChange(p.accentColor);
            handleClockLayoutChange(p.clockLayout);
            setClockEffects(p.clockEffects);
            handleStartOfWeekChange(p.startOfWeek);
            handleAnimationSpeedChange(p.animationSpeed);
            addToast('Saved settings have been loaded.', 'success');
        } else {
            addToast('No saved settings found for your account.', 'info');
        }
    };

    const handleRemoveSettings = () => {
        confirm({
            title: 'Remove Saved Settings',
            message: 'This will remove your synced personalization from your account. Your local settings will not be affected.',
            onConfirm: () => {
                updateMember(currentUser.id, { personalization: undefined });
                addToast('Saved settings removed from account.', 'success');
            },
            confirmText: 'Remove',
        });
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
            
            <ExpandableSection title="Sync Personalization">
                <p className={`text-sm mb-3 ${themeConfig.subtextColor}`}>
                    Save your current appearance and layout settings to your account to use them on any device.
                </p>
                <div className="space-y-2">
                    <button onClick={handleSaveSettings} className="w-full p-3 rounded-xl font-semibold bg-white/5 hover:bg-white/10 transition-colors">Save Current Settings</button>
                    <button onClick={handleLoadSettings} disabled={!currentUser.personalization} className="w-full p-3 rounded-xl font-semibold bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Load Saved Settings</button>
                    <button onClick={handleRemoveSettings} disabled={!currentUser.personalization} className="w-full p-3 rounded-xl font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Remove Saved Settings</button>
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