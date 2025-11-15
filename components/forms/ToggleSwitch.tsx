import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ToggleSwitchProps {
    label: string;
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
    disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, setEnabled, disabled = false }) => {
    const { themeConfig } = useTheme();
    return (
        <div className="flex items-center justify-between">
            <label className={`font-medium ${themeConfig.textColor} ${disabled ? 'opacity-50' : ''}`}>{label}</label>
            <button
                type="button"
                className={`${enabled ? 'bg-accent' : 'bg-black/20'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-accent ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && setEnabled(!enabled)}
                role="switch"
                aria-checked={enabled}
                disabled={disabled}
            >
                <span
                    className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                />
            </button>
        </div>
    );
};

export default ToggleSwitch;