import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, User, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { AppBar } from '@/components/design-system/AppBar';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { IconButton } from '@/components/design-system/IconButton';
import { ListRow } from '@/components/design-system/ListRow';
import { ProgressRing } from '@/components/interactive/basic/ProgressRing';
import { SegmentedControl, SegmentedControlOption } from '@/components/interactive/basic/SegmentedControl';
import { StatMiniBar } from '@/components/stats/StatMiniBar';
import { TaskEditSheet } from '@/screens/TaskEditSheet';

type TaskStatus = 'all' | 'upcoming' | 'failed' | 'completed';

type Task = {
  id: string;
  emoji: string;
  name: string;
  dueDate: string;
  stakeAmount: number;
  status: 'completed' | 'failed' | 'pending' | 'upcoming';
};

const mockTasks: Task[] = [
  { id: '1', emoji: '💪', name: 'Morning Workout', dueDate: 'Today 7:00 AM', stakeAmount: 10, status: 'upcoming' },
  { id: '2', emoji: '📚', name: 'Read Chapter 5', dueDate: 'Today 2:00 PM', stakeAmount: 5, status: 'pending' },
  { id: '3', emoji: '🧘', name: 'Evening Meditation', dueDate: 'Today 8:00 PM', stakeAmount: 8, status: 'upcoming' },
  { id: '4', emoji: '💼', name: 'Team Meeting', dueDate: 'Today 10:00 AM', stakeAmount: 15, status: 'completed' },
  { id: '5', emoji: '🎯', name: 'Weekly Review', dueDate: 'Yesterday 5:00 PM', stakeAmount: 12, status: 'failed' },
];

const mockStats = {
  completionRate: 0.72,
  tasksCompleted: 18,
  goalsAchieved: 3,
  savingsTotal: 245,
};

export default function Dashboard() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<TaskStatus>('all');
  const [taskSheetVisible, setTaskSheetVisible] = useState(false);

  const filterOptions: SegmentedControlOption[] = [
    { value: 'all', label: 'All' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'failed', label: 'Failed' },
    { value: 'completed', label: 'Completed' },
  ];

  const filteredTasks = useMemo(() => {
    if (selectedFilter === 'all') return mockTasks;
    return mockTasks.filter(task => task.status === selectedFilter);
  }, [selectedFilter]);

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

  const handleTaskPress = (task: Task) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('Task pressed:', task.name);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'failed':
        return theme.colors.error;
      case 'upcoming':
        return theme.colors.accent;
      case 'pending':
        return theme.colors.warning;
      default:
        return theme.colors.textLow;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppBar
        title="Dashboard"
        actions={
          <>
            <IconButton
              icon={<Bell size={22} color={theme.colors.primary} />}
              onPress={handleNotificationPress}
              testID="bell-button"
            />
            <IconButton
              icon={<User size={22} color={theme.colors.primary} />}
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
            { backgroundColor: theme.colors.surface, marginBottom: theme.spacing.lg },
          ]}
        >
          <Text style={[theme.typography.H2, { color: theme.colors.textHigh }]}>Today&apos;s Focus</Text>
          <Text style={[theme.typography.Caption, { color: theme.colors.textLow, marginTop: 8 }]}>
            Your progress at a glance
          </Text>
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <ProgressRing
              size={80}
              stroke={8}
              progress={0.42}
              showLabel
              labelType="percentage"
              progressColor={theme.colors.primary}
              trackColor={theme.colors.surfaceAlt}
            />
          </View>

          <View style={{ marginTop: 16, gap: 8 }}>
            <View style={styles.statRow}>
              <Text style={[theme.typography.Label, { color: theme.colors.textLow }]}>Tasks</Text>
              <StatMiniBar />
            </View>

            <View style={styles.statRow}>
              <Text style={[theme.typography.Label, { color: theme.colors.textLow }]}>Goals</Text>
              <StatMiniBar />
            </View>

            <View style={styles.statRow}>
              <Text style={[theme.typography.Label, { color: theme.colors.textLow }]}>Savings</Text>
              <StatMiniBar />
            </View>
          </View>

          <Button
            title="+ Add Task"
            onPress={handleAddTask}
            variant="primary"
            style={{ marginTop: 16 }}
            testID="focus-card-add-task-button"
          />
        </Card>

        <Card
          style={{ marginBottom: theme.spacing.lg }}
          header={
            <Text style={[theme.typography.H2, { color: theme.colors.textHigh }]}>
              Today&apos;s Focus
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
                  progressColor={theme.colors.primary}
                  trackColor={theme.colors.surfaceAlt}
                />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.statBar, { backgroundColor: theme.colors.primary }]}>
                    <View
                      style={[
                        styles.statBarFill,
                        { backgroundColor: theme.colors.primary, width: '75%', opacity: 0.7 },
                      ]}
                    />
                  </View>
                  <Text style={[theme.typography.Label, { color: theme.colors.textLow }]}>
                    Tasks
                  </Text>
                  <Text style={[theme.typography.Body, { color: theme.colors.textHigh, fontWeight: '600' }]}>
                    {mockStats.tasksCompleted}
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statBar, { backgroundColor: theme.colors.accent }]}>
                    <View
                      style={[
                        styles.statBarFill,
                        { backgroundColor: theme.colors.accent, width: '60%', opacity: 0.7 },
                      ]}
                    />
                  </View>
                  <Text style={[theme.typography.Label, { color: theme.colors.textLow }]}>
                    Goals
                  </Text>
                  <Text style={[theme.typography.Body, { color: theme.colors.textHigh, fontWeight: '600' }]}>
                    {mockStats.goalsAchieved}
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statBar, { backgroundColor: theme.colors.success }]}>
                    <View
                      style={[
                        styles.statBarFill,
                        { backgroundColor: theme.colors.success, width: '85%', opacity: 0.7 },
                      ]}
                    />
                  </View>
                  <Text style={[theme.typography.Label, { color: theme.colors.textLow }]}>
                    Savings
                  </Text>
                  <Text style={[theme.typography.Body, { color: theme.colors.textHigh, fontWeight: '600' }]}>
                    ${mockStats.savingsTotal}
                  </Text>
                </View>
              </View>
            </View>
          }
          footer={
            <Button
              title="+ Add Task"
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
              <Text style={[theme.typography.Body, { color: theme.colors.textLow, textAlign: 'center' }]}>
                No tasks found
              </Text>
            </View>
          ) : (
            filteredTasks.map((task, index) => (
              <ListRow
                key={task.id}
                left={
                  <View style={styles.taskEmoji}>
                    <Text style={styles.emojiText}>{task.emoji}</Text>
                  </View>
                }
                title={task.name}
                subtitle={task.dueDate}
                right={
                  <View style={styles.taskRight}>
                    <Text style={[theme.typography.Label, { color: theme.colors.textHigh }]}>
                      ${task.stakeAmount}
                    </Text>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(task.status) },
                      ]}
                    />
                  </View>
                }
                onPress={() => handleTaskPress(task)}
                testID={`task-${task.id}`}
              />
            ))
          )}
        </Card>
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            bottom: insets.bottom + 16,
            shadowColor: theme.colors.primary,
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
