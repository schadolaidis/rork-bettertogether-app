import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, Animated, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

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
  const rippleOpacity = React.useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(rippleOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(rippleOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={({ pressed }) => [stylesLocal.base, pressed && stylesLocal.pressed, style]}
      testID={testID}
    >
      <Text style={stylesLocal.label}>{title}</Text>
    </Pressable>
  );
};

const makeStyles = (theme: ReturnType<typeof useTheme>['theme'], variant: ButtonVariant, disabled: boolean) => {
  const base = {
    height: 48,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
  };

  let backgroundColor = 'transparent';
  let borderColor = 'transparent';
  let labelColor = theme.colors.textHigh;

  if (variant === 'primary') {
    backgroundColor = disabled ? theme.colors.textLow : theme.colors.primary;
    borderColor = backgroundColor;
    labelColor = '#FFFFFF';
  } else if (variant === 'secondary') {
    backgroundColor = 'transparent';
    borderColor = theme.colors.border;
    labelColor = theme.colors.textHigh;
  } else if (variant === 'ghost') {
    backgroundColor = 'transparent';
    borderColor = 'transparent';
    labelColor = theme.colors.textLow;
  }

  return StyleSheet.create({
    base: { ...base, backgroundColor, borderColor, opacity: disabled ? 0.5 : 1 },
    pressed: { opacity: 0.7 },
    label: { color: labelColor, fontSize: 16, fontWeight: '600' as const },
  });
};
