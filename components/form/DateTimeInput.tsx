import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import {
  useFormStyles,
  getFieldContainerStyle,
  getLabelStyle,
  getValueTextStyle,
  getHelperTextStyle,
} from './base';

export type DateTimeValue = {
  dateISO: string;
  timeISO: string | null;
  allDay: boolean;
  timezone: string;
};

export type DateTimeInputProps = {
  label?: string;
  value?: string | null;
  onOpen: () => void;
  onChange?: (value: string) => void;
  helperText?: string;
  errorText?: string;
  testID?: string;
  placeholder?: string;
};

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  label,
  value,
  onOpen,
  helperText,
  errorText,
  testID,
  placeholder = 'Select date & time',
}) => {
  const { theme } = useTheme();
  const formStyles = useFormStyles(theme);
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!errorText;

  const formatDisplayValue = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return placeholder;
    }
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsFocused(true);
    onOpen();
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
      <Pressable
        onPress={handlePress}
        onPressOut={() => setIsFocused(false)}
        style={[containerStyle, styles.field]}
        testID={testID ? `${testID}-button` : undefined}
      >
        <Clock size={20} color={value ? formStyles.focusBorder : formStyles.textMuted} />
        <Text
          style={[
            valueStyle,
            {
              color: value ? formStyles.text : formStyles.textMuted,
              flex: 1,
            },
          ]}
        >
          {value ? formatDisplayValue(value) : placeholder}
        </Text>
      </Pressable>
      {(helperText || errorText) && (
        <Text
          style={[helperStyle, styles.helper]}
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
  label: {
    marginBottom: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helper: {
    marginTop: 4,
  },
});
