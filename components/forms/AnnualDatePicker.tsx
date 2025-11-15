

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface AnnualDatePickerProps {
    dates: string[];
    setDates: (dates: string[]) => void;
}

const AnnualDatePicker: React.FC<AnnualDatePickerProps> = ({ dates, setDates }) => {
    const { themeConfig } = useTheme();
    const [currentDate, setCurrentDate] = useState('');

    const handleAddDate = () => {
        if (currentDate && !dates.includes(currentDate)) {
            setDates([...dates, currentDate].sort());
            setCurrentDate('');
        }
    };

    const handleRemoveDate = (dateToRemove: string) => {
        setDates(dates.filter(d => d !== dateToRemove));
    };

    return (
        <div>
            <label className={`block mb-2 font-medium ${themeConfig.textColor}`}>On these dates</label>
            <div className="flex space-x-2">
                <input
                    type="date"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className={`flex-grow p-3.5 rounded-xl bg-black/20 ${themeConfig.textColor} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50`}
                />
                <button 
                    type="button"
                    onClick={handleAddDate}
                    disabled={!currentDate}
                    className={`px-4 rounded-xl font-semibold ${themeConfig.textColor} bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Add
                </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
                {dates.map(date => (
                    <div key={date} className={`flex items-center space-x-2 py-1 px-3 rounded-full text-sm font-medium ${themeConfig.subtextColor} border border-white/10`}>
                        <span>{new Date(date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        <button onClick={() => handleRemoveDate(date)} aria-label={`Remove date ${date}`} className="text-lg leading-none">&times;</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnnualDatePicker;