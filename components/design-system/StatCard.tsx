import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { DesignTokens } from '@/constants/design-tokens';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: { value: number; icon: React.ReactNode };
  color: string;
  onPress?: () => void;
  testID?: string;
}

export function StatCard({ icon, label, value, trend, color, onPress, testID }: StatCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
      testID={testID}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {trend && (
        <View style={styles.trend}>
          {trend.icon}
          <Text style={[styles.trendText, { color }]}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    padding: DesignTokens.spacing.lg,
    borderLeftWidth: 4,
    ...DesignTokens.shadow.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  label: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[600],
    marginBottom: DesignTokens.spacing.xs,
  },
  value: {
    ...DesignTokens.typography.headingMedium,
    marginBottom: DesignTokens.spacing.xs,
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  trendText: {
    ...DesignTokens.typography.labelSmall,
    fontSize: 11,
  },
});
