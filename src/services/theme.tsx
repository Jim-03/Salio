import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext<'dark'|'light'>({} as 'dark'|'light');

/**
 * System theme
 * @param {React.ReactNode} children Components relying on the system theme
 * @returns {React.ReactNode} A component that provides the system's theme to its child elements
 */
export const ThemeProvider = ({children}: {children: React.ReactNode}): React.ReactNode => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';


  return <ThemeContext.Provider value={theme}>
    {children}
  </ThemeContext.Provider>;
};

/**
 * Hook to get the system's theme
 * @returns {'light' | 'dark'} System's theme
 */
export const useTheme = (): 'light'|'dark' => {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme may only be used in ThemeProvider!');
  return theme;
};