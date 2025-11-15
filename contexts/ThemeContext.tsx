
import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { themes, Theme, ThemeName } from '../config/themes';
import usePersistentState from '../hooks/usePersistentState';

// --- New Types for Clock Customization ---
export type ClockLayout = 'luxury' | 'minimalist' | 'digital' | 'pro';

export interface ClockEffects {
    sweepingSecondHand: boolean;
    parallax: boolean;
    glint: boolean;
}

interface ThemeContextType {
    themeConfig: Theme;
    currentTheme: ThemeName;
    accentColor: string;
    handleThemeChange: (themeName: ThemeName) => void;
    handleAccentColorChange: (color: string) => void;
    // New clock settings
    clockLayout: ClockLayout;
    clockEffects: ClockEffects;
    handleClockLayoutChange: (layout: ClockLayout) => void;
    handleClockEffectChange: (effect: keyof ClockEffects, value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = usePersistentState<ThemeName>('theme', 'dark');
    const [accentColor, setAccentColor] = usePersistentState<string>('accentColor', '#6366f1');

    // --- State for Clock Settings ---
    const [clockLayout, setClockLayout] = usePersistentState<ClockLayout>('clockLayout', 'luxury');
    const [clockEffects, setClockEffects] = usePersistentState<ClockEffects>('clockEffects', {
        sweepingSecondHand: true,
        parallax: true,
        glint: true,
    });

    useEffect(() => {
        document.documentElement.style.setProperty('--accent-color', accentColor);
    }, [accentColor]);

    const handleThemeChange = (themeName: ThemeName) => {
        setCurrentTheme(themeName);
    };
  
    const handleAccentColorChange = (color: string) => {
        setAccentColor(color);
    };

    const handleClockLayoutChange = (layout: ClockLayout) => {
        setClockLayout(layout);
    };

    const handleClockEffectChange = (effect: keyof ClockEffects, value: boolean) => {
        setClockEffects(prev => ({ ...prev, [effect]: value }));
    };

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
    }), [themeConfig, currentTheme, accentColor, clockLayout, clockEffects]);

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
