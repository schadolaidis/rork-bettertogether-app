import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import { DesignTokens } from '@/constants/design-tokens';

export type SimpleTaskStatus = 'pending' | 'overdue' | 'completed' | 'failed' | 'failed_joker_used' | 'failed_stake_paid';

interface TaskCardProps {
  title: string;
  categoryEmoji: string;
  categoryColor: string;
  dueTime: string;
  status: SimpleTaskStatus;
  onPress: () => void;
  testID?: string;
}

export function TaskCard({ title, categoryEmoji, categoryColor, dueTime, status, onPress, testID }: TaskCardProps) {
  const statusColor = status === 'overdue'
    ? DesignTokens.colors.warning[500]
    : status === 'completed'
      ? DesignTokens.colors.success[500]
      : status === 'failed'
        ? DesignTokens.colors.error[500]
        : DesignTokens.colors.neutral[500];

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: categoryColor }]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.header}>
        <View style={styles.category}>
          <Text style={styles.emoji}>{categoryEmoji}</Text>
        </View>
        <View style={styles.time}>
          <Clock size={14} color={statusColor} />
          <Text style={[styles.timeText, { color: statusColor }]}>{dueTime}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    borderLeftWidth: 4,
    padding: DesignTokens.spacing.lg,
    ...DesignTokens.shadow.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  category: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  timeText: {
    ...DesignTokens.typography.bodySmall,
    fontWeight: '600',
  },
  title: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[900],
    fontWeight: '600',
    lineHeight: 22,
  },
});
