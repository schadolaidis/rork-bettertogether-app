import { StyleSheet } from 'react-native';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  accent: string;
  success: string;
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
  appBar: { height: number };
};

export const lightTheme: Theme = {
  colors: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceAlt: '#F3F4F6',
    primary: '#2C6EF2',
    accent: '#FFC93D',
    success: '#34C759',
    error: '#FF3B30',
    textHigh: '#111827',
    textLow: '#6B7280',
    border: '#E5E7EB',
  },
  typography: {
    H1: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
    H2: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
    Body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
    Label: { fontSize: 14, fontWeight: '500', lineHeight: 18 },
    Caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  },
  radius: 12,
  spacing: { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24 },
  appBar: { height: 56 },
};

export const darkTheme: Theme = {
  colors: {
    background: '#0B0B0C',
    surface: '#151618',
    surfaceAlt: '#1C1E21',
    primary: '#2C6EF2',
    accent: '#FFC93D',
    success: '#34C759',
    error: '#FF3B30',
    textHigh: '#F3F4F6',
    textLow: '#9CA3AF',
    border: '#2A2D31',
  },
  typography: lightTheme.typography,
  radius: 12,
  spacing: lightTheme.spacing,
  appBar: { height: 56 },
};

export const styles = StyleSheet.create({});
