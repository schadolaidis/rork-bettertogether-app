import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Coins, TrendingUp, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { LedgerEntry, Task } from '@/types';
import Svg, { Circle } from 'react-native-svg';

interface FundHeroProps {
  ledgerEntries: LedgerEntry[];
  tasks: Task[];
  currentListId: string;
  currencySymbol: string;
  titleLabel?: string;
  subtitleLabel?: string;
  thisMonthLabel?: string;
  failedTasksLabel?: string;
  testID?: string;
}

export function FundHero({
  ledgerEntries,
  tasks,
  currentListId,
  currencySymbol,
  titleLabel = 'Gruppen-Topf',
  subtitleLabel = 'Geld von gescheiterten Aufgaben',
  thisMonthLabel = 'Dieser Monat',
  failedTasksLabel = 'Gescheiterte Aufgaben',
  testID,
}: FundHeroProps) {
  const router = useRouter();

  const totalFundAmount = useMemo(() => {
    return ledgerEntries
      .filter((e) => e.listId === currentListId)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [ledgerEntries, currentListId]);

  const failedTasksThisMonth = useMemo(() => {
    return tasks.filter((t) => {
      if ((t.status !== 'failed' && t.status !== 'failed_stake_paid' && t.status !== 'failed_joker_used') || !t.failedAt) return false;
      const failDate = new Date(t.failedAt);
      const now = new Date();
      return failDate.getMonth() === now.getMonth() && failDate.getFullYear() === now.getFullYear();
    }).length;
  }, [tasks]);

  const fundGrowthThisMonth = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return ledgerEntries
      .filter((e) => e.listId === currentListId && e.month === currentMonth)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [ledgerEntries, currentListId]);

  const totalGrowthPercentage = useMemo(() => {
    if (totalFundAmount === 0) return 0;
    return fundGrowthThisMonth > 0 ? ((fundGrowthThisMonth / totalFundAmount) * 100) : 0;
  }, [totalFundAmount, fundGrowthThisMonth]);

  const radius = 52;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.min(totalGrowthPercentage, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const accentColor = '#8B5CF6';
  const backgroundColor = '#F5F3FF';

  return (
    <TouchableOpacity
      style={[styles.fundHero, { backgroundColor }]}
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        console.log('[FundHero] Navigate to balances');
        // Hidden tab route
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (router as any).push('/(tabs)/balances');
      }}
      activeOpacity={0.95}
      testID={testID ?? 'group-fund-card'}
    >
      <View style={styles.fundHeroHeader}>
        <View style={styles.progressCircleContainer}>
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
          <View style={styles.iconContainer}>
            <Coins size={32} color={accentColor} />
          </View>
        </View>

        <View style={styles.fundInfo}>
          <Text style={styles.fundLabel}>{titleLabel}</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>{currencySymbol}</Text>
            <Text style={styles.fundAmount}>{totalFundAmount.toFixed(2)}</Text>
          </View>
          <Text style={styles.fundSubtitle}>{subtitleLabel}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.statIconBg}>
            <TrendingUp size={16} color={accentColor} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>{thisMonthLabel}</Text>
            <Text style={[styles.statValue, { color: accentColor }]}>+
              {currencySymbol}{fundGrowthThisMonth.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIconBg, { backgroundColor: '#FEE2E2' }]}>
            <AlertCircle size={16} color="#EF4444" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>{failedTasksLabel}</Text>
            <Text style={[styles.statValue, { color: '#EF4444' }]}> 
              {failedTasksThisMonth}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fundHero: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  fundHeroHeader: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
  },
  progressCircleContainer: {
    position: 'relative',
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  fundInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  fundLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#8B5CF6',
    marginRight: 2,
  },
  fundAmount: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: '#111827',
    letterSpacing: -1,
  },
  fundSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
});
