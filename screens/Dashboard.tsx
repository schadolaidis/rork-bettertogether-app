import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, User, Plus, CheckCircle, Flame, Target } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { TaskFormModal, TaskFormData } from '@/components/TaskFormModal';
import { AppBar } from '@/components/design-system/AppBar';
import { Card } from '@/components/design-system/Card';
import { IconButton } from '@/components/design-system/IconButton';

import { trpc } from '@/lib/trpc';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Dashboard() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { tasks, completeTask, failTask, currentList, currentListMembers, addTask, fundTargets: appFundTargets } = useApp();
  const [taskSheetVisible, setTaskSheetVisible] = useState(false);
  const [pendingJokerTaskId, setPendingJokerTaskId] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const userQuery = trpc.user.getMe.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const fundTotalsQuery = trpc.fundGoals.getTotals.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const useJokerMutation = trpc.tasks.useJokerOnTask.useMutation({
    onSuccess: async () => {
      try {
        await utils.user.getMe.invalidate();
      } catch (e) {
        console.log('[Dashboard] invalidate user.getMe error:', e);
      }
      if (pendingJokerTaskId) {
        setPendingJokerTaskId(null);
      }
    },
    onError: (error) => {
      console.log('[Dashboard] useJokerOnTask error:', error);
    },
  });

  const resolveTaskMutation = trpc.tasks.resolveTask.useMutation({
    onSuccess: (data) => {
      const maybeStatus = (data as unknown) as { status?: string };
      if (maybeStatus && maybeStatus.status === 'JOKER_AVAILABLE') {
        const taskId = pendingJokerTaskId;
        Alert.alert(
          'Joker einsetzen?',
          'Möchtest du einen Joker einsetzen?',
          [
            { text: 'Nein, Einsatz zahlen', style: 'destructive' },
            { text: 'Ja, Joker einsetzen', style: 'default', onPress: () => {
              if (taskId) {
                useJokerMutation.mutate({ task_id: taskId });
              }
            } },
          ],
        );
        return;
      }
      if ((data as any)?.id) {
        // Normal fail path completed on backend – mirror locally for now
        // to keep UI consistent without invalidations
        try {
          const taskId = (data as any).id as string;
          failTask(taskId);
        } catch (e) {
          console.log('[Dashboard] Mirror fail fallback error:', e);
        }
      }
    },
    onError: (error) => {
      console.log('[Dashboard] resolveTask error:', error);
      // If backend encodes via error in future, catch here
      const msg = (error as unknown as { message?: string }).message ?? '';
      if (msg.includes('JOKER_AVAILABLE')) {
        const taskId = pendingJokerTaskId;
        Alert.alert(
          'Joker einsetzen?',
          'Möchtest du einen Joker einsetzen?',
          [
            { text: 'Nein, Einsatz zahlen', style: 'destructive' },
            { text: 'Ja, Joker einsetzen', style: 'default', onPress: () => {
              if (taskId) {
                useJokerMutation.mutate({ task_id: taskId });
              }
            } },
          ],
        );
      }
    },
  });

  const todayTasks = useMemo(() => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    return tasks
      .filter(task => {
        const taskDate = new Date(task.startAt);
        return taskDate >= now && taskDate <= endOfDay && task.status === 'pending';
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [tasks]);

  const nextTask = todayTasks[0] || null;
  const upcomingTasks = todayTasks.slice(1, 4);
  
  const currentUser = useApp().currentUser;
  const streakCount = userQuery.data?.currentStreakCount ?? currentUser?.currentStreakCount ?? 0;
  const jokerCount = userQuery.data?.jokerCount ?? currentUser?.jokerCount ?? 0;
  const totalSavings = (fundTotalsQuery.data?.totalCollectedCents ?? appFundTargets.reduce((sum, f) => sum + (f.totalCollectedCents || 0), 0)) / 100;
  
  const fundGoals = useMemo(() => {
    const colors = [theme.primary, theme.accent, theme.success, theme.warning];
    return appFundTargets.map((fund, index) => ({
      id: fund.id,
      name: fund.name,
      emoji: fund.emoji,
      current: (fund.totalCollectedCents ?? 0) / 100,
      target: fund.targetAmountCents ? fund.targetAmountCents / 100 : undefined,
      color: colors[index % colors.length],
    }));
  }, [appFundTargets, theme]);

  const handleNotificationPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('Notifications pressed');
  };

  const handleAvatarPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('Profile pressed');
  };

  const handleAddTask = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setTaskSheetVisible(true);
  };

  const handleTaskPress = (task: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('Task pressed:', task.title || task.name);
  };

  const handleComplete = (taskId: string) => {
    console.log('[Dashboard] Completing task:', taskId);
    resolveTaskMutation.mutate({ task_id: taskId, resolution_status: 'completed' }, {
      onSuccess: () => {
        completeTask(taskId);
      },
      onError: (error) => {
        console.log('[Dashboard] Complete task error:', error);
        completeTask(taskId);
      },
    });
  };



  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppBar
        title="Heute"
        actions={
          <>
            <IconButton
              icon={<Bell size={22} color={theme.primary} />}
              onPress={handleNotificationPress}
              testID="bell-button"
            />
            <IconButton
              icon={<User size={22} color={theme.primary} />}
              onPress={handleAvatarPress}
              testID="avatar-button"
            />
          </>
        }
        testID="dashboard-appbar"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.greeting, { color: theme.textHigh }]}>
          {getGreeting()}, {userQuery.data?.name || currentUser?.name || 'Rork'}
        </Text>
        <Text style={[styles.subGreeting, { color: theme.textMedium }]}>
          {streakCount > 0 ? 'Deine Flamme wartet.' : 'Starte deine Serie!'}
        </Text>

        <View style={styles.tilesGrid}>
          <Card style={[styles.tileHero, { backgroundColor: theme.surface }]}>
            {nextTask ? (
              <>
                <View style={styles.tileHeroHeader}>
                  <Text style={[styles.tileHeroLabel, { color: theme.textMedium }]}>ALS NÄCHSTES</Text>
                  <Text style={[styles.tileHeroTime, { color: theme.primary }]}>
                    {formatTime(nextTask.startAt)}
                  </Text>
                </View>
                <Text style={[styles.tileHeroTitle, { color: theme.textHigh }]} numberOfLines={2}>
                  {nextTask.title}
                </Text>
                <View style={styles.tileHeroFooter}>
                  <View style={styles.tileHeroStake}>
                    <Text style={[styles.tileHeroStakeLabel, { color: theme.textLow }]}>Einsatz</Text>
                    <Text style={[styles.tileHeroStakeValue, { color: theme.textHigh }]}>
                      {currentList?.currencySymbol || '€'}{nextTask.stake}
                    </Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [
                      styles.tileHeroButton,
                      { backgroundColor: theme.success },
                      pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                    ]}
                    onPress={() => handleComplete(nextTask.id)}
                  >
                    <CheckCircle size={20} color="#FFFFFF" />
                    <Text style={styles.tileHeroButtonText}>Complete</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.tileHeroEmpty}>
                <Text style={styles.tileHeroEmptyEmoji}>🎉</Text>
                <Text style={[styles.tileHeroEmptyText, { color: theme.textMedium }]}>
                  No tasks today!
                </Text>
              </View>
            )}
          </Card>

          <View style={styles.tilesRow}>
            <Card style={[styles.tileSmall, { backgroundColor: theme.surface }]}>
              <View style={styles.tileSmallContent}>
                {streakCount > 0 ? (
                  <View style={[styles.tileIconContainer, { backgroundColor: `${theme.warning}15` }]}>
                    <Flame size={28} color={theme.warning} fill={theme.warning} />
                  </View>
                ) : (
                  <View style={[styles.tileIconContainer, { backgroundColor: `${theme.textLow}10` }]}>
                    <Text style={styles.tileIconEmoji}>🥚</Text>
                  </View>
                )}
                <Text style={[styles.tileSmallValue, { color: theme.textHigh }]}>
                  {streakCount}
                </Text>
                <Text style={[styles.tileSmallLabel, { color: theme.textMedium }]}>
                  Days
                </Text>
              </View>
            </Card>

            <Card style={[styles.tileSmall, { backgroundColor: theme.surface }]}>
              <View style={styles.tileSmallContent}>
                <View style={[styles.tileIconContainer, { backgroundColor: `${theme.accent}15` }]}>
                  <Text style={styles.tileIconEmoji}>🃏</Text>
                </View>
                <Text style={[styles.tileSmallValue, { color: theme.textHigh }]}>
                  {jokerCount}
                </Text>
                <Text style={[styles.tileSmallLabel, { color: theme.textMedium }]}>
                  Jokers
                </Text>
              </View>
            </Card>
          </View>

          <Card style={[styles.tileFundGoals, { backgroundColor: theme.surface }]}>
            <View style={styles.tileFundHeader}>
              <View style={styles.tileFundHeaderLeft}>
                <Target size={18} color={theme.primary} />
                <Text style={[styles.tileFundTitle, { color: theme.textHigh }]}>Fund Goals</Text>
              </View>
              <Text style={[styles.tileFundTotal, { color: theme.primary }]}>
                {currentList?.currencySymbol || '€'}{totalSavings.toFixed(2)}
              </Text>
            </View>
            <View style={styles.tileFundGoalsContainer}>
              {fundGoals.map((goal) => {
                const progress = goal.target ? (goal.current / goal.target) * 100 : 0;
                return (
                  <View key={goal.id} style={styles.tileFundGoalRow}>
                    <View style={styles.tileFundGoalInfo}>
                      <Text style={styles.tileFundGoalEmoji}>{goal.emoji}</Text>
                      <View style={styles.tileFundGoalText}>
                        <Text style={[styles.tileFundGoalName, { color: theme.textHigh }]} numberOfLines={1}>
                          {goal.name}
                        </Text>
                        {goal.target && (
                          <View style={[styles.tileFundGoalBar, { backgroundColor: `${goal.color}15` }]}>
                            <View
                              style={[
                                styles.tileFundGoalBarFill,
                                { backgroundColor: goal.color, width: `${Math.min(progress, 100)}%` },
                              ]}
                            />
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={[styles.tileFundGoalAmount, { color: theme.textMedium }]}>
                      {currentList?.currencySymbol || '€'}{goal.current.toFixed(2)}
                      {goal.target && <Text style={{ fontSize: 11, color: theme.textLow }}>/{goal.target.toFixed(0)}</Text>}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>

          {upcomingTasks.length > 0 && (
            <Card style={[styles.tileUpcoming, { backgroundColor: theme.surface }]}>
              <Text style={[styles.tileUpcomingTitle, { color: theme.textHigh }]}>
                Upcoming Tasks
              </Text>
              <View style={styles.tileUpcomingList}>
                {upcomingTasks.map((task, index) => (
                  <Pressable
                    key={task.id}
                    style={({ pressed }) => [
                      styles.tileUpcomingRow,
                      index < upcomingTasks.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.border,
                      },
                      pressed && { opacity: 0.6 },
                    ]}
                    onPress={() => handleTaskPress(task)}
                  >
                    <View style={styles.tileUpcomingRowLeft}>
                      <Text style={[styles.tileUpcomingRowTime, { color: theme.textMedium }]}>
                        {formatTime(task.startAt)}
                      </Text>
                      <Text style={[styles.tileUpcomingRowTitle, { color: theme.textHigh }]} numberOfLines={1}>
                        {task.title}
                      </Text>
                    </View>
                    <Text style={[styles.tileUpcomingRowStake, { color: theme.textLow }]}>
                      {currentList?.currencySymbol || '€'}{task.stake}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>
          )}
        </View>
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.primary,
            bottom: insets.bottom + 16,
            shadowColor: theme.primary,
          },
          pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
        ]}
        onPress={handleAddTask}
        testID="fab-add-task"
      >
        <Plus size={28} color="#FFFFFF" />
      </Pressable>

      {currentList && (
        <TaskFormModal
          visible={taskSheetVisible}
          onClose={() => setTaskSheetVisible(false)}
          onSubmit={(data: TaskFormData) => {
            addTask({
              title: data.title,
              description: data.description,
              category: data.category,
              startAt: data.startDate.toISOString(),
              endAt: data.endDate.toISOString(),
              allDay: data.allDay,
              gracePeriod: data.gracePeriod,
              stake: data.stake,
              assignedTo: data.assignedTo.length === 1 ? data.assignedTo[0] : data.assignedTo,
              priority: data.priority,
              reminder: data.reminder,
              customReminderMinutes: data.customReminderMinutes,
              recurrence: data.recurrence,
              isShared: data.isShared,
              fundTargetId: data.fundTargetId,
            });
            setTaskSheetVisible(false);
            console.log('[Dashboard] Task created:', data.title);
          }}
          categories={currentList.categories}
          members={currentListMembers}
          fundTargets={appFundTargets.map(f => ({ id: f.id, name: f.name, emoji: f.emoji }))}
          defaultGraceMinutes={currentList.defaultGraceMinutes}
          defaultStakeCents={currentList.defaultStakeCents}
          currencySymbol={currentList.currencySymbol}
          existingTasks={tasks}
        />
      )}
    </View>
  );
}

const TILE_GAP = 12 as const;
const CONTENT_PADDING = 16 as const;
const TILE_WIDTH = (SCREEN_WIDTH - CONTENT_PADDING * 2 - TILE_GAP) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: CONTENT_PADDING,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    marginBottom: 24,
  },
  tilesGrid: {
    gap: TILE_GAP,
  },
  tileHero: {
    padding: 20,
    minHeight: 180,
  },
  tileHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tileHeroLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  tileHeroTime: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  tileHeroTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    marginBottom: 20,
    lineHeight: 34,
  },
  tileHeroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tileHeroStake: {
    flex: 1,
  },
  tileHeroStakeLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  tileHeroStakeValue: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  tileHeroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tileHeroButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  tileHeroEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  tileHeroEmptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  tileHeroEmptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: TILE_GAP,
  },
  tileSmall: {
    width: TILE_WIDTH,
    padding: 16,
    minHeight: 150,
  },
  tileSmallContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconEmoji: {
    fontSize: 28,
  },
  tileSmallValue: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  tileSmallLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  tileFundGoals: {
    padding: 18,
  },
  tileFundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tileFundHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tileFundTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  tileFundTotal: {
    fontSize: 19,
    fontWeight: '700' as const,
  },
  tileFundGoalsContainer: {
    gap: 14,
  },
  tileFundGoalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileFundGoalInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 12,
  },
  tileFundGoalEmoji: {
    fontSize: 18,
  },
  tileFundGoalText: {
    flex: 1,
    gap: 6,
  },
  tileFundGoalName: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  tileFundGoalBar: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  tileFundGoalBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  tileFundGoalAmount: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  tileUpcoming: {
    padding: 18,
  },
  tileUpcomingTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  tileUpcomingList: {
    gap: 0,
  },
  tileUpcomingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tileUpcomingRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tileUpcomingRowTime: {
    fontSize: 13,
    fontWeight: '600' as const,
    width: 48,
  },
  tileUpcomingRowTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    flex: 1,
  },
  tileUpcomingRowStake: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
