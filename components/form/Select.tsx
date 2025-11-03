import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ModalSheet } from '@/components/interactive/modals/ModalSheet';
import { useTheme } from '@/contexts/ThemeContext';
import {
  useFormStyles,
  getFieldContainerStyle,
  getLabelStyle,
  getValueTextStyle,
  getHelperTextStyle,
} from './base';

export type SelectOption<T = string> = {
  label: string;
  value: T;
};

export type SelectProps<T = string> = {
  label?: string;
  placeholder?: string;
  value?: T;
  options: SelectOption<T>[];
  onOpen?: () => void;
  onChange?: (value: T) => void;
  helperText?: string;
  errorText?: string;
  testID?: string;
};

export function Select<T = string>({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onOpen,
  onChange,
  helperText,
  errorText,
  testID,
}: SelectProps<T>) {
  const { theme } = useTheme();
  const formStyles = useFormStyles(theme);
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!errorText;

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  const state = hasError ? 'error' : isFocused ? 'focus' : 'default';
  const containerStyle = getFieldContainerStyle(state, formStyles);
  const labelStyle = getLabelStyle(theme);
  const valueStyle = getValueTextStyle(theme);
  const helperStyle = getHelperTextStyle(hasError ? 'error' : 'default', theme);

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsFocused(true);
    setIsSheetOpen(true);
    onOpen?.();
  };

  const handleSelect = (selectedValue: T) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange?.(selectedValue);
    setIsSheetOpen(false);
  };

  const handleClose = () => {
    setIsSheetOpen(false);
  };

  return (
    <>
      <View style={styles.container} testID={testID}>
        {label && (
          <Text style={[labelStyle, styles.label]}>
            {label}
          </Text>
        )}
        <Pressable
          style={[containerStyle, styles.selectButton]}
          onPress={handlePress}
          onPressOut={() => setIsFocused(false)}
          testID={testID ? `${testID}-trigger` : undefined}
        >
          <Text
            style={[
              valueStyle,
              {
                color: selectedOption ? formStyles.text : formStyles.textMuted,
                flex: 1,
              },
            ]}
          >
            {displayValue}
          </Text>
          <ChevronDown size={20} color={formStyles.textMuted} />
        </Pressable>
        {(helperText || errorText) && (
          <Text style={[helperStyle, styles.helper]} testID={testID ? `${testID}-helper` : undefined}>
            {errorText || helperText}
          </Text>
        )}
      </View>

      <ModalSheet
        visible={isSheetOpen}
        onClose={handleClose}
        title={label || 'Select an option'}
        testID={testID ? `${testID}-modal` : undefined}
      >
        <View style={styles.optionsList}>
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={index}
                onPress={() => handleSelect(option.value)}
                style={({ pressed }) => [
                  styles.optionRow,
                  {
                    backgroundColor: isSelected ? formStyles.bg : 'transparent',
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                testID={testID ? `${testID}-option-${index}` : undefined}
              >
                <Text
                  style={[
                    valueStyle,
                    {
                      color: isSelected ? formStyles.focusBorder : formStyles.text,
                      fontWeight: isSelected ? '600' : '400',
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ModalSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helper: {
    marginTop: 4,
  },
  optionsList: {
    gap: 4,
  },
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
