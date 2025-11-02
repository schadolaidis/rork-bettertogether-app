import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
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
    <View
      {...rest}
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: theme.elevation.card,
        },
        padded && !hasSlots ? { padding: theme.spacing.md } : undefined,
        style,
      ]}
    >
      {hasSlots ? (
        <>
          {header && <View style={{ padding: theme.spacing.md }}>{header}</View>}
          {content && <View style={{ padding: theme.spacing.md }}>{content}</View>}
          {footer && <View style={{ padding: theme.spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border }}>{footer}</View>}
        </>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {},
});
