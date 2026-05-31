import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('rentflow-theme');
        return saved === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('rentflow-theme', isDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    // Centralized color tokens for inline-style usage
    const colors = isDark ? {
        // Backgrounds
        pageBg: '#0f1117',
        cardBg: '#1a1d27',
        cardBgElevated: '#222636',
        surfaceBg: '#141620',
        inputBg: '#1a1d27',
        // Borders
        border: '#2a2e3d',
        borderLight: '#252838',
        // Text
        textPrimary: '#f0f1f5',
        textSecondary: '#9ca3b4',
        textMuted: '#6b7280',
        textHeading: '#f5f6fa',
        // Accent
        accent: '#3b82f6',
        accentHover: '#2563eb',
        accentDark: '#1e3a8a',
        // Status
        success: '#22c55e',
        successBg: '#162a1e',
        danger: '#ef4444',
        dangerBg: '#2a1520',
        warning: '#eab308',
        warningBg: '#2a2615',
        // Misc
        overlayBg: 'rgba(0,0,0,0.5)',
        navBg: '#14161f',
        navBorder: '#232636',
        quickActionsBg: '#0c1a3d',
        promoBg: 'linear-gradient(135deg, #2a1a1a 0%, #2a2215 100%)',
    } : {
        // Backgrounds
        pageBg: '#f9fafb',
        cardBg: '#ffffff',
        cardBgElevated: '#ffffff',
        surfaceBg: '#f8f7f4',
        inputBg: '#ffffff',
        // Borders
        border: '#e5e7eb',
        borderLight: '#f3f4f6',
        // Text
        textPrimary: '#111827',
        textSecondary: '#6b7280',
        textMuted: '#9ca3af',
        textHeading: '#111827',
        // Accent
        accent: '#2563eb',
        accentHover: '#1d4ed8',
        accentDark: '#1e3a8a',
        // Status
        success: '#16a34a',
        successBg: '#dcfce7',
        danger: '#ef4444',
        dangerBg: '#fef2f2',
        warning: '#854d0e',
        warningBg: '#fef9c3',
        // Misc
        overlayBg: 'rgba(0,0,0,0.5)',
        navBg: '#ffffff',
        navBorder: '#e5e7eb',
        quickActionsBg: '#1e3a8a',
        promoBg: 'linear-gradient(135deg, #fde8e8 0%, #fce4c4 100%)',
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
