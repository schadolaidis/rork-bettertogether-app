import React from 'react';
import { Pressable, StyleSheet, ViewStyle, Animated, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type IconButtonProps = {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
};

export const IconButton: React.FC<IconButtonProps> = ({ icon, onPress, disabled = false, testID, style }) => {
  const { theme } = useTheme();
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
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? theme.colors.primary + '10' : 'transparent',
          opacity: disabled ? 0.5 : 1,
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
