import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ExpandableSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({ title, children, defaultOpen = false }) => {
    const { themeConfig } = useTheme();
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`rounded-2xl bg-black/20 backdrop-blur-sm border border-white/5 overflow-hidden`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left"
                aria-expanded={isOpen}
            >
                <h3 className={`text-lg font-semibold ${themeConfig.textColor}`}>{title}</h3>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${themeConfig.textColor}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}
            >
                <div className="p-4 pt-0">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ExpandableSection;
