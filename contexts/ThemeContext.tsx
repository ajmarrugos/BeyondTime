import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { themes, Theme, ThemeName } from '../config/themes';
import usePersistentState from '../hooks/usePersistentState';
import { ClockLayout, ClockEffects, StartOfWeek } from '../types';

interface ThemeContextType {
    themeConfig: Theme;
    currentTheme: ThemeName;
    accentColor: string;
    handleThemeChange: (themeName: ThemeName) => void;
    handleAccentColorChange: (color: string) => void;
    
    clockLayout: ClockLayout;
    clockEffects: ClockEffects;
    handleClockLayoutChange: (layout: ClockLayout) => void;
    handleClockEffectChange: (effect: keyof ClockEffects, value: boolean) => void;
    setClockEffects: (effects: ClockEffects) => void; // For loading all effects at once
    
    startOfWeek: StartOfWeek;
    handleStartOfWeekChange: (day: StartOfWeek) => void;
    
    animationSpeed: number;
    handleAnimationSpeedChange: (speed: number) => void;
    
    timezone: string;
    handleTimezoneChange: (tz: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getDefaultTimezone = () => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
        return 'UTC'; // Fallback
    }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = usePersistentState<ThemeName>('theme', 'dark');
    const [accentColor, setAccentColor] = usePersistentState<string>('accentColor', '#6366f1');
    const [startOfWeek, setStartOfWeek] = usePersistentState<StartOfWeek>('startOfWeek', 'sunday');
    const [animationSpeed, setAnimationSpeed] = usePersistentState<number>('animationSpeed', 1);
    const [timezone, setTimezone] = usePersistentState<string>('timezone', getDefaultTimezone());

    const [clockLayout, setClockLayout] = usePersistentState<ClockLayout>('clockLayout', 'luxury');
    const [clockEffects, setClockEffects] = usePersistentState<ClockEffects>('clockEffects', {
        sweepingSecondHand: true,
        parallax: true,
        glint: true,
    });

    useEffect(() => {
        document.documentElement.style.setProperty('--accent-color', accentColor);
    }, [accentColor]);

    const handleThemeChange = (themeName: ThemeName) => setCurrentTheme(themeName);
    const handleAccentColorChange = (color: string) => setAccentColor(color);
    const handleClockLayoutChange = (layout: ClockLayout) => setClockLayout(layout);
    const handleClockEffectChange = (effect: keyof ClockEffects, value: boolean) => {
        setClockEffects(prev => ({ ...prev, [effect]: value }));
    };
    const handleStartOfWeekChange = (day: StartOfWeek) => setStartOfWeek(day);
    const handleAnimationSpeedChange = (speed: number) => setAnimationSpeed(speed);
    const handleTimezoneChange = (tz: string) => setTimezone(tz);

    // FIX: Validate the theme from localStorage. If it's not a valid key in our themes object,
    // fall back to 'dark' to prevent the app from crashing on startup.
    const validThemeName = useMemo(() => {
        return (Object.keys(themes) as ThemeName[]).includes(currentTheme) ? currentTheme : 'dark';
    }, [currentTheme]);

    const themeConfig = themes[validThemeName];

    // If the theme was invalid, this effect will correct it in localStorage for next time.
    useEffect(() => {
        if (currentTheme !== validThemeName) {
            setCurrentTheme(validThemeName);
        }
    }, [currentTheme, validThemeName, setCurrentTheme]);
    
    const value = useMemo(() => ({
        themeConfig,
        currentTheme: validThemeName,
        accentColor,
        handleThemeChange,
        handleAccentColorChange,
        clockLayout,
        clockEffects,
        handleClockLayoutChange,
        handleClockEffectChange,
        setClockEffects,
        startOfWeek,
        handleStartOfWeekChange,
        animationSpeed,
        handleAnimationSpeedChange,
        timezone,
        handleTimezoneChange,
    }), [themeConfig, validThemeName, accentColor, clockLayout, clockEffects, startOfWeek, animationSpeed, timezone, handleThemeChange, handleAccentColorChange, handleClockLayoutChange, handleClockEffectChange, setClockEffects, handleStartOfWeekChange, handleAnimationSpeedChange, handleTimezoneChange]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};