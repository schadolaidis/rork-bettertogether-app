import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type IconButtonProps = {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'ghost';
  testID?: string;
  style?: ViewStyle;
};

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  onPress, 
  disabled = false, 
  variant = 'default',
  testID, 
  style 
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return 'transparent';
    if (pressed) {
      if (variant === 'primary') return theme.primary + '20';
      return theme.surfaceAlt;
    }
    if (variant === 'primary') return theme.primary + '10';
    return 'transparent';
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: getBackgroundColor(pressed),
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
      testID={testID}
    >
      {icon}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
