import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import {
  useFormStyles,
  getFieldContainerStyle,
  getLabelStyle,
  getValueTextStyle,
  getHelperTextStyle,
} from './base';

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
  const formStyles = useFormStyles(theme);
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

  const state = hasError ? 'error' : isFocused ? 'focus' : 'default';
  const containerStyle = getFieldContainerStyle(state, formStyles);
  const labelStyle = getLabelStyle(theme);
  const valueStyle = getValueTextStyle(theme);
  const helperStyle = getHelperTextStyle(hasError ? 'error' : 'default', theme);

  return (
    <View style={styles.container} testID={testID}>
      {label && (
        <Text style={[labelStyle, styles.label]}>
          {label}
        </Text>
      )}
      <TextInput
        {...rest}
        style={[
          containerStyle,
          valueStyle,
          styles.input,
          style,
        ]}
        placeholderTextColor={formStyles.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        testID={testID ? `${testID}-input` : undefined}
      />
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
  input: {
    textAlignVertical: 'center',
  },
  helper: {
    marginTop: 4,
  },
});
