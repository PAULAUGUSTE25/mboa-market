import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { lightTheme, darkTheme, Theme } from '@/types/theme';

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  const { theme: themeMode, toggleTheme } = context;
  const theme: Theme = themeMode === 'light' ? lightTheme : darkTheme;

  return {
    theme,
    themeMode,
    toggleTheme,
    palette: theme.palette,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    typography: theme.typography,
  };
}
