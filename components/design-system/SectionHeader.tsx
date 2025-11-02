import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { DesignTokens } from '@/constants/design-tokens';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  testID?: string;
}

export function SectionHeader({ title, subtitle, action, testID }: SectionHeaderProps) {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {action && (
        <TouchableOpacity 
          style={styles.action} 
          onPress={action.onPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.actionText}>{action.label}</Text>
          <ChevronRight size={16} color={DesignTokens.colors.primary[500]} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingVertical: DesignTokens.spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: DesignTokens.spacing.xs,
  },
  title: {
    ...DesignTokens.typography.labelSmall,
    color: DesignTokens.colors.neutral[500],
  },
  subtitle: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[400],
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  actionText: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.primary[500],
    fontWeight: '600',
  },
});
