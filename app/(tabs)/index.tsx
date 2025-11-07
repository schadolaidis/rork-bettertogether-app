import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  Animated,
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
  Flame,
  Egg,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { SwipeableTaskCard } from '@/components/interactive/SwipeableTaskCard';
import { DesignTokens } from '@/constants/design-tokens';
import { Task, FundTarget } from '@/types';
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
    fundTargets,
  } = useApp();

  const [showListSwitcher, setShowListSwitcher] = useState(false);

  const currencySymbol = currentList?.currencySymbol || '€';

  const fundTotalsQuery = trpc.fundGoals.getTotals.useQuery(undefined, {
    staleTime: 30_000,
  });

  const meQuery = trpc.user.getMe.useQuery(undefined, {
    staleTime: 30_000,
  });

  const utils = trpc.useUtils();

  const resolveTaskMutation = trpc.tasks.resolveTask.useMutation({
    onSuccess: async () => {
      try {
        await Promise.all([
          utils.tasks.invalidate(),
          utils.fundGoals.getTotals.invalidate(),
          utils.user.getMe.invalidate(),
        ]);
      } catch (e) {
        console.log('[Dashboard] Invalidate error', e);
      }
    },
    onError: (e) => {
      console.log('[Dashboard] resolveTask mutation error', e);
    },
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

  const nextTask: Task | undefined = useMemo(() => {
    const schedulable = tasks.filter((t) => (t.status === 'pending' || t.status === 'overdue') && t.startAt);
    const sorted = [...schedulable].sort((a, b) => new Date(a.startAt as string).getTime() - new Date(b.startAt as string).getTime());
    return sorted[0];
  }, [tasks]);

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
      resolveTaskMutation.mutate({ task_id: taskId, resolution_status: 'completed' });
    },
    [completeTask, resolveTaskMutation]
  );

  const handleFailTask = useCallback(
    (taskId: string) => {
      failTask(taskId);
      resolveTaskMutation.mutate({ task_id: taskId, resolution_status: 'failed' });
    },
    [failTask, resolveTaskMutation]
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
            <Text style={styles.greeting} testID="greeting-text">
              {(() => {
                const name = meQuery.data?.name ?? currentUser?.name ?? '';
                const hour = new Date().getHours();
                const msg = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';
                return `${msg}${name ? `, ${name}` : ''}.`;
              })()}
            </Text>
            <Text style={styles.subGreeting}>Deine Flamme wartet.</Text>
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
            testID="open-list-switcher"
          >
            <Users size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Card style={styles.streakHero} testID="streak-hero">
          <View style={styles.streakLeft}>
            {(() => {
              const streak = meQuery.data?.currentStreakCount ?? 0;
              if (streak === 0) {
                return (
                  <View style={styles.eggBadge}>
                    <Egg size={36} color="#6B7280" />
                  </View>
                );
              }
              return (
                <Animated.View style={[styles.flameBadge, { transform: [{ scale: new Animated.Value(1) }] }]}>
                  <Flame size={36} color="#F97316" />
                </Animated.View>
              );
            })()}
            <View style={styles.streakTexts}>
              <Text style={styles.streakLabel}>{(meQuery.data?.currentStreakCount ?? 0) > 0 ? 'Weiter so!' : 'Starte deine Serie!'}</Text>
              <Text style={styles.streakValue} testID="streak-current-hero">
                {meQuery.data?.currentStreakCount ?? 0} Tage
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.streakCta}
            onPress={() => router.push('/(tabs)/tasks')}
            activeOpacity={0.8}
            testID="streak-cta"
          >
            <Text style={styles.streakCtaText}>Jetzt loslegen</Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </Card>

        {nextTask && (
          <Card style={styles.nextTaskCard} testID="next-task-card">
            <View style={styles.nextTaskHeader}>
              <Text style={styles.nextTaskLabel}>Als Nächstes</Text>
              <Text style={styles.nextTaskTime}>
                {(() => {
                  const d = new Date(nextTask.startAt as string);
                  try {
                    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                  } catch (e) {
                    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
                  }
                })()}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleTaskPress(nextTask)} activeOpacity={0.8}>
              <Text style={styles.nextTaskTitle} numberOfLines={2}>{nextTask.title}</Text>
            </TouchableOpacity>
          </Card>
        )}

        {fundTargets && fundTargets.length > 0 && (
          <View style={styles.ringsSection} testID="fund-rings-section">
            <Text style={styles.ringsHeader}>Sparziele</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ringsRow}>
              {fundTargets.slice(0, 5).map((f: FundTarget) => {
                const target = f.targetAmountCents ?? undefined;
                const total = f.totalCollectedCents ?? 0;
                const progress = target ? Math.min(total / target, 1) : 0;
                return (
                  <View key={f.id} style={styles.ringCard} testID={`fund-ring-${f.id}`}>
                    <View style={styles.ringCircleOuter}>
                      <View style={styles.ringTrack} />
                      <View style={[styles.ringFill, { height: `${progress * 100}%` }]} />
                      <Text style={styles.ringEmoji}>{f.emoji}</Text>
                    </View>
                    <Text numberOfLines={1} style={styles.ringName}>{f.name}</Text>
                    <Text style={styles.ringAmount}>
                      {currencySymbol}{(total/100).toFixed(2)}{target ? ` / ${(target/100).toFixed(0)}€` : ''}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

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
              <Text style={styles.glanceCardValue} testID="streak-current">
                {(() => {
                  const count = meQuery.data?.currentStreakCount ?? 0;
                  return `🔥 ${count}-Tage Serie`;
                })()}
              </Text>
            </Card>

            <Card style={styles.glanceCard} testID="glance-joker">
              <Text style={styles.glanceCardTitle}>Joker</Text>
              <Text style={styles.glanceCardValue} testID="joker-available">
                {(() => {
                  const count = meQuery.data?.jokerCount ?? 0;
                  return `🃏 ${count} Joker verfügbar`;
                })()}
              </Text>
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
  greeting: {
    ...DesignTokens.typography.displayMedium,
    color: DesignTokens.colors.neutral[900],
    fontWeight: '800' as const,
    fontSize: 26,
    letterSpacing: -0.5,
  },
  subGreeting: {
    ...DesignTokens.typography.bodyLarge,
    color: DesignTokens.colors.neutral[600],
    marginTop: 4,
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
  streakHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    marginBottom: DesignTokens.spacing.xl,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flameBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEDD5',
  },
  eggBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  streakTexts: {
    gap: 2,
  },
  streakLabel: {
    ...DesignTokens.typography.labelSmall,
    color: '#FB923C',
    fontWeight: '700' as const,
  },
  streakValue: {
    ...DesignTokens.typography.headingLarge,
    fontWeight: '800' as const,
    color: DesignTokens.colors.neutral[900],
  },
  streakCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F97316',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  streakCtaText: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },

  nextTaskCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#ECFEFF',
    marginBottom: DesignTokens.spacing.xl,
  },
  nextTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextTaskLabel: {
    ...DesignTokens.typography.labelSmall,
    color: '#0EA5E9',
    fontWeight: '800' as const,
    letterSpacing: 0.2,
  },
  nextTaskTime: {
    ...DesignTokens.typography.labelSmall,
    color: DesignTokens.colors.neutral[600],
  },
  nextTaskTitle: {
    ...DesignTokens.typography.headingLarge,
    fontWeight: '800' as const,
    color: DesignTokens.colors.neutral[900],
  },

  ringsSection: {
    marginBottom: DesignTokens.spacing.xxl,
  },
  ringsHeader: {
    ...DesignTokens.typography.headingMedium,
    fontWeight: '700' as const,
    color: DesignTokens.colors.neutral[900],
    marginBottom: DesignTokens.spacing.md,
  },
  ringsRow: {
    gap: 12,
  },
  ringCard: {
    width: 120,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    alignItems: 'center',
  },
  ringCircleOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
    position: 'relative',
  },
  ringTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: '#E5E7EB',
  },
  ringFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3B82F6',
  },
  ringEmoji: {
    position: 'absolute',
    top: 18,
    fontSize: 22,
  },
  ringName: {
    ...DesignTokens.typography.labelSmall,
    color: DesignTokens.colors.neutral[900],
    fontWeight: '700' as const,
  },
  ringAmount: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[600],
    marginTop: 2,
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
