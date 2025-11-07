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
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { SwipeableTaskCard } from '@/components/interactive/SwipeableTaskCard';
import { DesignTokens } from '@/constants/design-tokens';
import { Task } from '@/types';
import { ClockService } from '@/services/ClockService';
import { Card } from '@/components/design-system/Card';
import { trpc } from '@/lib/trpc';

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
  } = useApp();

  const [showListSwitcher, setShowListSwitcher] = useState(false);

  const currencySymbol = currentList?.currencySymbol || '€';

  const fundTotalsQuery = trpc.fundGoals.getTotals.useQuery(undefined, {
    staleTime: 30_000,
  });

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
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <CheckCircle size={80} color="#10B981" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>Alles erledigt!</Text>
            <Text style={styles.emptySubtitle}>
              Du hast für heute alle Aufgaben geschafft. Genieße deinen Tag!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                router.push('/(tabs)/tasks');
              }}
              activeOpacity={0.8}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Neue Aufgabe</Text>
            </TouchableOpacity>
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

        <View style={styles.glanceSection} testID="glance-section">
          <Text style={styles.glanceHeader}>Auf einen Blick</Text>

          <View style={styles.glanceCards}>
            <Card style={styles.glanceCard} testID="glance-group-fund">
              <Text style={styles.glanceCardTitle}>Gruppen-Topf</Text>
              <Text style={styles.glanceCardValue} testID="group-fund-total">
                {(() => {
                  const cents = fundTotalsQuery.data?.totalCollectedCents ?? 0;
                  const euros = cents / 100;
                  try {
                    return euros.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
                  } catch (e) {
                    console.log('[Dashboard] Currency format error', e);
                    return `€${euros.toFixed(2)}`;
                  }
                })()}
              </Text>
            </Card>

            <Card style={styles.glanceCard} testID="glance-streak">
              <Text style={styles.glanceCardTitle}>Streak</Text>
              <Text style={styles.glanceCardValue}>🔥 0-Tage Serie</Text>
            </Card>

            <Card style={styles.glanceCard} testID="glance-joker">
              <Text style={styles.glanceCardTitle}>Joker</Text>
              <Text style={styles.glanceCardValue}>🃏 0 Joker verfügbar</Text>
            </Card>
          </View>
        </View>
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: DesignTokens.spacing.xl,
  },
  emptyIcon: {
    marginBottom: DesignTokens.spacing.xl,
    opacity: 0.9,
  },
  emptyTitle: {
    ...DesignTokens.typography.displayMedium,
    color: DesignTokens.colors.neutral[900],
    marginBottom: DesignTokens.spacing.sm,
    textAlign: 'center',
    fontWeight: '700' as const,
    fontSize: 26,
  },
  emptySubtitle: {
    ...DesignTokens.typography.bodyLarge,
    color: DesignTokens.colors.neutral[600],
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.xxl,
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: DesignTokens.spacing.xxl,
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: DesignTokens.radius.md,
    ...DesignTokens.shadow.md,
  },
  emptyButtonText: {
    ...DesignTokens.typography.bodyLarge,
    fontWeight: '700' as const,
    color: DesignTokens.colors.neutral[0],
  },
  glanceSection: {
    marginTop: DesignTokens.spacing.xxl,
  },
  glanceHeader: {
    ...DesignTokens.typography.headingMedium,
    fontWeight: '700' as const,
    color: DesignTokens.colors.neutral[900],
    marginBottom: DesignTokens.spacing.md,
  },
  glanceCards: {
    gap: DesignTokens.spacing.md,
  },
  glanceCard: {
    borderRadius: 16,
  },
  glanceCardTitle: {
    ...DesignTokens.typography.labelSmall,
    color: DesignTokens.colors.neutral[600],
    marginBottom: 6,
    fontWeight: '600' as const,
  },
  glanceCardValue: {
    ...DesignTokens.typography.headingLarge,
    color: DesignTokens.colors.neutral[900],
    fontWeight: '700' as const,
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
