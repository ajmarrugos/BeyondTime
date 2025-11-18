

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ClockLayout, ClockEffects, StartOfWeek } from '../../types';
import { lightThemeOptions, darkThemeOptions } from '../../config/themes';
import { timezones } from '../../config/timezones';
import ColorPicker from '../forms/ColorPicker';
import ToggleSwitch from '../forms/ToggleSwitch';
import { useDevice } from '../../contexts/DeviceContext';
import { useDeviceMotion } from '../../contexts/DeviceMotionContext';
import ExpandableSection from '../ui/ExpandableSection';

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

const startOfWeekOptions: { name: StartOfWeek, label: string }[] = [
    { name: 'sunday', label: 'Sunday' },
    { name: 'monday', label: 'Monday' },
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
        handleClockEffectChange,
        startOfWeek,
        handleStartOfWeekChange,
        animationSpeed,
        handleAnimationSpeedChange,
        timezone,
        handleTimezoneChange,
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
        <div className="overflow-y-auto h-full space-y-4">
            <ExpandableSection title="Themes" defaultOpen={true}>
                <div className="space-y-4">
                    <div>
                        <div role="radiogroup" aria-label="Light Themes" className="flex w-full rounded-full border border-white/10 overflow-hidden">
                            {lightThemeOptions.map((theme, index) => (
                                <button
                                    key={theme.name}
                                    onClick={() => handleThemeChange(theme.name)}
                                    role="radio"
                                    aria-checked={currentTheme === theme.name}
                                    className={`flex-1 py-2 px-1 text-xs font-medium text-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 whitespace-nowrap ${
                                        currentTheme === theme.name ? `bg-accent text-white` : `bg-black/10 ${themeConfig.textColor} hover:bg-black/20`
                                    } ${index > 0 ? 'border-l border-white/10' : ''}`}
                                >
                                    {theme.label}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <div role="radiogroup" aria-label="Dark Themes" className="flex w-full rounded-full border border-white/10 overflow-hidden">
                            {darkThemeOptions.map((theme, index) => (
                                <button
                                    key={theme.name}
                                    onClick={() => handleThemeChange(theme.name)}
                                    role="radio"
                                    aria-checked={currentTheme === theme.name}
                                    className={`flex-1 py-2 px-1 text-xs font-medium text-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 whitespace-nowrap ${
                                        currentTheme === theme.name ? `bg-accent text-white` : `bg-black/10 ${themeConfig.textColor} hover:bg-black/20`
                                    } ${index > 0 ? 'border-l border-white/10' : ''}`}
                                >
                                    {theme.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </ExpandableSection>
            
            <ExpandableSection title="Accent Color">
                <ColorPicker colors={accentColors} selectedColor={accentColor} onSelectColor={handleAccentColorChange} />
            </ExpandableSection>
            
            <ExpandableSection title="Time & Date">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="timezone-select" className={`text-sm font-medium mb-2 block ${themeConfig.textColor}`}>Timezone</label>
                        <div className="relative">
                            <select
                                id="timezone-select"
                                value={timezone}
                                onChange={(e) => handleTimezoneChange(e.target.value)}
                                className={`w-full p-3.5 rounded-xl bg-black/10 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent appearance-none`}
                            >
                                {timezones.map(group => (
                                    <optgroup key={group.group} label={group.group}>
                                        {group.zones.map(zone => (
                                            <option key={zone.value} value={zone.value}>
                                                {zone.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${themeConfig.textColor}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 id="start-of-week-label" className={`text-sm font-medium mb-2 ${themeConfig.textColor}`}>Start Week On</h4>
                        <div role="radiogroup" aria-labelledby="start-of-week-label" className="flex w-full rounded-full border border-white/10 overflow-hidden">
                            {startOfWeekOptions.map((option, index) => (
                                <button
                                    key={option.name}
                                    onClick={() => handleStartOfWeekChange(option.name)}
                                    role="radio"
                                    aria-checked={startOfWeek === option.name}
                                    className={`flex-1 py-2.5 px-2 text-sm font-medium text-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 whitespace-nowrap ${
                                        startOfWeek === option.name ? `bg-accent text-white` : `bg-black/10 ${themeConfig.textColor} hover:bg-black/20`
                                    } ${index > 0 ? 'border-l border-white/10' : ''}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </ExpandableSection>

            <ExpandableSection title="Background">
                 <p className={`text-sm mb-3 ${themeConfig.subtextColor}`}>Adjust the background animation.</p>
                 <label htmlFor="animation-speed" className={`block text-sm font-medium ${themeConfig.textColor}`}>Animation Speed</label>
                 <input
                    id="animation-speed"
                    type="range"
                    min="0.1"
                    max="2.5"
                    step="0.1"
                    value={animationSpeed}
                    onChange={(e) => handleAnimationSpeedChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-accent mt-2"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Slower</span>
                    <span>Faster</span>
                </div>
            </ExpandableSection>
            
            <ExpandableSection title="Clock Face">
                <p className={`text-sm mb-3 ${themeConfig.subtextColor}`}>Customize your clock's style and effects.</p>
                <div className="mt-2">
                    <h4 id="clock-layout-label" className={`text-sm font-medium mb-2 ${themeConfig.textColor}`}>Layout</h4>
                    <div role="radiogroup" aria-labelledby="clock-layout-label" className="flex w-full rounded-full border border-white/10 overflow-hidden">
                        {clockLayoutOptions.map((layout, index) => (
                            <button
                                key={layout.name}
                                onClick={() => handleClockLayoutChange(layout.name)}
                                role="radio"
                                aria-checked={clockLayout === layout.name}
                                className={`flex-1 py-2 px-1 text-xs font-medium text-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 whitespace-nowrap ${
                                    clockLayout === layout.name ? `bg-accent text-white` : `bg-black/10 ${themeConfig.textColor} hover:bg-black/20`
                                } ${index > 0 ? 'border-l border-white/10' : ''}`}
                            >
                                {layout.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={`mt-4 transition-opacity ${clockLayout === 'digital' ? 'opacity-50' : ''}`}>
                    <h4 className={`text-sm font-medium mb-2 ${themeConfig.textColor}`}>Effects</h4>
                    <div className="space-y-3">
                        <ToggleSwitch label="Sweeping Second Hand" enabled={clockEffects.sweepingSecondHand} setEnabled={(val) => handleClockEffectChange('sweepingSecondHand', val)} disabled={clockLayout === 'digital'} />
                        <ToggleSwitch label="3D Parallax Effect" enabled={clockEffects.parallax} setEnabled={(val) => handleEffectChange('parallax', val)} disabled={clockLayout === 'digital'} />
                        <ToggleSwitch label="Reflective Glint" enabled={clockEffects.glint} setEnabled={(val) => handleEffectChange('glint', val)} disabled={clockLayout === 'digital'} />
                    </div>
                </div>
            </ExpandableSection>
        </div>
    );
};

export default React.memo(AppearanceSettingsView);