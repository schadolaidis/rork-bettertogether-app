export const DesignTokens = {
  colors: {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
    },
    success: {
      50: '#F0FDF4',
      500: '#10B981',
      600: '#059669',
    },
    warning: {
      50: '#FEF3C7',
      500: '#F59E0B',
      600: '#D97706',
    },
    error: {
      50: '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
    },
    purple: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      500: '#8B5CF6',
      600: '#7C3AED',
    },
    neutral: {
      0: '#FFFFFF',
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  typography: {
    displayLarge: {
      fontSize: 32,
      fontWeight: '800' as const,
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    displayMedium: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      letterSpacing: -0.3,
    },
    headingLarge: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
    },
    headingMedium: {
      fontSize: 20,
      fontWeight: '700' as const,
      lineHeight: 28,
    },
    headingSmall: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    bodyLarge: {
      fontSize: 17,
      fontWeight: '500' as const,
      lineHeight: 24,
    },
    bodyMedium: {
      fontSize: 15,
      fontWeight: '500' as const,
      lineHeight: 22,
    },
    bodySmall: {
      fontSize: 13,
      fontWeight: '500' as const,
      lineHeight: 18,
    },
    labelLarge: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    labelSmall: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 16,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
  },
  
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
  },
  
  zIndex: {
    scrim: 900,
    sheet: 910,
    popover: 920,
    toast: 930,
  },
} as const;

export type ColorName = keyof typeof DesignTokens.colors;
