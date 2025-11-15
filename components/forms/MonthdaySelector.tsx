


import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface MonthdaySelectorProps {
    selectedDays: Set<number>;
    onDayToggle: (day: number) => void;
}

const MonthdaySelector: React.FC<MonthdaySelectorProps> = ({ selectedDays, onDayToggle }) => {
    const { themeConfig } = useTheme();
    return (
        <div>
             <label className={`block mb-2 font-medium ${themeConfig.textColor}`}>On these dates</label>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <button
                        key={day}
                        type="button"
                        onClick={() => onDayToggle(day)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                            selectedDays.has(day)
                                ? 'bg-accent text-white'
                                : `bg-black/20 ${themeConfig.textColor} hover:bg-white/10`
                        }`}
                         aria-pressed={selectedDays.has(day)}
                    >
                        {day}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MonthdaySelector;