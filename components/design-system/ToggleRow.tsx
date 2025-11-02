import React from 'react';
import { StyleSheet, Text, View, Switch, ViewStyle } from 'react-native';
import { DesignTokens } from '@/constants/design-tokens';

interface ToggleRowProps {
  icon?: React.ReactNode;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isFirst?: boolean;
  isLast?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function ToggleRow({
  icon,
  label,
  subtitle,
  value,
  onValueChange,
  isFirst,
  isLast,
  style,
  testID,
}: ToggleRowProps) {
  return (
    <View
      style={[
        styles.container,
        isFirst && styles.first,
        isLast && styles.last,
        style,
      ]}
      testID={testID}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ 
          false: DesignTokens.colors.neutral[300], 
          true: DesignTokens.colors.primary[500] 
        }}
        thumbColor={DesignTokens.colors.neutral[0]}
        ios_backgroundColor={DesignTokens.colors.neutral[300]}
      />
    </View>
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
  label: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[900],
    fontWeight: '600',
  },
  subtitle: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[500],
  },
});
