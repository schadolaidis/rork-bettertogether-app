import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { DesignTokens } from '@/constants/design-tokens';

interface GroupCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export function GroupCard({ children, style, testID }: GroupCardProps) {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {children}
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
