import React, { useEffect, useRef } from 'react';
import Svg, { Circle } from 'react-native-svg';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ProgressRingProps = {
  size?: number;
  stroke?: number;
  progress: number;
  trackColor?: string;
  progressColor?: string;
  children?: React.ReactNode;
  showLabel?: boolean;
  labelType?: 'percentage' | 'amount';
  amount?: number;
};

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size = 48,
  stroke = 6,
  progress,
  trackColor,
  progressColor,
  children,
  showLabel = false,
  labelType = 'percentage',
  amount,
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: clamped,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [clamped, animatedValue]);

  const dash = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, c],
  });

  const renderLabel = () => {
    if (!showLabel) return null;

    if (labelType === 'percentage') {
      return (
        <View style={styles.labelContainer}>
          <Text style={[styles.labelText, { color: theme.colors.textHigh }]}>
            {Math.round(clamped * 100)}%
          </Text>
        </View>
      );
    }

    if (labelType === 'amount' && amount !== undefined) {
      return (
        <View style={styles.labelContainer}>
          <Text style={[styles.labelText, { color: theme.colors.textHigh }]}>
            ${amount}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          stroke={trackColor ?? theme.colors.surfaceAlt}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          stroke={progressColor ?? theme.colors.primary}
          strokeDasharray={`${c}, ${c}`}
          strokeDashoffset={dash as any}
          strokeLinecap="round"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
          fill="none"
        />
      </Svg>
      {children ? (
        <View style={styles.labelContainer}>{children}</View>
      ) : (
        renderLabel()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
