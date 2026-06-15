import React, { createContext, useContext, useState, ReactNode } from 'react';

type ThemeContextType = {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    fontSize: number;
    updateFontSize: (size: number) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [fontSize, setFontSize] = useState(16);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
    const updateFontSize = (size: number) => setFontSize(size);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, fontSize, updateFontSize }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
