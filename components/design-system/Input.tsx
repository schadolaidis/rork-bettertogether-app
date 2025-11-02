import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export const Input: React.FC<TextInputProps> = ({ style, placeholderTextColor, ...rest }) => {
  const { theme } = useTheme();
  return (
    <TextInput
      {...rest}
      style={[styles.base, { color: theme.colors.textHigh, backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius }, style]}
      placeholderTextColor={placeholderTextColor ?? theme.colors.textLow}
    />
  );
};

const styles = StyleSheet.create({
  base: { height: 44, borderWidth: 1, paddingHorizontal: 12 },
});
