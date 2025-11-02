import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ModalSheet } from '@/components/design-system/ModalSheet';

export type SelectOption<T = string> = {
  label: string;
  value: T;
};

export type SelectProps<T = string> = {
  label?: string;
  placeholder?: string;
  value?: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  helperText?: string;
  errorText?: string;
  testID?: string;
};

export function Select<T = string>({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onChange,
  helperText,
  errorText,
  testID,
}: SelectProps<T>) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const hasError = !!errorText;

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

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
      <Pressable
        style={[
          styles.selectButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: hasError ? theme.colors.error : theme.colors.border,
            borderRadius: theme.radius - 4,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
          },
        ]}
        onPress={() => setIsOpen(true)}
        testID={testID ? `${testID}-trigger` : undefined}
      >
        <Text
          style={[
            theme.typography.Body,
            {
              color: selectedOption ? theme.colors.textHigh : theme.colors.textLow,
              flex: 1,
            },
          ]}
        >
          {displayValue}
        </Text>
        <ChevronDown size={20} color={theme.colors.textLow} />
      </Pressable>
      {(helperText || errorText) && (
        <Text
          style={[
            theme.typography.Caption,
            {
              color: hasError ? theme.colors.error : theme.colors.textLow,
              marginTop: theme.spacing.xxs,
            },
          ]}
        >
          {errorText || helperText}
        </Text>
      )}

      <ModalSheet
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxHeight={480}
        testID={testID ? `${testID}-modal` : undefined}
      >
        <View style={{ paddingHorizontal: theme.spacing.md }}>
          {label && (
            <Text
              style={[
                theme.typography.H2,
                { color: theme.colors.textHigh, marginBottom: theme.spacing.md },
              ]}
            >
              {label}
            </Text>
          )}
          <ScrollView style={{ maxHeight: 400 }}>
            {options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={index}
                  style={[
                    styles.option,
                    {
                      paddingVertical: theme.spacing.md,
                      borderBottomWidth: index < options.length - 1 ? 1 : 0,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => handleSelect(option.value)}
                  testID={testID ? `${testID}-option-${index}` : undefined}
                >
                  <Text
                    style={[
                      theme.typography.Body,
                      {
                        color: isSelected ? theme.colors.primary : theme.colors.textHigh,
                        flex: 1,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && <Check size={20} color={theme.colors.primary} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </ModalSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectButton: {
    minHeight: 48,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
