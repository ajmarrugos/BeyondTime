
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ExpandableSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    headerContent?: React.ReactNode;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({ title, children, defaultOpen = false, headerContent }) => {
    const { themeConfig } = useTheme();
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`rounded-2xl bg-black/20 backdrop-blur-sm border border-white/5 overflow-hidden`}>
            <div className="w-full flex items-center justify-between p-4 text-left">
                <h3 className={`text-lg font-semibold ${themeConfig.textColor} flex-grow truncate pr-4`}>{title}</h3>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    {headerContent}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-expanded={isOpen}
                        className={`p-1 rounded-full hover:bg-white/10 ${themeConfig.textColor}`}
                        aria-label={isOpen ? "Collapse Section" : "Expand Section"}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 transition-transform duration-300`}
                            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>
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
