
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ViewHeaderProps {
    title: string;
    actionButton?: {
        label: string;
        onClick: () => void;
        disabled?: boolean;
    };
}

const ViewHeader: React.FC<ViewHeaderProps> = ({ title, actionButton }) => {
    const { themeConfig } = useTheme();
    return (
        <header className="flex-shrink-0 flex items-center justify-between py-4">
            <h1 className={`text-2xl font-bold ${themeConfig.textColor}`}>{title}</h1>
            {actionButton && (
                <button
                    onClick={actionButton.onClick}
                    disabled={actionButton.disabled}
                    aria-label={`${actionButton.label} ${title}`}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 bg-accent text-white hover:shadow-lg hover:shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {actionButton.label}
                </button>
            )}
        </header>
    );
};

export default ViewHeader;
