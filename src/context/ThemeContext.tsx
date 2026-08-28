'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'refined' | 'classic';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'refined',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('refined');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('folk_theme_mode') as ThemeMode;
    if (saved === 'classic' || saved === 'refined') {
      setThemeState(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'refined');
    }
    setMounted(true);
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('folk_theme_mode', mode);
    document.documentElement.setAttribute('data-theme', mode);
  };

  const toggleTheme = () => {
    const next = theme === 'refined' ? 'classic' : 'refined';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : 'refined', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
