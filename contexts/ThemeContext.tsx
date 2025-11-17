import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { themes, Theme, ThemeName } from '../config/themes';
import usePersistentState from '../hooks/usePersistentState';
import { ClockLayout, ClockEffects, StartOfWeek } from '../types';
import { useAuth } from './AuthContext';

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
    const { currentUser } = useAuth(); // Now available due to provider reordering

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

    // Auto-load personalization settings on login
    useEffect(() => {
        if (currentUser?.personalization) {
            const p = currentUser.personalization;
            setCurrentTheme(p.theme);
            setAccentColor(p.accentColor);
            setClockLayout(p.clockLayout);
            setClockEffects(p.clockEffects);
            setStartOfWeek(p.startOfWeek);
            setAnimationSpeed(p.animationSpeed);
        }
    }, [currentUser, setCurrentTheme, setAccentColor, setClockLayout, setClockEffects, setStartOfWeek, setAnimationSpeed]);

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

    const themeConfig = themes[currentTheme];
    
    const value = useMemo(() => ({
        themeConfig,
        currentTheme,
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
    }), [themeConfig, currentTheme, accentColor, clockLayout, clockEffects, startOfWeek, animationSpeed, timezone]);

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