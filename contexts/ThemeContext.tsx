import React, { useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { Theme, lightTheme, darkTheme } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeState = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

export const [ThemeProvider, useTheme] = createContextHook<ThemeState>(() => {
  const systemScheme = Appearance.getColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');

  const theme = useMemo<Theme>(() => {
    const effective = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
    return effective === 'dark' ? darkTheme : lightTheme;
  }, [mode, systemScheme]);

  const value = useMemo<ThemeState>(() => ({ theme, mode, setMode }), [theme, mode, setMode]);
  return value;
});
