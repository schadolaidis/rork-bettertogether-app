import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ButtonVariant = 'primary' | 'outline' | 'subtle';

export type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  testID?: string;
  style?: ViewStyle;
};

export const Button: React.FC<ButtonProps> = ({ title, onPress, disabled = false, variant = 'primary', testID, style }) => {
  const { theme } = useTheme();
  const stylesLocal = useMemo(() => makeStyles(theme, variant, disabled), [theme, variant, disabled]);

  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [stylesLocal.base, pressed && stylesLocal.pressed, style]} testID={testID}>
      <Text style={stylesLocal.label}>{title}</Text>
    </Pressable>
  );
};

const makeStyles = (theme: ReturnType<typeof useTheme>['theme'], variant: ButtonVariant, disabled: boolean) => {
  const base = {
    height: 44,
    borderRadius: theme.radius,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 16,
    borderWidth: 1,
  };

  let backgroundColor = 'transparent';
  let borderColor = theme.colors.border;
  let labelColor = theme.colors.textHigh;

  if (variant === 'primary') {
    backgroundColor = disabled ? '#9DB7FB' : theme.colors.primary;
    borderColor = backgroundColor;
    labelColor = '#FFFFFF';
  } else if (variant === 'subtle') {
    backgroundColor = theme.colors.surfaceAlt;
    borderColor = theme.colors.surfaceAlt;
    labelColor = theme.colors.textHigh;
  }

  return StyleSheet.create({
    base: { ...base, backgroundColor, borderColor },
    pressed: { opacity: 0.9 },
    label: { color: labelColor, fontSize: 16, fontWeight: '600' as const },
  });
};
