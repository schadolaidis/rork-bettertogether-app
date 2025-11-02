import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { DesignTokens } from '@/constants/design-tokens';

interface DisclosureRowProps {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  subtitle?: string;
  badge?: string | number;
  onPress: () => void;
  showChevron?: boolean;
  rightContent?: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function DisclosureRow({
  icon,
  label,
  value,
  subtitle,
  badge,
  onPress,
  showChevron = true,
  rightContent,
  isFirst,
  isLast,
  style,
  testID,
}: DisclosureRowProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isFirst && styles.first,
        isLast && styles.last,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      
      <View style={styles.content}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {badge !== undefined && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {value && <Text style={styles.value}>{value}</Text>}
      </View>
      
      {rightContent || (showChevron && (
        <ChevronRight size={20} color={DesignTokens.colors.neutral[400]} />
      ))}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing.md,
    paddingHorizontal: DesignTokens.spacing.lg,
    backgroundColor: DesignTokens.colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[100],
  },
  first: {
    borderTopLeftRadius: DesignTokens.radius.lg,
    borderTopRightRadius: DesignTokens.radius.lg,
  },
  last: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: DesignTokens.radius.lg,
    borderBottomRightRadius: DesignTokens.radius.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.md,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
  },
  label: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[900],
    fontWeight: '600',
  },
  subtitle: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[500],
  },
  value: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[600],
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: DesignTokens.colors.error[50],
    borderRadius: DesignTokens.radius.sm,
  },
  badgeText: {
    ...DesignTokens.typography.labelSmall,
    color: DesignTokens.colors.error[600],
    fontSize: 11,
  },
});
