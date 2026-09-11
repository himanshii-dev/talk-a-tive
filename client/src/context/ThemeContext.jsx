import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('talkative_theme') || 'dark';
  });

  const [compactMode, setCompactModeState] = useState(() => {
    return localStorage.getItem('talkative_compact') === 'true';
  });

  const [reducedMotion, setReducedMotionState] = useState(() => {
    return localStorage.getItem('talkative_reduced_motion') === 'true';
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('talkative_theme', newTheme);
  };

  const setCompactMode = (value) => {
    setCompactModeState(value);
    localStorage.setItem('talkative_compact', value);
  };

  const setReducedMotion = (value) => {
    setReducedMotionState(value);
    localStorage.setItem('talkative_reduced_motion', value);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'amoled', 'focus-mode', 'compact-mode');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'amoled') {
      root.classList.add('dark', 'amoled');
    } else if (theme === 'focus') {
      root.classList.add('dark', 'focus-mode');
    }

    if (compactMode) {
      root.classList.add('compact-mode');
    }
  }, [theme, compactMode]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        compactMode,
        setCompactMode,
        reducedMotion,
        setReducedMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
