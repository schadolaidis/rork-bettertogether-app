import { StyleSheet } from 'react-native';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  textHigh: string;
  textLow: string;
  border: string;
};

export type Typography = {
  H1: { fontSize: number; fontWeight: '700'; lineHeight: number };
  H2: { fontSize: number; fontWeight: '600'; lineHeight: number };
  Body: { fontSize: number; fontWeight: '400'; lineHeight: number };
  Label: { fontSize: number; fontWeight: '500'; lineHeight: number };
  Caption: { fontSize: number; fontWeight: '400'; lineHeight: number };
};

export type Spacing = 4 | 8 | 12 | 16 | 24;

export type Theme = {
  colors: ThemeColors;
  typography: Typography;
  radius: number;
  spacing: { xxs: 4; xs: 8; sm: 12; md: 16; lg: 24 };
  elevation: { card: number; sheet: number };
  grid: number;
  appBar: { height: number; minTouchTarget: number };
};

export const betterTogetherTheme: Theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    primary: '#2563EB',
    accent: '#8B5CF6',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    textHigh: '#0F172A',
    textLow: '#64748B',
    border: '#E2E8F0',
  },
  typography: {
    H1: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
    H2: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
    Body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    Label: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
    Caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  },
  radius: 16,
  spacing: { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24 },
  elevation: { card: 1, sheet: 2 },
  grid: 8,
  appBar: { height: 56, minTouchTarget: 44 },
};

export const lightTheme = betterTogetherTheme;

export const darkTheme: Theme = {
  colors: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceAlt: '#334155',
    primary: '#3B82F6',
    accent: '#A78BFA',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    textHigh: '#F8FAFC',
    textLow: '#94A3B8',
    border: '#475569',
  },
  typography: betterTogetherTheme.typography,
  radius: 16,
  spacing: betterTogetherTheme.spacing,
  elevation: betterTogetherTheme.elevation,
  grid: 8,
  appBar: { height: 56, minTouchTarget: 44 },
};

export const styles = StyleSheet.create({});
