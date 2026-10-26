import React, { createContext, useContext, useState, useEffect } from 'react';

export const PALETTES = {
  indigo: {
    id: 'indigo',
    name: 'Indigo Nebula',
    colorHex: '#6366f1',
    shades: {
      '--primary-50': '#eef2ff',
      '--primary-100': '#e0e7ff',
      '--primary-200': '#c7d2fe',
      '--primary-300': '#a5b4fc',
      '--primary-400': '#818cf8',
      '--primary-500': '#6366f1',
      '--primary-600': '#4f46e5',
      '--primary-700': '#4338ca',
      '--primary-800': '#3730a3',
      '--primary-900': '#312e81',
      '--primary-950': '#1e1b4b',
    }
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Matrix',
    colorHex: '#10b981',
    shades: {
      '--primary-50': '#ecfdf5',
      '--primary-100': '#d1fae5',
      '--primary-200': '#a7f3d0',
      '--primary-300': '#6ee7b7',
      '--primary-400': '#34d399',
      '--primary-500': '#10b981',
      '--primary-600': '#059669',
      '--primary-700': '#047857',
      '--primary-800': '#065f46',
      '--primary-900': '#064e3b',
      '--primary-950': '#022c22',
    }
  },
  cyan: {
    id: 'cyan',
    name: 'Cyber Ocean',
    colorHex: '#0ea5e9',
    shades: {
      '--primary-50': '#f0f9ff',
      '--primary-100': '#e0f2fe',
      '--primary-200': '#bae6fd',
      '--primary-300': '#7dd3fc',
      '--primary-400': '#38bdf8',
      '--primary-500': '#0ea5e9',
      '--primary-600': '#0284c7',
      '--primary-700': '#0369a1',
      '--primary-800': '#075985',
      '--primary-900': '#0c4a6e',
      '--primary-950': '#082f49',
    }
  },
  amethyst: {
    id: 'amethyst',
    name: 'Royal Amethyst',
    colorHex: '#a855f7',
    shades: {
      '--primary-50': '#faf5ff',
      '--primary-100': '#f3e8ff',
      '--primary-200': '#e9d5ff',
      '--primary-300': '#d8b4fe',
      '--primary-400': '#c084fc',
      '--primary-500': '#a855f7',
      '--primary-600': '#9333ea',
      '--primary-700': '#7e22ce',
      '--primary-800': '#6b21a8',
      '--primary-900': '#581c87',
      '--primary-950': '#3b0764',
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Amber',
    colorHex: '#f97316',
    shades: {
      '--primary-50': '#fff7ed',
      '--primary-100': '#ffedd5',
      '--primary-200': '#fed7aa',
      '--primary-300': '#fdba74',
      '--primary-400': '#fb923c',
      '--primary-500': '#f97316',
      '--primary-600': '#ea580c',
      '--primary-700': '#c2410c',
      '--primary-800': '#9a3412',
      '--primary-900': '#7c2d12',
      '--primary-950': '#431407',
    }
  }
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('tms_theme_mode') || 'light';
  });

  const [paletteId, setPaletteId] = useState(() => {
    return localStorage.getItem('tms_palette') || 'indigo';
  });

  // Apply Dark/Light mode class
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('tms_theme_mode', themeMode);

    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else if (themeMode === 'light') {
      root.classList.remove('dark');
    } else {
      // System mode
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [themeMode]);

  // Apply Palette CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    const selected = PALETTES[paletteId] || PALETTES.indigo;
    localStorage.setItem('tms_palette', selected.id);

    Object.entries(selected.shades).forEach(([variable, value]) => {
      root.style.setProperty(variable, value);
    });
  }, [paletteId]);

  const toggleDarkMode = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const changePalette = (id) => {
    if (PALETTES[id]) {
      setPaletteId(id);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        toggleDarkMode,
        isDark: themeMode === 'dark',
        paletteId,
        palette: PALETTES[paletteId] || PALETTES.indigo,
        changePalette,
        palettes: PALETTES
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
