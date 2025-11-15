

import React from 'react';
import { useTheme, ClockLayout, ClockEffects } from '../../contexts/ThemeContext';
import { lightThemeOptions, darkThemeOptions } from '../../config/themes';
import ColorPicker from '../forms/ColorPicker';
import SectionHeader from '../ui/SectionHeader';
import ToggleSwitch from '../forms/ToggleSwitch';
import { useDevice } from '../../contexts/DeviceContext';
import { useDeviceMotion } from '../../contexts/DeviceMotionContext';

const accentColors: string[] = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b',
];

const clockLayoutOptions: { name: ClockLayout, label: string }[] = [
    { name: 'luxury', label: 'Luxury' },
    { name: 'minimalist', label: 'Minimalist' },
    { name: 'pro', label: 'Pro' },
    { name: 'digital', label: 'Digital' },
];

const AppearanceSettingsView: React.FC = () => {
    const { 
        themeConfig, 
        currentTheme, 
        handleThemeChange, 
        accentColor, 
        handleAccentColorChange,
        clockLayout,
        clockEffects,
        handleClockLayoutChange,
        handleClockEffectChange
    } = useTheme();
    const { isDesktop } = useDevice();
    const { permissionStatus, requestPermission } = useDeviceMotion();

    const handleEffectChange = async (effect: keyof ClockEffects, value: boolean) => {
        if (!isDesktop && value && permissionStatus === 'prompt' && (effect === 'parallax' || effect === 'glint')) {
            const newStatus = await requestPermission();
            if (newStatus === 'granted') {
                 handleClockEffectChange(effect, value);
            }
        } else {
            handleClockEffectChange(effect, value);
        }
    };

    return (
        <div className="overflow-y-auto h-full space-y-6">
            <div>
                <h3 id="light-theme-label" className={`text-lg font-semibold mb-3 ${themeConfig.textColor}`}>Light Themes</h3>
                <div role="radiogroup" aria-labelledby="light-theme-label" className="flex w-full rounded-full border border-white/10 overflow-hidden">
                    {lightThemeOptions.map((theme, index) => (
                        <button
                            key={theme.name}
                            onClick={() => handleThemeChange(theme.name)}
                            role="radio"
                            aria-checked={currentTheme === theme.name}
                            className={`flex-1 py-2.5 px-2 text-sm font-medium text-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 whitespace-nowrap ${
                                currentTheme === theme.name ? `bg-accent text-white` : `bg-black/10 ${themeConfig.textColor} hover:bg-black/20`
                            } ${index > 0 ? 'border-l border-white/10' : ''}`}
                        >
                            {theme.label}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <h3 id="dark-theme-label" className={`text-lg font-semibold mb-3 ${themeConfig.textColor}`}>Dark Themes</h3>
                <div role="radiogroup" aria-labelledby="dark-theme-label" className="flex w-full rounded-full border border-white/10 overflow-hidden">
                    {darkThemeOptions.map((theme, index) => (
                        <button
                            key={theme.name}
                            onClick={() => handleThemeChange(theme.name)}
                            role="radio"
                            aria-checked={currentTheme === theme.name}
                            className={`flex-1 py-2.5 px-2 text-sm font-medium text-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 whitespace-nowrap ${
                                currentTheme === theme.name ? `bg-accent text-white` : `bg-black/10 ${themeConfig.textColor} hover:bg-black/20`
                            } ${index > 0 ? 'border-l border-white/10' : ''}`}
                        >
                            {theme.label}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <h3 id="accent-label" className={`text-lg font-semibold mb-4 ${themeConfig.textColor}`}>Accent Color</h3>
                <ColorPicker colors={accentColors} selectedColor={accentColor} onSelectColor={handleAccentColorChange} />
            </div>

            <div className="pt-2">
                <SectionHeader title="Clock Face" description="Customize your clock's style and effects." />
                <div className="mt-4">
                    <h3 id="clock-layout-label" className={`text-lg font-semibold mb-3 ${themeConfig.textColor}`}>Layout</h3>
                    <div role="radiogroup" aria-labelledby="clock-layout-label" className="flex w-full rounded-full border border-white/10 overflow-hidden">
                        {clockLayoutOptions.map((layout, index) => (
                            <button
                                key={layout.name}
                                onClick={() => handleClockLayoutChange(layout.name)}
                                role="radio"
                                aria-checked={clockLayout === layout.name}
                                className={`flex-1 py-2.5 px-2 text-sm font-medium text-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 whitespace-nowrap ${
                                    clockLayout === layout.name ? `bg-accent text-white` : `bg-black/10 ${themeConfig.textColor} hover:bg-black/20`
                                } ${index > 0 ? 'border-l border-white/10' : ''}`}
                            >
                                {layout.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={`mt-6 transition-opacity ${clockLayout === 'digital' ? 'opacity-50' : ''}`}>
                    <h3 className={`text-lg font-semibold mb-3 ${themeConfig.textColor}`}>Effects</h3>
                    <div className="p-4 rounded-xl bg-black/20 space-y-3">
                        <ToggleSwitch label="Sweeping Second Hand" enabled={clockEffects.sweepingSecondHand} setEnabled={(val) => handleClockEffectChange('sweepingSecondHand', val)} disabled={clockLayout === 'digital'} />
                        <ToggleSwitch label="3D Parallax Effect" enabled={clockEffects.parallax} setEnabled={(val) => handleEffectChange('parallax', val)} disabled={clockLayout === 'digital'} />
                        <ToggleSwitch label="Reflective Glint" enabled={clockEffects.glint} setEnabled={(val) => handleEffectChange('glint', val)} disabled={clockLayout === 'digital'} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(AppearanceSettingsView);
