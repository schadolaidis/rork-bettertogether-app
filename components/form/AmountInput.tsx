import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type AmountInputProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  helperText?: string;
  errorText?: string;
  placeholder?: string;
  testID?: string;
};

export const AmountInput: React.FC<AmountInputProps> = ({
  label,
  value,
  onChange,
  currency = '$',
  helperText,
  errorText,
  placeholder = '0.00',
  testID,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!errorText;

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    onChange(cleaned);
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
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.colors.surface,
            borderColor,
            borderRadius: theme.radius - 4,
            paddingHorizontal: theme.spacing.md,
          },
        ]}
      >
        <Text
          style={[
            theme.typography.Body,
            { color: theme.colors.textHigh, fontWeight: '600' as const },
          ]}
        >
          {currency}
        </Text>
        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textLow}
          keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
          style={[
            styles.input,
            theme.typography.Body,
            {
              color: theme.colors.textHigh,
              paddingHorizontal: theme.spacing.xs,
            },
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          testID={testID ? `${testID}-input` : undefined}
        />
      </View>
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
  inputWrapper: {
    minHeight: 48,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 48,
  },
});
