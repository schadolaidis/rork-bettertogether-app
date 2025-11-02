export type Theme = {
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
  
  gradients: {
    cardGradient: string[];
    appBarGradient: string[];
    buttonPrimaryGradient: string[];
  };
  
  typography: {
    h1: { fontSize: number; fontWeight: string };
    h2: { fontSize: number; fontWeight: string };
    body: { fontSize: number; fontWeight: string };
    label: { fontSize: number; fontWeight: string };
    caption: { fontSize: number; fontWeight: string };
  };
  
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  
  radius: {
    card: number;
    input: number;
    button: number;
  };
  
  elevation: number;
};

export const lightTheme: Theme = {
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
  
  gradients: {
    cardGradient: ['#FFFFFF', '#EDF2F9'],
    appBarGradient: ['#F9FAFB', '#E7EDF7'],
    buttonPrimaryGradient: ['#2563EB', '#3B82F6'],
  },
  
  typography: {
    h1: { fontSize: 24, fontWeight: '700' },
    h2: { fontSize: 18, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    label: { fontSize: 14, fontWeight: '500' },
    caption: { fontSize: 12, fontWeight: '400' },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  
  radius: {
    card: 16,
    input: 10,
    button: 12,
  },
  
  elevation: 2,
};

export const darkTheme: Theme = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceAlt: '#334155',
  primary: '#3B82F6',
  accent: '#8B5CF6',
  success: '#22C55E',
  warning: '#FCD34D',
  error: '#EF4444',
  textHigh: '#F1F5F9',
  textLow: '#94A3B8',
  border: '#475569',
  
  gradients: {
    cardGradient: ['#1E293B', '#0F172A'],
    appBarGradient: ['#1E293B', '#0F172A'],
    buttonPrimaryGradient: ['#2563EB', '#1D4ED8'],
  },
  
  typography: {
    h1: { fontSize: 24, fontWeight: '700' },
    h2: { fontSize: 18, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    label: { fontSize: 14, fontWeight: '500' },
    caption: { fontSize: 12, fontWeight: '400' },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  
  radius: {
    card: 16,
    input: 10,
    button: 12,
  },
  
  elevation: 2,
};
