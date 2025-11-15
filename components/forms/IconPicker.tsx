


import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface IconPickerProps {
    icons: string[];
    selectedIcon: string;
    onSelectIcon: (icon: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ icons, selectedIcon, onSelectIcon }) => {
    const { themeConfig } = useTheme();
    return (
        <div className="grid grid-cols-7 gap-3">
            {icons.map((iconPath, index) => (
                <button
                    key={index}
                    onClick={() => onSelectIcon(iconPath)}
                    aria-label={`Select icon ${index + 1}`}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white ${
                        selectedIcon === iconPath ? 'bg-accent' : 'bg-black/20'
                    }`}
                >
                    <svg className={`w-6 h-6 transition-colors duration-200 ${selectedIcon === iconPath ? 'text-white' : themeConfig.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                    </svg>
                </button>
            ))}
        </div>
    );
};

export default IconPicker;