import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Target, TrendingUp, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';

interface StreaksFundCardProps {
  emoji: string;
  name: string;
  description?: string;
  collectedAmount: number;
  targetAmount?: number;
  linkedTasksCount: number;
  currencySymbol: string;
  onPress: () => void;
}

export function StreaksFundCard({
  emoji,
  name,
  description,
  collectedAmount,
  targetAmount,
  linkedTasksCount,
  currencySymbol,
  onPress,
}: StreaksFundCardProps) {
  const progress = targetAmount ? Math.min((collectedAmount / targetAmount) * 100, 100) : 0;
  const hasTarget = targetAmount !== undefined && targetAmount > 0;
  const isCompleted = hasTarget && collectedAmount >= targetAmount;

  const radius = 44;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = hasTarget ? circumference - (progress / 100) * circumference : 0;

  const accentColor = isCompleted ? '#10B981' : '#3B82F6';
  const backgroundColor = isCompleted ? '#D1FAE5' : '#EFF6FF';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onPress();
      }}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={styles.progressContainer}>
          {hasTarget ? (
            <View style={styles.circularProgress}>
              <Svg width={radius * 2} height={radius * 2}>
                <Circle
                  stroke="#FFFFFF"
                  fill="none"
                  cx={radius}
                  cy={radius}
                  r={normalizedRadius}
                  strokeWidth={strokeWidth}
                />
                <Circle
                  stroke={accentColor}
                  fill="none"
                  cx={radius}
                  cy={radius}
                  r={normalizedRadius}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${radius} ${radius})`}
                />
              </Svg>
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{emoji}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emojiOnlyContainer}>
              <Text style={styles.emoji}>{emoji}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {name}
            </Text>
            {isCompleted && (
              <View style={styles.completeBadge}>
                <CheckCircle2 size={16} color="#10B981" />
              </View>
            )}
          </View>
          
          {description && (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {description}
            </Text>
          )}

          <View style={styles.amountSection}>
            <Text style={[styles.amount, { color: accentColor }]}>
              {currencySymbol}{collectedAmount.toFixed(2)}
            </Text>
            {hasTarget && (
              <Text style={styles.target}>
                / {currencySymbol}{targetAmount.toFixed(2)}
              </Text>
            )}
          </View>

          {hasTarget && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: accentColor }]} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.stat}>
          <Target size={14} color="#6B7280" />
          <Text style={styles.statText}>
            {linkedTasksCount} {linkedTasksCount === 1 ? 'task' : 'tasks'}
          </Text>
        </View>
        {hasTarget && (
          <View style={styles.stat}>
            <TrendingUp size={14} color={accentColor} />
            <Text style={[styles.statText, { color: accentColor }]}>
              {progress.toFixed(0)}% complete
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgress: {
    position: 'relative',
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOnlyContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emoji: {
    fontSize: 40,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#111827',
    flex: 1,
  },
  completeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  amount: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  target: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
});
