import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, Users, Calendar, BarChart3, ArrowUpDown, DollarSign, Activity } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { LedgerEntry, User, TaskCategory } from '@/types';
import { ClockService } from '@/services/ClockService';
import { router } from 'expo-router';

type TabType = 'overview' | 'history' | 'stats';

interface MemberBalance {
  user: User;
  balance: number;
  totalOwed: number;
  totalReceived: number;
  transactionCount: number;
  trend: number;
}

interface DateGroup {
  date: string;
  entries: LedgerEntry[];
}

interface CategoryBreakdown {
  category: TaskCategory;
  emoji: string;
  color: string;
  total: number;
  count: number;
  percentage: number;
}

interface TransactionItemProps {
  entry: LedgerEntry;
  categoryEmoji: string;
  payerName: string;
  currencySymbol: string;
  onPress?: () => void;
}

function TransactionItem({ entry, categoryEmoji, payerName, currencySymbol, onPress }: TransactionItemProps) {
  const date = new Date(entry.date);
  const timeText = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <TouchableOpacity style={styles.transactionCard} onPress={onPress}>
      <View style={styles.transactionIconContainer}>
        <Text style={styles.transactionEmoji}>{categoryEmoji}</Text>
      </View>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionTitle} numberOfLines={1}>
          {entry.taskTitle}
        </Text>
        <Text style={styles.transactionSubtitle}>
          {payerName} • {timeText}
        </Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>
          {currencySymbol}{entry.amount.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

interface CategoryCardProps {
  category: CategoryBreakdown;
  currencySymbol: string;
  onPress: () => void;
}

function CategoryCard({ category, currencySymbol, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity style={[styles.categoryCard, { borderLeftColor: category.color }]} onPress={onPress}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryIconContainer}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{category.category}</Text>
          <Text style={styles.categoryCount}>{category.count} transactions</Text>
        </View>
      </View>
      <View style={styles.categoryBottom}>
        <Text style={[styles.categoryAmount, { color: category.color }]}>
          {currencySymbol}{category.total.toFixed(2)}
        </Text>
        <View style={styles.percentageBar}>
          <View style={[styles.percentageFill, { width: `${category.percentage}%`, backgroundColor: category.color }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  trend?: number;
  color?: string;
}

function StatCard({ label, value, trend, color = '#3B82F6' }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {trend !== undefined && (
        <View style={styles.trendContainer}>
          {trend > 0 ? (
            <TrendingUp size={14} color="#10B981" />
          ) : trend < 0 ? (
            <TrendingDown size={14} color="#EF4444" />
          ) : (
            <ArrowUpDown size={14} color="#6B7280" />
          )}
          <Text style={[
            styles.trendText,
            { color: trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : '#6B7280' }
          ]}>
            {trend > 0 ? '+' : ''}{trend.toFixed(0)}%
          </Text>
        </View>
      )}
    </View>
  );
}

interface MemberBalanceCardProps {
  memberBalance: MemberBalance;
  currencySymbol: string;
  onPress: () => void;
}

function MemberBalanceCard({ memberBalance, currencySymbol, onPress }: MemberBalanceCardProps) {
  const { user, balance, transactionCount, trend } = memberBalance;
  const isPositive = balance > 0;
  const balanceColor = balance > 0 ? '#10B981' : balance < 0 ? '#EF4444' : '#6B7280';
  const statusText = balance > 0 ? 'receives' : balance < 0 ? 'owes' : 'settled';

  return (
    <TouchableOpacity style={styles.memberCard} onPress={onPress}>
      <View style={[styles.memberAvatar, { backgroundColor: user.color }]}>
        <Text style={styles.memberAvatarText}>
          {user.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{user.name}</Text>
        <Text style={styles.memberStatus}>
          {transactionCount} transactions • {statusText}
        </Text>
      </View>
      <View style={styles.memberRight}>
        <Text style={[styles.memberBalance, { color: balanceColor }]}>
          {currencySymbol}{Math.abs(balance).toFixed(2)}
        </Text>
        {trend !== 0 && (
          <View style={styles.memberTrend}>
            {trend > 0 ? (
              <TrendingUp size={12} color={isPositive ? '#10B981' : '#EF4444'} />
            ) : (
              <TrendingDown size={12} color={isPositive ? '#10B981' : '#EF4444'} />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function BalancesScreen() {
  const insets = useSafeAreaInsets();
  const { ledgerEntries, currentUserId, currentListMembers, currentList, getUserBalance, tasks, users } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const currentMonth = ClockService.getCurrentMonth();

  const currencySymbol = currentList?.currencySymbol || '$';

  const currentMonthEntries = useMemo(() => {
    return ledgerEntries.filter((e) => e.month === currentMonth);
  }, [ledgerEntries, currentMonth]);

  const previousMonthEntries = useMemo(() => {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
    return ledgerEntries.filter((e) => e.month === prevMonthStr);
  }, [ledgerEntries]);

  const memberBalances = useMemo((): MemberBalance[] => {
    return currentListMembers.map((user) => {
      const balance = getUserBalance(user.id);
      const userEntries = currentMonthEntries.filter((e) => e.userId === user.id);
      const totalOwed = Math.abs(Math.min(balance, 0));
      const totalReceived = Math.max(balance, 0);
      const transactionCount = userEntries.length;

      const prevBalance = previousMonthEntries
        .filter((e) => e.userId === user.id)
        .reduce((acc, e) => acc - e.amount, 0);

      const trend = prevBalance !== 0 ? ((balance - prevBalance) / Math.abs(prevBalance)) * 100 : 0;

      return {
        user,
        balance,
        totalOwed,
        totalReceived,
        transactionCount,
        trend,
      };
    });
  }, [currentListMembers, getUserBalance, currentMonthEntries, previousMonthEntries]);

  const totalExpenses = useMemo(() => {
    return currentMonthEntries.reduce((sum, e) => sum + e.amount, 0);
  }, [currentMonthEntries]);

  const totalPreviousExpenses = useMemo(() => {
    return previousMonthEntries.reduce((sum, e) => sum + e.amount, 0);
  }, [previousMonthEntries]);

  const expensesTrend = totalPreviousExpenses !== 0
    ? ((totalExpenses - totalPreviousExpenses) / totalPreviousExpenses) * 100
    : 0;

  const currentUserBalance = getUserBalance(currentUserId);
  const myPreviousBalance = previousMonthEntries
    .filter((e) => e.userId === currentUserId)
    .reduce((acc, e) => acc - e.amount, 0);
  const myBalanceTrend = myPreviousBalance !== 0
    ? ((currentUserBalance - myPreviousBalance) / Math.abs(myPreviousBalance)) * 100
    : 0;

  const groupedByDate = useMemo((): DateGroup[] => {
    const sorted = currentMonthEntries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const groups: Map<string, LedgerEntry[]> = new Map();
    sorted.forEach((entry) => {
      const dateKey = new Date(entry.date).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(entry);
    });

    return Array.from(groups.entries()).map(([date, entries]) => ({
      date,
      entries,
    }));
  }, [currentMonthEntries]);

  const topSpender = useMemo(() => {
    const balances = memberBalances.map((mb) => ({
      name: mb.user.name,
      amount: mb.totalOwed,
    }));
    return balances.sort((a, b) => b.amount - a.amount)[0];
  }, [memberBalances]);

  const mostReliable = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const counts: Record<string, number> = {};
    completedTasks.forEach((task) => {
      const assignee = Array.isArray(task.assignedTo) ? task.assignedTo[0] : task.assignedTo;
      counts[assignee] = (counts[assignee] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return null;
    const user = users.find((u) => u.id === sorted[0][0]);
    return { name: user?.name || 'Unknown', count: sorted[0][1] };
  }, [tasks, users]);

  const categoryBreakdown = useMemo((): CategoryBreakdown[] => {
    const categoriesMap: Record<TaskCategory, { total: number; count: number }> = {
      Household: { total: 0, count: 0 },
      Finance: { total: 0, count: 0 },
      Work: { total: 0, count: 0 },
      Leisure: { total: 0, count: 0 },
    };

    currentMonthEntries.forEach((entry) => {
      const task = tasks.find((t) => t.id === entry.taskId);
      if (task) {
        categoriesMap[task.category].total += entry.amount;
        categoriesMap[task.category].count += 1;
      }
    });

    const breakdown: CategoryBreakdown[] = Object.entries(categoriesMap)
      .filter(([_, data]) => data.total > 0)
      .map(([category, data]) => {
        const categoryMeta = currentList?.categories[category as TaskCategory];
        return {
          category: category as TaskCategory,
          emoji: categoryMeta?.emoji || '📋',
          color: categoryMeta?.color || '#6B7280',
          total: data.total,
          count: data.count,
          percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    return breakdown;
  }, [currentMonthEntries, tasks, currentList, totalExpenses]);

  const handleTabPress = (tab: TabType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  const handleMemberPress = (memberId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('[Balance] View member details:', memberId);
  };

  const handleTransactionPress = (taskId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/task-detail?id=${taskId}`);
  };

  const handleCategoryPress = (category: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('[Balance] View category:', category);
  };

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerEmoji}>💶</Text>
          <Text style={styles.headerTitle}>Balances</Text>
        </View>
        <Text style={styles.headerSubtitle}>{currentList?.name || 'Group'} • {monthName}</Text>
        <View style={styles.memberCountBadge}>
          <Users size={14} color="#6B7280" />
          <Text style={styles.memberCountText}>{currentListMembers.length} members</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => handleTabPress('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => handleTabPress('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
          onPress={() => handleTabPress('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
            Stats
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && (
          <>
            <View style={styles.summaryGrid}>
              <StatCard
                label="My Balance"
                value={`${currencySymbol}${Math.abs(currentUserBalance).toFixed(2)}`}
                trend={myBalanceTrend}
                color={currentUserBalance >= 0 ? '#10B981' : '#EF4444'}
              />
              <StatCard
                label="Total Expenses"
                value={`${currencySymbol}${totalExpenses.toFixed(2)}`}
                trend={expensesTrend}
                color="#3B82F6"
              />
              <StatCard
                label="This Month"
                value={`${currentMonthEntries.length} txns`}
                color="#F59E0B"
              />
              <StatCard
                label="Group Balance"
                value={`${currencySymbol}${Math.abs(totalExpenses).toFixed(2)}`}
                color="#8B5CF6"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Member Balances</Text>
              {memberBalances.length > 0 ? (
                memberBalances.map((mb) => (
                  <MemberBalanceCard
                    key={mb.user.id}
                    memberBalance={mb}
                    currencySymbol={currencySymbol}
                    onPress={() => handleMemberPress(mb.user.id)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Users size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No members yet</Text>
                </View>
              )}
            </View>
          </>
        )}

        {activeTab === 'history' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            {groupedByDate.length > 0 ? (
              groupedByDate.map((group) => (
                <View key={group.date} style={styles.dateGroup}>
                  <Text style={styles.dateHeader}>{group.date}</Text>
                  {group.entries.map((entry) => {
                    const task = tasks.find((t) => t.id === entry.taskId);
                    const categoryEmoji = task
                      ? currentList?.categories[task.category]?.emoji || '📋'
                      : '📋';
                    const payer = currentListMembers.find((u) => u.id === entry.userId);
                    const payerName = payer?.name || 'Unknown';

                    return (
                      <TransactionItem
                        key={entry.id}
                        entry={entry}
                        categoryEmoji={categoryEmoji}
                        payerName={payerName}
                        currencySymbol={currencySymbol}
                        onPress={() => handleTransactionPress(entry.taskId)}
                      />
                    );
                  })}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Calendar size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No transactions this month</Text>
                <Text style={styles.emptySubtext}>
                  Failed tasks will appear here
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'stats' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category Breakdown</Text>
              {categoryBreakdown.length > 0 ? (
                categoryBreakdown.map((cat) => (
                  <CategoryCard
                    key={cat.category}
                    category={cat}
                    currencySymbol={currencySymbol}
                    onPress={() => handleCategoryPress(cat.category)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <BarChart3 size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No category data yet</Text>
                  <Text style={styles.emptySubtext}>
                    Complete tasks to see category breakdown
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Monthly Overview</Text>
              <View style={styles.overviewGrid}>
                <View style={styles.overviewCard}>
                  <View style={styles.overviewIconContainer}>
                    <DollarSign size={20} color="#3B82F6" />
                  </View>
                  <Text style={styles.overviewLabel}>Total</Text>
                  <Text style={styles.overviewValue}>
                    {currencySymbol}{totalExpenses.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.overviewCard}>
                  <View style={styles.overviewIconContainer}>
                    <Activity size={20} color="#10B981" />
                  </View>
                  <Text style={styles.overviewLabel}>Avg/Transaction</Text>
                  <Text style={styles.overviewValue}>
                    {currencySymbol}
                    {currentMonthEntries.length > 0
                      ? (totalExpenses / currentMonthEntries.length).toFixed(2)
                      : '0.00'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insights</Text>
              
              {topSpender && topSpender.amount > 0 && (
                <View style={styles.insightCard}>
                  <View style={styles.insightIcon}>
                    <TrendingUp size={20} color="#EF4444" />
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightLabel}>Top Spender</Text>
                    <Text style={styles.insightValue}>
                      {topSpender.name} • {currencySymbol}{topSpender.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}

              {mostReliable && (
                <View style={styles.insightCard}>
                  <View style={styles.insightIcon}>
                    <TrendingUp size={20} color="#10B981" />
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightLabel}>Most Reliable</Text>
                    <Text style={styles.insightValue}>
                      {mostReliable.name} • {mostReliable.count} tasks completed
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.insightCard}>
                <View style={styles.insightIcon}>
                  <Calendar size={20} color="#3B82F6" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightLabel}>Total Transactions</Text>
                  <Text style={styles.insightValue}>
                    {currentMonthEntries.length} this month
                  </Text>
                </View>
              </View>

              <View style={styles.insightCard}>
                <View style={styles.insightIcon}>
                  <Users size={20} color="#8B5CF6" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightLabel}>Active Members</Text>
                  <Text style={styles.insightValue}>
                    {memberBalances.filter((mb) => mb.transactionCount > 0).length} of {currentListMembers.length}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  memberCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  memberCountText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  tabActive: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  memberStatus: {
    fontSize: 13,
    color: '#6B7280',
  },
  memberRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberBalance: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  memberTrend: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#EF4444',
  },
  chartPlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  chartPlaceholderValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#3B82F6',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#6B7280',
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#111827',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  categoryBottom: {
    gap: 8,
  },
  categoryAmount: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  percentageBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    borderRadius: 3,
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  overviewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
});
