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
  Users,
  X,
  Check,
  Plus,
  CheckSquare,
  CheckCircle,
  TrendingUp,
  AlertCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { SwipeableTaskCard } from '@/components/interactive/SwipeableTaskCard';
import { DesignTokens } from '@/constants/design-tokens';
import { Task } from '@/types';
import { ClockService } from '@/services/ClockService';
import { FundHero } from '@/components/FundHero';
import { StreaksFundCard } from '@/components/StreaksFundCard';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    tasks,
    allTasks,
    currentUser,
    currentList,
    currentListMembers,
    lists,
    switchList,
    currentListId,
    completeTask,
    failTask,
    fundTargets,
    ledgerEntries,
    dashboardStats,
  } = useApp();

  const [showListSwitcher, setShowListSwitcher] = useState(false);

  const currencySymbol = currentList?.currencySymbol || '€';

  const now = useMemo(() => ClockService.getCurrentTime(), []);
  
  const { todayStart, todayEnd, tomorrowEnd } = useMemo(() => {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const tomorrowEnd = new Date(end);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    return { todayStart: start, todayEnd: end, tomorrowEnd };
  }, [now]);

  const overdueTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.status !== 'pending' && t.status !== 'overdue') return false;
        if (!t.startAt) return false;
        const dueDate = new Date(t.startAt);
        return dueDate < todayStart;
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [tasks, todayStart]);

  const dueTodayTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.status !== 'pending' && t.status !== 'overdue') return false;
        if (!t.startAt) return false;
        const dueDate = new Date(t.startAt);
        return dueDate >= todayStart && dueDate < todayEnd;
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [tasks, todayStart, todayEnd]);

  const dueTomorrowTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.status !== 'pending') return false;
        if (!t.startAt) return false;
        const dueDate = new Date(t.startAt);
        return dueDate >= todayEnd && dueDate < tomorrowEnd;
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [tasks, todayEnd, tomorrowEnd]);

  const hasAnyTasks = overdueTasks.length > 0 || dueTodayTasks.length > 0 || dueTomorrowTasks.length > 0;

  const formatDateHeader = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return `Heute, ${now.toLocaleDateString('de-DE', options)}`;
  };

  const handleTaskPress = useCallback(
    (task: Task) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      router.push(`/task-detail?id=${task.id}` as any);
    },
    [router]
  );

  const handleCompleteTask = useCallback(
    (taskId: string) => {
      completeTask(taskId);
    },
    [completeTask]
  );

  const handleFailTask = useCallback(
    (taskId: string) => {
      failTask(taskId);
    },
    [failTask]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.dateHeader}>{formatDateHeader()}</Text>
          </View>
          <TouchableOpacity
            style={styles.listBadge}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowListSwitcher(true);
            }}
            activeOpacity={0.7}
          >
            <Users size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {!hasAnyTasks && (
          <View style={styles.emptyStateCard}>
            <CheckCircle size={48} color="#10B981" strokeWidth={2} />
            <Text style={styles.emptyStateTitle}>Alles erledigt!</Text>
            <Text style={styles.emptyStateSubtitle}>
              Du hast für heute alle Aufgaben geschafft. Genieße deinen Tag!
            </Text>
          </View>
        )}

        {overdueTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.sectionDot, { backgroundColor: '#EF4444' }]} />
                <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>
                  Überfällig
                </Text>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{overdueTasks.length}</Text>
              </View>
            </View>
            <View style={styles.taskList}>
              {overdueTasks.map((task) => (
                <SwipeableTaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onFail={handleFailTask}
                  onPress={handleTaskPress}
                  currencySymbol={currencySymbol}
                  showStatus={false}
                />
              ))}
            </View>
          </View>
        )}

        {dueTodayTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.sectionDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={[styles.sectionTitle, { color: '#1F2937' }]}>
                  Heute fällig
                </Text>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{dueTodayTasks.length}</Text>
              </View>
            </View>
            <View style={styles.taskList}>
              {dueTodayTasks.map((task) => (
                <SwipeableTaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onFail={handleFailTask}
                  onPress={handleTaskPress}
                  currencySymbol={currencySymbol}
                  showStatus={false}
                />
              ))}
            </View>
          </View>
        )}

        {dueTomorrowTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.sectionDot, { backgroundColor: '#9CA3AF' }]} />
                <Text style={[styles.sectionTitle, { color: '#6B7280' }]}>
                  Demnächst
                </Text>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{dueTomorrowTasks.length}</Text>
              </View>
            </View>
            <View style={styles.taskList}>
              {dueTomorrowTasks.map((task) => (
                <SwipeableTaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onFail={handleFailTask}
                  onPress={handleTaskPress}
                  currencySymbol={currencySymbol}
                  showStatus={false}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.glanceSection}>
          <Text style={styles.glanceHeader}>Auf einen Blick</Text>
        </View>

        {currentUser && (
          <View style={styles.streakJokerCard}>
            <View style={styles.streakJokerRow}>
              {currentUser.currentStreakCount > 1 && (
                <View style={styles.streakJokerItem}>
                  <Text style={styles.streakJokerEmoji}>🔥</Text>
                  <View>
                    <Text style={styles.streakJokerLabel}>Serie</Text>
                    <Text style={styles.streakJokerValue}>
                      {currentUser.currentStreakCount}-Tage
                    </Text>
                  </View>
                </View>
              )}
              {currentUser.currentStreakCount > 1 && currentUser.jokerCount > 0 && (
                <View style={styles.streakDivider} />
              )}
              {currentUser.jokerCount > 0 && (
                <View style={styles.streakJokerItem}>
                  <Text style={styles.streakJokerEmoji}>🃏</Text>
                  <View>
                    <Text style={styles.streakJokerLabel}>Joker</Text>
                    <Text style={styles.streakJokerValue}>
                      {currentUser.jokerCount} verfügbar
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        <FundHero
          ledgerEntries={ledgerEntries}
          tasks={allTasks}
          currentListId={currentListId}
          currencySymbol={currencySymbol}
        />

        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}
            activeOpacity={0.7}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/(tabs)/funds');
            }}
          >
            <View style={styles.statIconContainer}>
              <TrendingUp size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.statLabel}>Dieser Monat</Text>
            <Text style={[styles.statValue, { color: '#8B5CF6' }]}>+{currencySymbol}{dashboardStats.currentMonthMetrics.fundGrowth.toFixed(2)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { borderLeftColor: '#EF4444' }]}
            activeOpacity={0.7}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <View style={styles.statIconContainer}>
              <AlertCircle size={20} color="#EF4444" />
            </View>
            <Text style={styles.statLabel}>Gescheiterte Aufgaben</Text>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{dashboardStats.currentMonthMetrics.failedTasks}</Text>
          </TouchableOpacity>
        </View>

        {fundTargets.length > 0 && (
          <View style={styles.fundsPreview}>
            {fundTargets.slice(0, 2).map((fund) => {
              const linkedTasks = allTasks.filter((t) => t.fundTargetId === fund.id).length;
              return (
                <StreaksFundCard
                  key={fund.id}
                  emoji={fund.emoji}
                  name={fund.name}
                  description={fund.description}
                  collectedAmount={fund.totalCollectedCents / 100}
                  targetAmount={fund.targetAmountCents ? fund.targetAmountCents / 100 : undefined}
                  linkedTasksCount={linkedTasks}
                  currencySymbol={currencySymbol}
                  onPress={() => {
                    router.push('/(tabs)/funds');
                  }}
                />
              );
            })}
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
    marginBottom: DesignTokens.spacing.xxl,
  },
  headerLeft: {
    flex: 1,
  },
  dateHeader: {
    ...DesignTokens.typography.displayMedium,
    color: DesignTokens.colors.neutral[900],
    fontWeight: '700' as const,
    fontSize: 22,
  },
  listBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadow.sm,
  },
  section: {
    marginBottom: DesignTokens.spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    ...DesignTokens.typography.headingMedium,
    fontWeight: '700' as const,
    fontSize: 18,
  },
  sectionBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DesignTokens.colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  sectionBadgeText: {
    ...DesignTokens.typography.labelSmall,
    fontWeight: '700' as const,
    color: DesignTokens.colors.neutral[700],
    fontSize: 13,
  },
  taskList: {
    gap: DesignTokens.spacing.sm,
  },
  emptyStateCard: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    padding: DesignTokens.spacing.xxl,
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.xxl,
    ...DesignTokens.shadow.sm,
  },
  emptyStateTitle: {
    ...DesignTokens.typography.headingLarge,
    color: DesignTokens.colors.neutral[900],
    marginTop: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.xs,
    textAlign: 'center',
    fontWeight: '700' as const,
  },
  emptyStateSubtitle: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  glanceSection: {
    marginBottom: DesignTokens.spacing.lg,
  },
  glanceHeader: {
    ...DesignTokens.typography.headingMedium,
    color: DesignTokens.colors.neutral[900],
    fontWeight: '700' as const,
    fontSize: 20,
  },
  streakJokerCard: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    padding: DesignTokens.spacing.lg,
    marginBottom: DesignTokens.spacing.lg,
    ...DesignTokens.shadow.sm,
  },
  streakJokerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakJokerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
  },
  streakJokerEmoji: {
    fontSize: 32,
  },
  streakJokerLabel: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[600],
    marginBottom: 2,
  },
  streakJokerValue: {
    ...DesignTokens.typography.bodyLarge,
    fontWeight: '700' as const,
    color: DesignTokens.colors.neutral[900],
  },
  streakDivider: {
    width: 1,
    backgroundColor: DesignTokens.colors.neutral[200],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    padding: DesignTokens.spacing.lg,
    borderLeftWidth: 4,
    ...DesignTokens.shadow.sm,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  statLabel: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[600],
    marginBottom: DesignTokens.spacing.xs,
  },
  statValue: {
    ...DesignTokens.typography.headingMedium,
    fontWeight: '800' as const,
  },
  fundsPreview: {
    marginBottom: DesignTokens.spacing.lg,
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
