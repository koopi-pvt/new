"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '@/lib/themes';

type Theme = 'classic' | 'modern' | 'minimalist' | 'bold';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeStyles: any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('modern');

  useEffect(() => {
    // In a real app, you might fetch this from a user's store settings
    // For now, we'll just default to 'modern'
  }, []);

  const themeStyles = themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeStyles }}>
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