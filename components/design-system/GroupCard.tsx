import React from 'react';
import { StyleSheet, View, ViewStyle, Text } from 'react-native';
import { DesignTokens } from '@/constants/design-tokens';

interface GroupCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export function GroupCard({ children, style, testID }: GroupCardProps) {
  const renderChildren = () => {
    if (typeof children === 'string' || typeof children === 'number') {
      return <Text>{children}</Text>;
    }
    return children;
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {renderChildren()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.sm,
  },
});
