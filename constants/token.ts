import { Theme } from './theme';

export const getToken = (
  theme: Theme | null | undefined,
  key: keyof Theme,
  fallback: string
): string => {
  if (!theme) return fallback;
  
  const value = theme[key];
  if (typeof value === 'string') {
    return value;
  }
  
  return fallback;
};
