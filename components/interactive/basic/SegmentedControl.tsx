import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type SegmentedControlOption = {
  value: string;
  label: string;
};

export type SegmentedControlProps = {
  options: SegmentedControlOption[];
  selectedValue: string;
  onChange: (value: string) => void;
};

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedValue,
  onChange,
}) => {
  const { theme } = useTheme();
  const selectedIndex = options.findIndex((opt) => opt.value === selectedValue);
  const animatedValue = useRef(new Animated.Value(selectedIndex)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: selectedIndex,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [selectedIndex, animatedValue]);

  const segmentWidth = 100 / options.length;

  const translateX = animatedValue.interpolate({
    inputRange: options.map((_, i) => i),
    outputRange: options.map((_, i) => `${i * segmentWidth}%`),
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radius,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius - 4,
            width: `${segmentWidth}%`,
            transform: [{ translateX: translateX as any }],
          },
        ]}
      />
      {options.map((option) => {
        const isActive = option.value === selectedValue;
        return (
          <Pressable
            key={option.value}
            style={styles.segment}
            onPress={() => onChange(option.value)}
            testID={`segment-${option.value}`}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? theme.colors.surface : theme.colors.textLow,
                  fontWeight: isActive ? ('600' as const) : ('400' as const),
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
