import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Target } from 'lucide-react-native';
import { DesignTokens } from '@/constants/design-tokens';

interface FundCardProps {
  emoji: string;
  name: string;
  description?: string;
  collected: number;
  target?: number;
  linkedTasks: number;
  currencySymbol: string;
  onPress: () => void;
  testID?: string;
}

export function FundCard({ 
  emoji, 
  name, 
  description, 
  collected, 
  target, 
  linkedTasks, 
  currencySymbol, 
  onPress,
  testID,
}: FundCardProps) {
  const progress = target ? Math.min((collected / target) * 100, 100) : 0;
  const isCompleted = target && collected >= target;

  return (
    <TouchableOpacity
      style={[styles.container, isCompleted && styles.containerCompleted]}
      onPress={onPress}
      activeOpacity={0.8}
      testID={testID}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, isCompleted && styles.iconContainerCompleted]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.name}>{name}</Text>
          {description && (
            <Text style={styles.description} numberOfLines={1}>
              {description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={[styles.collected, isCompleted && styles.collectedCompleted]}>
          {currencySymbol}{collected.toFixed(2)}
        </Text>
        {target && (
          <Text style={styles.target}>
            {' '}/ {currencySymbol}{target.toFixed(2)}
          </Text>
        )}
      </View>

      {target && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progress}%`,
                  backgroundColor: isCompleted 
                    ? DesignTokens.colors.success[500] 
                    : DesignTokens.colors.purple[500]
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, isCompleted && styles.progressTextCompleted]}>
            {progress.toFixed(0)}% {isCompleted ? '🎉 Reached!' : ''}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Target size={14} color={DesignTokens.colors.neutral[500]} />
          <Text style={styles.statText}>
            {linkedTasks} {linkedTasks === 1 ? 'task' : 'tasks'} linked
          </Text>
        </View>
        {target && (
          <Text style={[styles.percentage, isCompleted && styles.percentageCompleted]}>
            {progress.toFixed(0)}%
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    padding: DesignTokens.spacing.lg,
    ...DesignTokens.shadow.md,
    marginBottom: DesignTokens.spacing.md,
  },
  containerCompleted: {
    backgroundColor: DesignTokens.colors.success[50],
    borderWidth: 2,
    borderColor: DesignTokens.colors.success[500],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DesignTokens.colors.purple[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerCompleted: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderWidth: 2,
    borderColor: DesignTokens.colors.success[500],
  },
  emoji: {
    fontSize: 28,
  },
  headerContent: {
    flex: 1,
  },
  name: {
    ...DesignTokens.typography.headingSmall,
    color: DesignTokens.colors.neutral[900],
    marginBottom: 2,
  },
  description: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[500],
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: DesignTokens.spacing.sm,
    marginBottom: DesignTokens.spacing.md,
  },
  collected: {
    ...DesignTokens.typography.displayMedium,
    color: DesignTokens.colors.purple[600],
  },
  collectedCompleted: {
    color: DesignTokens.colors.success[600],
  },
  target: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[500],
  },
  progressSection: {
    marginBottom: DesignTokens.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: DesignTokens.colors.neutral[100],
    borderRadius: DesignTokens.radius.full,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: DesignTokens.radius.full,
  },
  progressText: {
    ...DesignTokens.typography.labelLarge,
    color: DesignTokens.colors.purple[600],
    textAlign: 'center',
  },
  progressTextCompleted: {
    color: DesignTokens.colors.success[600],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  statText: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[600],
  },
  percentage: {
    ...DesignTokens.typography.labelLarge,
    color: DesignTokens.colors.purple[600],
  },
  percentageCompleted: {
    color: DesignTokens.colors.success[600],
  },
});
