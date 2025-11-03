import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import {
  useFormStyles,
  getFieldContainerStyle,
  getLabelStyle,
  getValueTextStyle,
  getHelperTextStyle,
} from './base';

export type AmountInputProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  helperText?: string;
  errorText?: string;
  placeholder?: string;
  testID?: string;
};

export const AmountInput: React.FC<AmountInputProps> = ({
  label,
  value,
  onChange,
  prefix = '$',
  helperText,
  errorText,
  placeholder = '0.00',
  testID,
}) => {
  const { theme } = useTheme();
  const formStyles = useFormStyles(theme);
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

  const state = hasError ? 'error' : isFocused ? 'focus' : 'default';
  const containerStyle = getFieldContainerStyle(state, formStyles);
  const labelStyle = getLabelStyle(theme);
  const valueStyle = getValueTextStyle(theme);
  const helperStyle = getHelperTextStyle(hasError ? 'error' : 'default', theme);
  const prefixStyle = {
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight as any,
    color: formStyles.textMuted,
  };

  return (
    <View style={styles.container} testID={testID}>
      {label && (
        <Text style={[labelStyle, styles.label]}>
          {label}
        </Text>
      )}
      <View style={[containerStyle, styles.inputWrapper]}>
        <Text style={prefixStyle}>{prefix}</Text>
        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={formStyles.textMuted}
          keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
          style={[valueStyle, styles.input]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          testID={testID ? `${testID}-input` : undefined}
        />
      </View>
      {(helperText || errorText) && (
        <Text style={[helperStyle, styles.helper]} testID={testID ? `${testID}-helper` : undefined}>
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
  label: {
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingLeft: 8,
  },
  helper: {
    marginTop: 4,
  },
});
