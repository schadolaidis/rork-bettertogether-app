import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type TextFieldProps = TextInputProps & {
  label?: string;
  helperText?: string;
  errorText?: string;
  testID?: string;
};

export const TextField: React.FC<TextFieldProps> = ({
  label,
  helperText,
  errorText,
  style,
  testID,
  onFocus,
  onBlur,
  ...rest
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!errorText;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const borderColor = hasError
    ? theme.colors.error
    : isFocused
    ? theme.colors.primary
    : theme.colors.border;

  return (
    <View style={styles.container} testID={testID}>
      {label && (
        <Text
          style={[
            theme.typography.Label,
            { color: theme.colors.textHigh, marginBottom: theme.spacing.xs },
          ]}
        >
          {label}
        </Text>
      )}
      <TextInput
        {...rest}
        style={[
          styles.input,
          theme.typography.Body,
          {
            color: theme.colors.textHigh,
            backgroundColor: theme.colors.surface,
            borderColor,
            borderRadius: theme.radius - 4,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.textLow}
        onFocus={handleFocus}
        onBlur={handleBlur}
        testID={testID ? `${testID}-input` : undefined}
      />
      {(helperText || errorText) && (
        <Text
          style={[
            theme.typography.Caption,
            {
              color: hasError ? theme.colors.error : theme.colors.textLow,
              marginTop: theme.spacing.xxs,
            },
          ]}
          testID={testID ? `${testID}-helper` : undefined}
        >
          {errorText || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
  },
});
