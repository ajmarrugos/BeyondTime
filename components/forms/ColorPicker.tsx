import React from 'react';

interface ColorPickerProps {
    colors: string[];
    selectedColor: string;
    onSelectColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ colors, selectedColor, onSelectColor }) => {
    return (
        <div className="grid grid-cols-7 gap-3">
            {colors.map(color => (
                <button
                    key={color}
                    onClick={() => onSelectColor(color)}
                    aria-label={`Select color ${color}`}
                    className={`w-9 h-9 rounded-full transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white/70`}
                    style={{ backgroundColor: color }}
                >
                    {selectedColor === color && (
                        <div className="flex items-center justify-center w-full h-full">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
};

export default ColorPicker;