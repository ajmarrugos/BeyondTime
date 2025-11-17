import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useModal } from '../../contexts/ModalContext';
import { vibrate } from '../../utils/haptics';

const ManagementActions: React.FC = () => {
    const { themeConfig } = useTheme();
    const { openAddMemberModal, openTeamSettingsModal } = useModal();

    const handleAddMember = () => {
        openAddMemberModal();
        vibrate();
    };

    const handleManageTeams = () => {
        openTeamSettingsModal();
        vibrate();
    };

    return (
        <div className="mt-4 w-full max-w-sm flex justify-center space-x-2" data-no-swipe="true">
            <button
                onClick={handleAddMember}
                className={`flex-1 px-4 py-3 text-sm font-semibold ${themeConfig.textColor} rounded-xl bg-black/20 border border-white/10 hover:bg-white/10 transition-colors`}
            >
                Add Member
            </button>
            <button
                onClick={handleManageTeams}
                className={`flex-1 px-4 py-3 text-sm font-semibold ${themeConfig.textColor} rounded-xl bg-black/20 border border-white/10 hover:bg-white/10 transition-colors`}
            >
                Manage Teams
            </button>
        </div>
    );
};

export default ManagementActions;
