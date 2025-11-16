import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface CalendarItemProps {
    title: string;
    color?: string; // Optional for events
    type: 'routine' | 'event';
}

const CalendarItem: React.FC<CalendarItemProps> = ({ title, color, type }) => {
    const { themeConfig, accentColor } = useTheme();
    const itemColor = type === 'routine' ? color : accentColor;
    
    const style: React.CSSProperties = {
        backgroundColor: `${itemColor}33`, // 20% opacity
        borderColor: itemColor,
        color: themeConfig.textColor,
    };

    return (
        <div 
            className="w-full text-left text-xs font-medium px-2 py-1 rounded border truncate transition-colors duration-200"
            style={style}
        >
            {title}
        </div>
    );
};

export default CalendarItem;
