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

export type Gradients = {
  cardGradient: { colors: string[]; start: { x: number; y: number }; end: { x: number; y: number } };
  appBarGradient: { colors: string[]; start: { x: number; y: number }; end: { x: number; y: number } };
  buttonPrimaryGradient: { colors: string[]; start: { x: number; y: number }; end: { x: number; y: number } };
};

export type Theme = {
  colors: ThemeColors;
  typography: Typography;
  gradients: Gradients;
  radius: number;
  spacing: { xxs: 4; xs: 8; sm: 12; md: 16; lg: 24 };
  elevation: { card: number; sheet: number };
  grid: number;
  appBar: { height: number; minTouchTarget: number };
};

export const betterTogetherTheme: Theme = {
  colors: {
    background: '#F4F7FB',
    surface: '#FFFFFF',
    surfaceAlt: '#E9EEF5',
    primary: '#2563EB',
    accent: '#7C3AED',
    success: '#16A34A',
    warning: '#FACC15',
    error: '#DC2626',
    textHigh: '#1E293B',
    textLow: '#64748B',
    border: '#CBD5E1',
  },
  typography: {
    H1: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
    H2: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
    Body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    Label: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
    Caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  },
  gradients: {
    cardGradient: {
      colors: ['#FFFFFF', '#EDF2F9'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    appBarGradient: {
      colors: ['#F9FAFB', '#E7EDF7'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    buttonPrimaryGradient: {
      colors: ['#2563EB', '#3B82F6'],
      start: { x: 0, y: 0.5 },
      end: { x: 1, y: 0.5 },
    },
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
  gradients: {
    cardGradient: {
      colors: ['#1E293B', '#0F172A'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    appBarGradient: {
      colors: ['#1E293B', '#0F172A'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    buttonPrimaryGradient: {
      colors: ['#3B82F6', '#60A5FA'],
      start: { x: 0, y: 0.5 },
      end: { x: 1, y: 0.5 },
    },
  },
  radius: 16,
  spacing: betterTogetherTheme.spacing,
  elevation: betterTogetherTheme.elevation,
  grid: 8,
  appBar: { height: 56, minTouchTarget: 44 },
};

export const styles = StyleSheet.create({});
