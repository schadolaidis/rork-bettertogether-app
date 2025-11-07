import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, User, Plus, CheckCircle, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { AppBar } from '@/components/design-system/AppBar';
import { Card } from '@/components/design-system/Card';
import { IconButton } from '@/components/design-system/IconButton';
import { TaskEditSheet } from '@/screens/TaskEditSheet';
import { trpc } from '@/lib/trpc';

export default function Dashboard() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { tasks, completeTask, failTask, currentList } = useApp();
  const [taskSheetVisible, setTaskSheetVisible] = useState(false);
  const [pendingJokerTaskId, setPendingJokerTaskId] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const userQuery = trpc.user.getMe.useQuery();
  const fundTotalsQuery = trpc.fundGoals.getTotals.useQuery();

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
  
  const streakCount = userQuery.data?.currentStreakCount ?? 0;
  const jokerCount = userQuery.data?.jokerCount ?? 0;
  const totalSavings = (fundTotalsQuery.data?.totalCollectedCents ?? 0) / 100;

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
    completeTask(taskId);
    resolveTaskMutation.mutate({ task_id: taskId, resolution_status: 'completed' });
  };

  const handleFail = (taskId: string) => {
    console.log('[Dashboard] Failing task:', taskId);
    setPendingJokerTaskId(taskId);
    resolveTaskMutation.mutate({ task_id: taskId, resolution_status: 'failed' });
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
          {getGreeting()}, {userQuery.data?.name || 'Rork'}
        </Text>
        <Text style={[styles.subGreeting, { color: theme.textMedium }]}>
          {streakCount > 0 ? 'Deine Flamme brennt.' : 'Starte deine Serie!'}
        </Text>

        <View style={styles.gridContainer}>
          {nextTask ? (
            <Card style={[styles.heroCard, { backgroundColor: theme.surface }]}>
              <View style={styles.heroHeader}>
                <Text style={[styles.heroLabel, { color: theme.textMedium }]}>Als Nächstes</Text>
                <Text style={[styles.heroTime, { color: theme.primary }]}>
                  {formatTime(nextTask.startAt)}
                </Text>
              </View>
              <Text style={[styles.heroTitle, { color: theme.textHigh }]} numberOfLines={2}>
                {nextTask.title}
              </Text>
              <View style={styles.heroFooter}>
                <View style={styles.heroStake}>
                  <Text style={[styles.heroStakeText, { color: theme.textMedium }]}>
                    Einsatz: {currentList?.currencySymbol || '€'}{nextTask.stake}
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.heroButton,
                    { backgroundColor: theme.success },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => handleComplete(nextTask.id)}
                >
                  <CheckCircle size={20} color="#FFFFFF" />
                  <Text style={styles.heroButtonText}>Erledigt</Text>
                </Pressable>
              </View>
            </Card>
          ) : (
            <Card style={[styles.heroCard, { backgroundColor: theme.surface }]}>
              <View style={styles.emptyHero}>
                <Text style={[styles.emptyHeroText, { color: theme.textMedium }]}>
                  🎉 Keine Aufgaben heute!
                </Text>
              </View>
            </Card>
          )}

          <View style={styles.gridRow}>
            <Card style={[styles.smallCard, { backgroundColor: theme.surface }]}>
              <View style={styles.smallCardContent}>
                {streakCount > 0 ? (
                  <View style={[styles.flameContainer, { backgroundColor: `${theme.warning}15` }]}>
                    <Flame size={32} color={theme.warning} fill={theme.warning} />
                  </View>
                ) : (
                  <View style={[styles.flameContainer, { backgroundColor: `${theme.textLow}10` }]}>
                    <Text style={styles.eggEmoji}>🥚</Text>
                  </View>
                )}
                <Text style={[styles.smallCardValue, { color: theme.textHigh }]}>
                  {streakCount}
                </Text>
                <Text style={[styles.smallCardLabel, { color: theme.textMedium }]}>
                  Tage Serie
                </Text>
              </View>
            </Card>

            <Card style={[styles.smallCard, { backgroundColor: theme.surface }]}>
              <View style={styles.smallCardContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${theme.accent}15` }]}>
                  <Text style={styles.jokerEmoji}>🃏</Text>
                </View>
                <Text style={[styles.smallCardValue, { color: theme.textHigh }]}>
                  {jokerCount}
                </Text>
                <Text style={[styles.smallCardLabel, { color: theme.textMedium }]}>
                  Joker
                </Text>
              </View>
            </Card>
          </View>

          <Card style={[styles.wideCard, { backgroundColor: theme.surface }]}>
            <View style={styles.wideCardHeader}>
              <Text style={[styles.wideCardTitle, { color: theme.textHigh }]}>Sparziele</Text>
              <Text style={[styles.wideCardTotal, { color: theme.primary }]}>
                {currentList?.currencySymbol || '€'}{totalSavings.toFixed(2)}
              </Text>
            </View>
            <View style={styles.goalsContainer}>
              <View style={styles.goalRow}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalEmoji}>🏖</Text>
                  <View style={styles.goalText}>
                    <Text style={[styles.goalName, { color: theme.textHigh }]}>Vacation Fund</Text>
                    <Text style={[styles.goalProgress, { color: theme.textMedium }]}>€20 / €500</Text>
                  </View>
                </View>
                <View style={[styles.progressBar, { backgroundColor: `${theme.primary}15` }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { backgroundColor: theme.primary, width: '4%' },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.goalRow}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalEmoji}>🎗</Text>
                  <View style={styles.goalText}>
                    <Text style={[styles.goalName, { color: theme.textHigh }]}>Donation / Charity</Text>
                    <Text style={[styles.goalProgress, { color: theme.textMedium }]}>€15 / €100</Text>
                  </View>
                </View>
                <View style={[styles.progressBar, { backgroundColor: `${theme.accent}15` }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { backgroundColor: theme.accent, width: '15%' },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.goalRow}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalEmoji}>🛒</Text>
                  <View style={styles.goalText}>
                    <Text style={[styles.goalName, { color: theme.textHigh }]}>Group Purchase</Text>
                    <Text style={[styles.goalProgress, { color: theme.textMedium }]}>€5 / €50</Text>
                  </View>
                </View>
                <View style={[styles.progressBar, { backgroundColor: `${theme.success}15` }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { backgroundColor: theme.success, width: '10%' },
                    ]}
                  />
                </View>
              </View>
            </View>
          </Card>

          {todayTasks.length > 1 && (
            <Card style={[styles.wideCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.wideCardTitle, { color: theme.textHigh, marginBottom: 12 }]}>
                Weitere Aufgaben heute
              </Text>
              {todayTasks.slice(1, 4).map((task, index) => (
                <Pressable
                  key={task.id}
                  style={({ pressed }) => [
                    styles.taskRow,
                    index < todayTasks.slice(1, 4).length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.surfaceAlt,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => handleTaskPress(task)}
                >
                  <View style={styles.taskRowLeft}>
                    <Text style={[styles.taskRowTime, { color: theme.textMedium }]}>
                      {formatTime(task.startAt)}
                    </Text>
                    <Text style={[styles.taskRowTitle, { color: theme.textHigh }]} numberOfLines={1}>
                      {task.title}
                    </Text>
                  </View>
                  <Text style={[styles.taskRowStake, { color: theme.textMedium }]}>
                    {currentList?.currencySymbol || '€'}{task.stake}
                  </Text>
                </Pressable>
              ))}
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

      <TaskEditSheet
        visible={taskSheetVisible}
        onClose={() => setTaskSheetVisible(false)}
        onSave={() => console.log('Task saved')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  gridContainer: {
    gap: 12,
  },
  heroCard: {
    padding: 20,
    minHeight: 160,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  heroTime: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 16,
    lineHeight: 32,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroStake: {
    flex: 1,
  },
  heroStakeText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  emptyHero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyHeroText: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallCard: {
    flex: 1,
    padding: 16,
    minHeight: 140,
  },
  smallCardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flameContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eggEmoji: {
    fontSize: 32,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jokerEmoji: {
    fontSize: 28,
  },
  smallCardValue: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  smallCardLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  wideCard: {
    padding: 16,
  },
  wideCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  wideCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  wideCardTotal: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  goalsContainer: {
    gap: 16,
  },
  goalRow: {
    gap: 8,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  goalEmoji: {
    fontSize: 20,
  },
  goalText: {
    flex: 1,
  },
  goalName: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  goalProgress: {
    fontSize: 12,
    marginTop: 2,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  taskRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskRowTime: {
    fontSize: 13,
    fontWeight: '600' as const,
    width: 50,
  },
  taskRowTitle: {
    fontSize: 15,
    flex: 1,
  },
  taskRowStake: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
