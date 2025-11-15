import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface SectionHeaderProps {
    title: string;
    description: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description }) => {
    const { themeConfig } = useTheme();
    return (
        <div>
            <h3 className={`text-lg font-semibold ${themeConfig.textColor}`}>{title}</h3>
            <p className={`text-sm ${themeConfig.subtextColor}`}>{description}</p>
        </div>
    );
};

export default SectionHeader;