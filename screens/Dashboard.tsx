import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, User, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { AppBar } from '@/components/design-system/AppBar';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { IconButton } from '@/components/design-system/IconButton';
import { ProgressRing } from '@/components/interactive/basic/ProgressRing';
import { SegmentedControl, SegmentedControlOption } from '@/components/interactive/basic/SegmentedControl';
import { StatMiniBar } from '@/components/stats/StatMiniBar';
import { TaskEditSheet } from '@/screens/TaskEditSheet';
import { SwipeableTaskCard } from '@/components/interactive/SwipeableTaskCard';
import { trpc } from '@/lib/trpc';

type TaskStatus = 'all' | 'upcoming' | 'failed' | 'completed';



const mockStats = {
  completionRate: 0.72,
  tasksCompleted: 18,
  goalsAchieved: 3,
  savingsTotal: 245,
};

export default function Dashboard() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { tasks, completeTask, failTask, currentList } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<TaskStatus>('all');
  const [taskSheetVisible, setTaskSheetVisible] = useState(false);
  const [pendingJokerTaskId, setPendingJokerTaskId] = useState<string | null>(null);
  const utils = trpc.useUtils();

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

  const filterOptions: SegmentedControlOption[] = [
    { value: 'all', label: 'Alle' },
    { value: 'upcoming', label: 'Anstehend' },
    { value: 'failed', label: 'Fehlgeschlagen' },
    { value: 'completed', label: 'Erledigt' },
  ];

  const filteredTasks = useMemo(() => {
    if (selectedFilter === 'all') return tasks;
    return tasks.filter(task => {
      if (selectedFilter === 'upcoming') {
        return task.status === 'pending';
      }
      if (selectedFilter === 'failed') {
        return task.status === 'failed' || task.status === 'failed_stake_paid' || task.status === 'failed_joker_used';
      }
      return task.status === selectedFilter;
    });
  }, [selectedFilter, tasks]);

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
  };

  const handleFail = (taskId: string) => {
    console.log('[Dashboard] Failing task:', taskId);
    setPendingJokerTaskId(taskId);
    resolveTaskMutation.mutate({ task_id: taskId, resolution_status: 'failed' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppBar
        title="Dashboard"
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
        <Card
          style={[
            styles.todayCard,
            { backgroundColor: theme.surface, marginBottom: theme.spacing.lg },
          ]}
        >
          <Text style={[theme.typography.h2, { color: theme.textHigh }]}>Heutiger Fokus</Text>
          <Text style={[theme.typography.caption, { color: theme.textLow, marginTop: 8 }]}>
            Dein Fortschritt auf einen Blick
          </Text>
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <ProgressRing
              size={80}
              stroke={8}
              progress={0.42}
              showLabel
              labelType="percentage"
              progressColor={theme.primary}
              trackColor={theme.surfaceAlt}
            />
          </View>

          <View style={{ marginTop: 16, gap: 8 }}>
            <View style={styles.statRow}>
              <Text style={[theme.typography.label, { color: theme.textLow }]}>Aufgaben</Text>
              <StatMiniBar />
            </View>

            <View style={styles.statRow}>
              <Text style={[theme.typography.label, { color: theme.textLow }]}>Ziele</Text>
              <StatMiniBar />
            </View>

            <View style={styles.statRow}>
              <Text style={[theme.typography.label, { color: theme.textLow }]}>Ersparnis</Text>
              <StatMiniBar />
            </View>
          </View>

          <Button
            title="+ Aufgabe hinzufügen"
            onPress={handleAddTask}
            variant="primary"
            style={{ marginTop: 16 }}
            testID="focus-card-add-task-button"
          />
        </Card>

        <Card
          style={{ marginBottom: theme.spacing.lg }}
          header={
            <Text style={[theme.typography.h2, { color: theme.textHigh }]}>
              Heutiger Fokus
            </Text>
          }
          content={
            <View style={styles.focusContent}>
              <View style={styles.progressSection}>
                <ProgressRing
                  size={80}
                  stroke={8}
                  progress={mockStats.completionRate}
                  showLabel
                  labelType="percentage"
                  progressColor={theme.primary}
                  trackColor={theme.surfaceAlt}
                />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.statBar, { backgroundColor: theme.primary }]}>
                    <View
                      style={[
                        styles.statBarFill,
                        { backgroundColor: theme.primary, width: '75%', opacity: 0.7 },
                      ]}
                    />
                  </View>
                  <Text style={[theme.typography.label, { color: theme.textLow }]}>
                    Aufgaben
                  </Text>
                  <Text style={[theme.typography.body, { color: theme.textHigh, fontWeight: '600' }]}>
                    {mockStats.tasksCompleted}
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statBar, { backgroundColor: theme.accent }]}>
                    <View
                      style={[
                        styles.statBarFill,
                        { backgroundColor: theme.accent, width: '60%', opacity: 0.7 },
                      ]}
                    />
                  </View>
                  <Text style={[theme.typography.label, { color: theme.textLow }]}>
                    Ziele
                  </Text>
                  <Text style={[theme.typography.body, { color: theme.textHigh, fontWeight: '600' }]}>
                    {mockStats.goalsAchieved}
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statBar, { backgroundColor: theme.success }]}>
                    <View
                      style={[
                        styles.statBarFill,
                        { backgroundColor: theme.success, width: '85%', opacity: 0.7 },
                      ]}
                    />
                  </View>
                  <Text style={[theme.typography.label, { color: theme.textLow }]}>
                    Ersparnis
                  </Text>
                  <Text style={[theme.typography.body, { color: theme.textHigh, fontWeight: '600' }]}>
                    €{mockStats.savingsTotal}
                  </Text>
                </View>
              </View>
            </View>
          }
          footer={
            <Button
              title="+ Aufgabe hinzufügen"
              onPress={handleAddTask}
              variant="primary"
              testID="add-task-button"
            />
          }
          testID="focus-card"
        />

        <View style={{ marginBottom: theme.spacing.md }}>
          <SegmentedControl
            options={filterOptions}
            selectedValue={selectedFilter}
            onChange={(value) => setSelectedFilter(value as TaskStatus)}
          />
        </View>

        <Card padded={false} style={{ marginBottom: theme.spacing.lg }}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[theme.typography.body, { color: theme.textLow, textAlign: 'center' }]}>
                Keine Aufgaben gefunden
              </Text>
            </View>
          ) : (
            filteredTasks.map((task) => (
              <SwipeableTaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onFail={handleFail}
                onPress={handleTaskPress}
                currencySymbol={currentList?.currencySymbol || '€'}
                showStatus={true}
              />
            ))
          )}
        </Card>
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
  focusContent: {
    gap: 24,
  },
  progressSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    opacity: 0.2,
    marginBottom: 4,
  },
  statBarFill: {
    height: '100%',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  todayCard: {
    borderRadius: 16,
    padding: 16,
  },
  statRow: {
    gap: 4,
  },
});
