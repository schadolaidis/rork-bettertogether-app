import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Coins, Sparkles, Gift, TrendingUp, Target } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { LedgerEntry, Task } from '@/types';

interface FundHeroProps {
  ledgerEntries: LedgerEntry[];
  tasks: Task[];
  currentListId: string;
  currencySymbol: string;
}

export function FundHero({ ledgerEntries, tasks, currentListId, currencySymbol }: FundHeroProps) {
  const router = useRouter();

  const totalFundAmount = useMemo(() => {
    return ledgerEntries
      .filter((e) => e.listId === currentListId)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [ledgerEntries, currentListId]);

  const failedTasksThisMonth = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status !== 'failed' || !t.failedAt) return false;
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

  return (
    <TouchableOpacity
      style={styles.fundHero}
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        router.push('/balances');
      }}
      activeOpacity={0.95}
    >
      <View style={styles.fundHeroBackground}>
        <View style={styles.fundHeroGradient} />
      </View>
      <View style={styles.fundHeroContent}>
        <View style={styles.fundHeroHeader}>
          <View style={styles.fundHeroIconContainer}>
            <Coins size={24} color="#FFFFFF" />
          </View>
          <View style={styles.fundHeroBadge}>
            <Sparkles size={12} color="#F59E0B" />
            <Text style={styles.fundHeroBadgeText}>Group Fund</Text>
          </View>
        </View>
        <View style={styles.fundHeroAmount}>
          <Text style={styles.fundHeroCurrency}>{currencySymbol}</Text>
          <Text style={styles.fundHeroValue}>{totalFundAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.fundHeroStats}>
          <View style={styles.fundHeroStat}>
            <TrendingUp size={14} color="#A78BFA" />
            <Text style={styles.fundHeroStatText}>
              +{currencySymbol}{fundGrowthThisMonth.toFixed(2)} this month
            </Text>
          </View>
          <View style={styles.fundHeroDivider} />
          <View style={styles.fundHeroStat}>
            <Target size={14} color="#A78BFA" />
            <Text style={styles.fundHeroStatText}>
              {failedTasksThisMonth} failed task{failedTasksThisMonth !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <View style={styles.fundHeroFooter}>
          <Gift size={16} color="#A78BFA" />
          <Text style={styles.fundHeroFooterText}>
            Money from failed tasks goes here
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fundHero: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  fundHeroBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E1B4B',
  },
  fundHeroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#312E81',
    opacity: 0.8,
  },
  fundHeroContent: {
    padding: 24,
  },
  fundHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  fundHeroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fundHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  fundHeroBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FCD34D',
  },
  fundHeroAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  fundHeroCurrency: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#A78BFA',
    marginRight: 4,
  },
  fundHeroValue: {
    fontSize: 56,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  fundHeroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderRadius: 16,
    marginBottom: 16,
  },
  fundHeroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  fundHeroDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(167, 139, 250, 0.3)',
    marginHorizontal: 12,
  },
  fundHeroStatText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#C4B5FD',
    flex: 1,
  },
  fundHeroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fundHeroFooterText: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '500' as const,
  },
});
