import React, { useMemo } from 'react';
import Svg, { Circle } from 'react-native-svg';
import { View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ProgressRingProps = {
  size?: number;
  stroke?: number;
  progress: number; // 0..1
  trackColor?: string;
  progressColor?: string;
  children?: React.ReactNode;
};

export const ProgressRing: React.FC<ProgressRingProps> = ({ size = 48, stroke = 6, progress, trackColor, progressColor, children }) => {
  const { theme } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const dash = useMemo(() => c * clamped, [c, clamped]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke={trackColor ?? theme.colors.surfaceAlt} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          stroke={progressColor ?? theme.colors.primary}
          strokeDasharray={`${dash}, ${c}`}
          strokeLinecap="round"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
          fill="none"
        />
      </Svg>
      {!!children && children}
    </View>
  );
};
