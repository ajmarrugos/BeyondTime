

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ViewIndicatorProps {
    viewCount: number;
    currentView: number;
    onIndicatorClick: (index: number) => void;
}

const ViewIndicator: React.FC<ViewIndicatorProps> = ({
    viewCount,
    currentView,
    onIndicatorClick,
}) => {
    const { themeConfig } = useTheme();
    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-10 flex space-x-2 p-2 rounded-full"
            aria-label="Page indicator"
            role="tablist"
        >
            {Array.from({ length: viewCount }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => onIndicatorClick(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        currentView === index ? `opacity-90 ${themeConfig.textColor.replace('text-', 'bg-')}` : `opacity-40 ${themeConfig.textColor.replace('text-', 'bg-')}`
                    }`}
                    aria-selected={currentView === index}
                    role="tab"
                    aria-label={`Go to view ${index + 1}`}
                />
            ))}
        </div>
    );
};

export default ViewIndicator;