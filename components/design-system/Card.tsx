import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

export type CardProps = ViewProps & {
  padded?: boolean;
  header?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({ style, padded = true, header, content, footer, children, ...rest }) => {
  const { theme } = useTheme();

  const hasSlots = header || content || footer;

  return (
    <LinearGradient
      colors={theme.gradients.cardGradient as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      {...rest}
      style={[
        styles.base,
        {
          borderRadius: 16,
          shadowColor: 'rgba(0,0,0,0.05)',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 2,
          elevation: 1,
        },
        padded && !hasSlots ? { padding: 16 } : undefined,
        style,
      ]}
    >
      {hasSlots ? (
        <>
          {header && <View style={{ padding: 16 }}>{header}</View>}
          {content && <View style={{ padding: 16 }}>{content}</View>}
          {footer && <View style={{ padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }}>{footer}</View>}
        </>
      ) : (
        children
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  base: {},
});
