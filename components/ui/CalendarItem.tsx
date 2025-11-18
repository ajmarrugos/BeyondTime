import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface CalendarItemProps {
    title: string;
    icon: string;
    color?: string; // Optional for events
    type: 'routine' | 'event';
    onClick: () => void;
    size?: 'sm' | 'md';
}

const CalendarItem: React.FC<CalendarItemProps> = ({ title, icon, color, type, onClick, size = 'sm' }) => {
    const { accentColor } = useTheme();
    const itemColor = type === 'routine' ? color : accentColor;
    
    const style: React.CSSProperties = {
        backgroundColor: `${itemColor}33`, // 20% opacity
        borderColor: `${itemColor}80`, // 50% opacity for a softer border
    };

    const sizeClasses = {
        sm: { container: 'w-6 h-6', icon: 'w-4 h-4' },
        md: { container: 'w-10 h-10', icon: 'w-6 h-6' },
    };

    return (
        <button 
            onClick={onClick}
            title={title} // Tooltip for desktop
            aria-label={`View details for ${title}`}
            className={`${sizeClasses[size].container} rounded-full border flex items-center justify-center flex-shrink-0 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent`}
            style={{ ...style, '--tw-ring-color': itemColor ?? accentColor } as React.CSSProperties}
        >
            <svg 
                className={sizeClasses[size].icon} 
                style={{ color: itemColor }} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
        </button>
    );
};

export default CalendarItem;