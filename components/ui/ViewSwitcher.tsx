import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ViewSwitcherOption<T extends string> {
    label: string;
    value: T;
}

interface ViewSwitcherProps<T extends string> {
    options: ViewSwitcherOption<T>[];
    selectedValue: T;
    onChange: (value: T) => void;
    label: string;
}

const ViewSwitcher = <T extends string>({ options, selectedValue, onChange, label }: ViewSwitcherProps<T>) => {
    const { themeConfig } = useTheme();

    return (
        <div role="radiogroup" aria-label={label} className="flex w-full max-w-sm rounded-full border border-white/10 overflow-hidden bg-black/20 mx-auto">
            {options.map((option, index) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    role="radio"
                    aria-checked={selectedValue === option.value}
                    className={`flex-1 py-2.5 px-2 text-sm font-medium text-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 whitespace-nowrap ${
                        selectedValue === option.value ? `bg-accent text-white` : `${themeConfig.textColor} hover:bg-white/10`
                    } ${index > 0 ? 'border-l border-white/10' : ''}`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default ViewSwitcher;
