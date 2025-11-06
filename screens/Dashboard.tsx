import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, User, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { AppBar } from '@/components/design-system/AppBar';
import { Card } from '@/components/design-system/Card';
import { IconButton } from '@/components/design-system/IconButton';
import { TaskEditSheet } from '@/screens/TaskEditSheet';
import { SwipeableTaskCard } from '@/components/interactive/SwipeableTaskCard';





export default function Dashboard() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { tasks, completeTask, failTask, currentList, currentUser } = useApp();
  const [taskSheetVisible, setTaskSheetVisible] = useState(false);

  const getCurrentDateString = (): string => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('de-DE', options);
  };

  const { overdueTasks, todayTasks, upcomingTasks } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    const overdue: typeof tasks = [];
    const today: typeof tasks = [];
    const upcoming: typeof tasks = [];

    tasks.forEach(task => {
      if (task.status !== 'pending' && task.status !== 'overdue') return;
      
      if (task.status === 'overdue') {
        overdue.push(task);
        return;
      }

      if (!task.endAt) return;
      const endDate = new Date(task.endAt);

      if (endDate < todayStart) {
        overdue.push(task);
      } else if (endDate >= todayStart && endDate < todayEnd) {
        today.push(task);
      } else if (endDate >= todayEnd && endDate < tomorrowEnd) {
        upcoming.push(task);
      }
    });

    return {
      overdueTasks: overdue,
      todayTasks: today,
      upcomingTasks: upcoming,
    };
  }, [tasks]);

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
    failTask(taskId);
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
        <View style={[styles.headerSection, { paddingHorizontal: theme.spacing.md }]}>
          <Text style={[theme.typography.h1, { color: theme.textHigh, fontSize: 28 }]}>
            Heute
          </Text>
          <Text style={[theme.typography.caption, { color: theme.textLow, marginTop: 4 }]}>
            {getCurrentDateString()}
          </Text>
          {currentUser && currentUser.currentStreakCount > 1 && (
            <View style={[styles.streakBadge, { backgroundColor: theme.surfaceAlt, marginTop: 12 }]}>
              <Text style={[theme.typography.body, { color: theme.primary, fontWeight: '600' }]}>
                🔥 {currentUser.currentStreakCount}-Tage Serie!
              </Text>
            </View>
          )}
        </View>

        {overdueTasks.length > 0 && (
          <View style={{ marginBottom: theme.spacing.lg }}>
            <View style={[styles.sectionHeader, { paddingHorizontal: theme.spacing.md }]}>
              <Text style={[theme.typography.h2, { color: theme.error, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 }]}>
                ⚠️ ÜBERFÄLLIG
              </Text>
            </View>
            <Card padded={false}>
              {overdueTasks.map((task) => (
                <SwipeableTaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onFail={handleFail}
                  onPress={handleTaskPress}
                  currencySymbol={currentList?.currencySymbol || '€'}
                  showStatus={true}
                />
              ))}
            </Card>
          </View>
        )}

        {todayTasks.length > 0 && (
          <View style={{ marginBottom: theme.spacing.lg }}>
            <View style={[styles.sectionHeader, { paddingHorizontal: theme.spacing.md }]}>
              <Text style={[theme.typography.h2, { color: theme.primary, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 }]}>
                HEUTE FÄLLIG
              </Text>
            </View>
            <Card padded={false}>
              {todayTasks.map((task) => (
                <SwipeableTaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onFail={handleFail}
                  onPress={handleTaskPress}
                  currencySymbol={currentList?.currencySymbol || '€'}
                  showStatus={true}
                />
              ))}
            </Card>
          </View>
        )}

        {upcomingTasks.length > 0 && (
          <View style={{ marginBottom: theme.spacing.lg }}>
            <View style={[styles.sectionHeader, { paddingHorizontal: theme.spacing.md }]}>
              <Text style={[theme.typography.h2, { color: theme.textLow, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 }]}>
                DEMNÄCHST
              </Text>
            </View>
            <Card padded={false}>
              {upcomingTasks.map((task) => (
                <SwipeableTaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onFail={handleFail}
                  onPress={handleTaskPress}
                  currencySymbol={currentList?.currencySymbol || '€'}
                  showStatus={true}
                />
              ))}
            </Card>
          </View>
        )}

        {overdueTasks.length === 0 && todayTasks.length === 0 && upcomingTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[theme.typography.h2, { fontSize: 48, marginBottom: 16 }]}>✅</Text>
            <Text style={[theme.typography.h2, { color: theme.textHigh, marginBottom: 8 }]}>
              Alles erledigt!
            </Text>
            <Text style={[theme.typography.body, { color: theme.textLow, textAlign: 'center' }]}>
              Du hast für heute alle Aufgaben geschafft. Genieße deinen Tag!
            </Text>
          </View>
        )}
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
    paddingTop: 16,
  },
  headerSection: {
    marginBottom: 24,
  },
  streakBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  sectionHeader: {
    marginBottom: 12,
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
