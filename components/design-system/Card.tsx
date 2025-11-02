import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type CardProps = ViewProps & { padded?: boolean };

export const Card: React.FC<CardProps> = ({ style, padded = true, children, ...rest }) => {
  const { theme } = useTheme();
  return (
    <View
      {...rest}
      style={[
        styles.base,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius },
        padded ? styles.padded : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: { borderWidth: StyleSheet.hairlineWidth },
  padded: { padding: 16 },
});
