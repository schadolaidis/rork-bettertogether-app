import React, { useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  X,
  ChevronDown,
  Check,
  Plus,
  CheckSquare,
  Target,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { FundHero } from '@/components/FundHero';
import { SectionHeader } from '@/components/design-system/SectionHeader';
import { StreaksFundCard } from '@/components/StreaksFundCard';
import { StatCard } from '@/components/design-system/StatCard';
import { DesignTokens } from '@/constants/design-tokens';
import { InsightData, DashboardService } from '@/services/DashboardService';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    dashboardStats,
    tasks,
    allTasks,
    currentUser,
    currentList,
    currentListMembers,
    lists,
    switchList,
    ledgerEntries,
    currentListId,
    fundTargets,
  } = useApp();

  const [showListSwitcher, setShowListSwitcher] = useState(false);

  const activeFundTargets = useMemo(() => {
    return fundTargets;
  }, [fundTargets]);

  const currencySymbol = currentList?.currencySymbol || '$';
  const totalBalance = dashboardStats?.totalBalance ?? 0;
  const balanceColor = totalBalance >= 0 ? '#10B981' : '#EF4444';
  const balanceSign = totalBalance >= 0 ? '+' : '';

  const handleOpenTasksTap = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/tasks');
  }, [router]);

  const handleOverdueTasksTap = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/tasks');
  }, [router]);

  const handleCompletedTasksTap = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/tasks');
  }, [router]);

  const handleBalanceTap = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/balances?month=current');
  }, [router]);

  const handleInsightAction = useCallback(
    (insight: InsightData) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      if (insight.action) {
        router.push(insight.action.route as any);
      }
    },
    [router]
  );

  const insights = dashboardStats.insights || [];
  const hasInsights = insights.length > 0;

  const getInsightColor = (type: InsightData['type']) => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'alert':
        return '#EF4444';
      case 'info':
      default:
        return '#3B82F6';
    }
  };

  const getInsightIcon = (icon: InsightData['icon'], color: string) => {
    switch (icon) {
      case 'check':
        return <CheckCircle2 size={18} color={color} />;
      case 'alert':
        return <AlertCircle size={18} color={color} />;
      case 'trending':
        return <TrendingUp size={18} color={color} />;
      case 'target':
        return <Target size={18} color={color} />;
      default:
        return <Sparkles size={18} color={color} />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{currentUser?.name || 'User'}</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: currentUser?.color || '#3B82F6' }]}>
            <Text style={styles.avatarText}>
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.listBanner}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setShowListSwitcher(true);
          }}
          activeOpacity={0.7}
        >
          <Users size={16} color="#3B82F6" />
          <Text style={styles.listName}>{currentList?.name || 'List'}</Text>
          <Text style={styles.listMembers}>
            {currentListMembers.length} member{currentListMembers.length !== 1 ? 's' : ''}
          </Text>
          <ChevronDown size={16} color="#3B82F6" />
        </TouchableOpacity>

        {hasInsights && (
          <View style={styles.insightsSection}>
            <View style={styles.insightsHeader}>
              <Sparkles size={16} color="#8B5CF6" />
              <Text style={styles.insightsSectionTitle}>Smart Insights</Text>
            </View>
            <View style={styles.insightsContainer}>
              {insights.slice(0, 3).map((insight, index) => {
                const color = getInsightColor(insight.type);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.insightCard,
                      { borderLeftColor: color, backgroundColor: `${color}08` },
                    ]}
                    onPress={() => handleInsightAction(insight)}
                    activeOpacity={insight.action ? 0.7 : 1}
                    disabled={!insight.action}
                  >
                    <View style={styles.insightIconContainer}>
                      {getInsightIcon(insight.icon, color)}
                    </View>
                    <View style={styles.insightContent}>
                      <Text style={[styles.insightText, { color: DesignTokens.colors.neutral[900] }]}>
                        {insight.message}
                      </Text>
                      {insight.action && (
                        <Text style={[styles.insightAction, { color }]}>
                          {insight.action.label}
                        </Text>
                      )}
                    </View>
                    {insight.action && (
                      <ChevronRight size={16} color={color} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <FundHero
          ledgerEntries={ledgerEntries}
          tasks={tasks}
          currentListId={currentListId}
          currencySymbol={currencySymbol}
        />

        <View style={styles.statsGrid}>
          <StatCard
            icon={<Clock size={24} color={'#3B82F6'} />}
            label="Open Tasks"
            value={String(dashboardStats.openTasks)}
            color={'#3B82F6'}
            onPress={handleOpenTasksTap}
            testID="stat-open-tasks"
          />
          <StatCard
            icon={<AlertCircle size={24} color={'#F59E0B'} />}
            label="Overdue"
            value={String(dashboardStats.overdueTasks)}
            color={'#F59E0B'}
            onPress={handleOverdueTasksTap}
            testID="stat-overdue-tasks"
          />
          <StatCard
            icon={<CheckCircle2 size={24} color={'#10B981'} />}
            label="Completed"
            value={String(dashboardStats.completedThisMonth)}
            color={'#10B981'}
            onPress={handleCompletedTasksTap}
            testID="stat-completed-tasks"
          />
          <StatCard
            icon={totalBalance >= 0 ? (
              <TrendingUp size={24} color={balanceColor} />
            ) : (
              <TrendingDown size={24} color={balanceColor} />
            )}
            label="Balance"
            value={`${balanceSign}${currencySymbol}${Math.abs(totalBalance).toFixed(2)}`}
            color={balanceColor}
            onPress={handleBalanceTap}
            testID="stat-balance"
          />
        </View>

        <SectionHeader 
          title="FUND GOALS" 
          subtitle={`${activeFundTargets.length} active`}
          action={{ label: 'Manage', onPress: () => router.push('/settings/funds') }}
        />

        {activeFundTargets.length > 0 && (
          <View style={styles.fundGoalsSection}>
            <View style={styles.fundGoalsHeader}>
              <Text style={styles.fundGoalsTitle}>Your Fund Goals</Text>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push('/settings/funds');
                }}
                activeOpacity={0.7}
              >
                <Target size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            {activeFundTargets.map((target) => {
              const targetAmountDollars = target.targetAmountCents ? target.targetAmountCents / 100 : undefined;
              const collectedAmountDollars = target.totalCollectedCents / 100;
              const fundProgress = DashboardService.getFundGoalProgress(target, tasks);

              return (
                <StreaksFundCard
                  key={target.id}
                  emoji={target.emoji}
                  name={target.name}
                  description={target.description}
                  collectedAmount={collectedAmountDollars}
                  targetAmount={targetAmountDollars}
                  linkedTasksCount={fundProgress.linkedTasks}
                  currencySymbol={currencySymbol}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    router.push(`/tasks?fundTargetId=${target.id}`);
                  }}
                />
              );
            })}
          </View>
        )}

        {activeFundTargets.length === 0 && (
          <View style={styles.emptyFundsState}>
            <View style={styles.emptyFundsIcon}>
              <Target size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyFundsTitle}>No Fund Goals Yet</Text>
            <Text style={styles.emptyFundsText}>
              Create fund goals to track your savings and achievements
            </Text>
            <TouchableOpacity
              style={styles.createFundButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                router.push('/settings/funds');
              }}
              activeOpacity={0.8}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.createFundButtonText}>Create Fund Goal</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showListSwitcher}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowListSwitcher(false)}
      >
        <View style={listSwitcherStyles.container}>
          <View style={listSwitcherStyles.header}>
            <Text style={listSwitcherStyles.title}>Switch List</Text>
            <TouchableOpacity
              style={listSwitcherStyles.closeButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowListSwitcher(false);
              }}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={listSwitcherStyles.scroll}
            contentContainerStyle={listSwitcherStyles.content}
          >
            {lists
              .filter((l) => !l.archived)
              .map((list) => {
                const listTasks = allTasks.filter((t) => t.listId === list.id);
                const openTasks = listTasks.filter(
                  (t) => t.status === 'pending' || t.status === 'overdue'
                ).length;
                const isActive = list.id === currentList?.id;

                return (
                  <TouchableOpacity
                    key={list.id}
                    style={[
                      listSwitcherStyles.listCard,
                      isActive && listSwitcherStyles.listCardActive,
                    ]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                      switchList(list.id);
                      setShowListSwitcher(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={listSwitcherStyles.listCardContent}>
                      <View style={listSwitcherStyles.listCardHeader}>
                        <Text
                          style={[
                            listSwitcherStyles.listCardName,
                            isActive && listSwitcherStyles.listCardNameActive,
                          ]}
                        >
                          {list.name}
                        </Text>
                        {isActive && (
                          <View style={listSwitcherStyles.activeIndicator}>
                            <Check size={16} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <View style={listSwitcherStyles.listCardMeta}>
                        <View style={listSwitcherStyles.listCardMetaItem}>
                          <Users size={14} color="#6B7280" />
                          <Text style={listSwitcherStyles.listCardMetaText}>
                            {list.memberIds.length} member{list.memberIds.length !== 1 ? 's' : ''}
                          </Text>
                        </View>
                        <View style={listSwitcherStyles.listCardMetaItem}>
                          <CheckSquare size={14} color="#6B7280" />
                          <Text style={listSwitcherStyles.listCardMetaText}>
                            {openTasks} open task{openTasks !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

            <TouchableOpacity
              style={listSwitcherStyles.createButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowListSwitcher(false);
                router.push('/settings/teams');
              }}
              activeOpacity={0.7}
            >
              <View style={listSwitcherStyles.createIcon}>
                <Plus size={20} color="#3B82F6" />
              </View>
              <Text style={listSwitcherStyles.createText}>Create New List</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: DesignTokens.spacing.xl,
    paddingBottom: DesignTokens.spacing.xxxl * 1.25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.lg,
  },
  greeting: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[600],
  },
  userName: {
    ...DesignTokens.typography.displayMedium,
    color: DesignTokens.colors.neutral[900],
    marginTop: DesignTokens.spacing.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: DesignTokens.colors.neutral[0],
    fontSize: 20,
    fontWeight: '600' as const,
  },
  listBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    backgroundColor: DesignTokens.colors.primary[50],
    borderRadius: DesignTokens.radius.md,
    marginBottom: DesignTokens.spacing.lg,
  },
  listName: {
    ...DesignTokens.typography.bodyMedium,
    fontWeight: '600',
    color: DesignTokens.colors.primary[700],
    flex: 1,
  },
  listMembers: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[600],
  },
  insightsSection: {
    marginBottom: DesignTokens.spacing.xl,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
    marginBottom: DesignTokens.spacing.md,
  },
  insightsSectionTitle: {
    ...DesignTokens.typography.bodyMedium,
    fontWeight: '700',
    color: DesignTokens.colors.neutral[900],
  },
  insightsContainer: {
    gap: DesignTokens.spacing.sm,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.radius.md,
    borderLeftWidth: 3,
    gap: DesignTokens.spacing.sm,
    ...DesignTokens.shadow.sm,
  },
  insightIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
    gap: 2,
  },
  insightText: {
    ...DesignTokens.typography.bodyMedium,
    lineHeight: 18,
  },
  insightAction: {
    ...DesignTokens.typography.labelSmall,
    fontWeight: '600',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.xxxl,
  },

  fundGoalsSection: {
    marginBottom: DesignTokens.spacing.xxl,
  },
  fundGoalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.xl,
  },
  fundGoalsTitle: {
    ...DesignTokens.typography.headingLarge,
    color: DesignTokens.colors.neutral[900],
  },
  emptyFundsState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: DesignTokens.spacing.xxxl * 1.25,
  },
  emptyFundsIcon: {
    marginBottom: DesignTokens.spacing.xl,
    opacity: 0.3,
  },
  emptyFundsTitle: {
    ...DesignTokens.typography.headingMedium,
    color: DesignTokens.colors.neutral[900],
    marginBottom: DesignTokens.spacing.sm,
    textAlign: 'center',
  },
  emptyFundsText: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[600],
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.xxl,
    lineHeight: 22,
  },
  createFundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: DesignTokens.spacing.xxl,
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: DesignTokens.radius.md,
    ...DesignTokens.shadow.md,
  },
  createFundButtonText: {
    ...DesignTokens.typography.bodyLarge,
    fontWeight: '700',
    color: DesignTokens.colors.neutral[0],
  },
});

const listSwitcherStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingVertical: DesignTokens.spacing.lg,
    backgroundColor: DesignTokens.colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[200],
  },
  title: {
    ...DesignTokens.typography.headingLarge,
    color: DesignTokens.colors.neutral[900],
  },
  closeButton: {
    padding: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.radius.sm,
    backgroundColor: DesignTokens.colors.neutral[100],
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: DesignTokens.spacing.xl,
    gap: DesignTokens.spacing.md,
  },
  listCard: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    padding: DesignTokens.spacing.lg,
    borderWidth: 2,
    borderColor: DesignTokens.colors.neutral[100],
    ...DesignTokens.shadow.sm,
  },
  listCardActive: {
    borderColor: DesignTokens.colors.primary[500],
    backgroundColor: DesignTokens.colors.primary[50],
  },
  listCardContent: {
    gap: DesignTokens.spacing.md,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCardName: {
    ...DesignTokens.typography.headingSmall,
    color: DesignTokens.colors.neutral[900],
    flex: 1,
  },
  listCardNameActive: {
    color: DesignTokens.colors.primary[700],
  },
  activeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DesignTokens.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCardMeta: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.lg,
  },
  listCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs * 1.5,
  },
  listCardMetaText: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[600],
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.xl,
    paddingHorizontal: DesignTokens.spacing.lg,
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    borderWidth: 2,
    borderColor: DesignTokens.colors.primary[500],
    borderStyle: 'dashed',
    marginTop: DesignTokens.spacing.sm,
  },
  createIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  createText: {
    ...DesignTokens.typography.bodyLarge,
    fontWeight: '600',
    color: DesignTokens.colors.primary[500],
  },
});
