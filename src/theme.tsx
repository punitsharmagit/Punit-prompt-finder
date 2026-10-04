import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'oled' | 'dim';

export interface ThemeConfig {
  id: ThemeMode;
  label: string;
  desc: string;
  themeColor: string;
  bgBase: string;
  bgSurface: string;
  bgCard: string;
  bgInput: string;
}

export const THEME_CONFIGS: Record<ThemeMode, ThemeConfig> = {
  dark: {
    id: 'dark',
    label: 'Dark Navy',
    desc: 'Standard #080C16',
    themeColor: '#080C16',
    bgBase: '#080C16',
    bgSurface: '#0B0F19',
    bgCard: '#0E1324',
    bgInput: '#0F1424',
  },
  oled: {
    id: 'oled',
    label: 'OLED Black',
    desc: 'Pure #000000',
    themeColor: '#000000',
    bgBase: '#000000',
    bgSurface: '#050505',
    bgCard: '#0d0d0d',
    bgInput: '#141414',
  },
  dim: {
    id: 'dim',
    label: 'Dim Charcoal',
    desc: 'Soft #121622',
    themeColor: '#121622',
    bgBase: '#121622',
    bgSurface: '#171D2D',
    bgCard: '#1E2538',
    bgInput: '#232B40',
  },
};

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  config: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  config: THEME_CONFIGS.dark,
});

export function applyThemeToDOM(theme: ThemeMode) {
  const config = THEME_CONFIGS[theme] || THEME_CONFIGS.dark;
  const root = document.documentElement;

  root.setAttribute('data-theme', theme);

  // Set CSS Variables directly on root element
  root.style.setProperty('--bg-base', config.bgBase);
  root.style.setProperty('--bg-surface', config.bgSurface);
  root.style.setProperty('--bg-card', config.bgCard);
  root.style.setProperty('--bg-input', config.bgInput);

  // Update theme-color meta tag for browsers and mobile status bar
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', config.themeColor);

  // Update body background
  document.body.style.backgroundColor = config.bgBase;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('promptai_theme') as ThemeMode;
    return saved && THEME_CONFIGS[saved] ? saved : 'dark';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('promptai_theme', newTheme);
    applyThemeToDOM(newTheme);
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const config = THEME_CONFIGS[theme] || THEME_CONFIGS.dark;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, config }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
