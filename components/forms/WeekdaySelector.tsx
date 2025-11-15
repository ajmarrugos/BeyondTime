


import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface WeekdaySelectorProps {
    selectedDays: Set<number>;
    onDayToggle: (day: number) => void;
}

const WeekdaySelector: React.FC<WeekdaySelectorProps> = ({ selectedDays, onDayToggle }) => {
    const { themeConfig } = useTheme();
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div>
            <label className={`block mb-2 font-medium ${themeConfig.textColor}`}>On these days</label>
            <div className="flex justify-between space-x-1">
                {days.map((day, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onDayToggle(index)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                            selectedDays.has(index)
                                ? `bg-accent text-white`
                                : `bg-black/20 ${themeConfig.textColor} hover:bg-white/10`
                        }`}
                        aria-pressed={selectedDays.has(index)}
                    >
                        {day}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WeekdaySelector;