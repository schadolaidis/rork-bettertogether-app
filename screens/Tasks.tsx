import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { AppBar } from '@/components/design-system/AppBar';
import { ListRow } from '@/components/design-system/ListRow';
import { SegmentedControl, SegmentedControlOption } from '@/components/interactive/basic/SegmentedControl';
import { Task } from '@/types';


type TaskFilterType = 'all' | 'active' | 'completed' | 'failed' | 'upcoming';

type SwipeableTaskItemProps = {
  task: Task;
  onComplete: (taskId: string) => void;
  onFail: (taskId: string) => void;
  onPress: (task: Task) => void;
  currencySymbol: string;
};

const SWIPE_THRESHOLD = 100;
const ACTION_WIDTH = 80;

const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({
  task,
  onComplete,
  onFail,
  onPress,
  currencySymbol,
}) => {
  const { theme } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiping, setSwiping] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        setSwiping(true);
      },
      onPanResponderMove: (_, gestureState) => {
        const dx = gestureState.dx;
        if (dx > 0 && dx <= ACTION_WIDTH * 1.5) {
          translateX.setValue(dx);
        } else if (dx < 0 && dx >= -ACTION_WIDTH * 1.5) {
          translateX.setValue(dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const dx = gestureState.dx;
        setSwiping(false);

        if (dx > SWIPE_THRESHOLD) {
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          Animated.timing(translateX, {
            toValue: ACTION_WIDTH,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onComplete(task.id);
            translateX.setValue(0);
          });
        } else if (dx < -SWIPE_THRESHOLD) {
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          Animated.timing(translateX, {
            toValue: -ACTION_WIDTH,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onFail(task.id);
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'failed':
        return theme.colors.error;
      case 'overdue':
        return theme.colors.error;
      case 'pending':
        return theme.colors.warning;
      default:
        return theme.colors.textLow;
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'Done';
      case 'failed':
        return 'Failed';
      case 'overdue':
        return 'Overdue';
      case 'pending':
        return 'Active';
      default:
        return '';
    }
  };

  const formatDueDate = (task: Task): string => {
    if (!task.startAt) return 'No due date';
    
    const startDate = new Date(task.startAt);
    const now = new Date();
    const diffMs = startDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today ${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Tomorrow ${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === -1) {
      return `Yesterday ${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays > 1 && diffDays < 7) {
      return `${startDate.toLocaleDateString('en-US', { weekday: 'short' })} ${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    
    return startDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const canSwipe = task.status !== 'completed' && task.status !== 'failed';

  const categoryMeta = useMemo(() => {
    return { emoji: '📌', color: theme.colors.primary };
  }, [theme.colors.primary]);

  return (
    <View style={styles.swipeContainer}>
      <View style={[styles.actionContainer, styles.leftAction]}>
        <View
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.success },
          ]}
        >
          <Check size={24} color="#FFFFFF" />
        </View>
      </View>

      <View style={[styles.actionContainer, styles.rightAction]}>
        <View
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.error },
          ]}
        >
          <X size={24} color="#FFFFFF" />
        </View>
      </View>

      <Animated.View
        style={[
          styles.taskItem,
          { transform: [{ translateX }] },
        ]}
        {...(canSwipe ? panResponder.panHandlers : {})}
      >
        <ListRow
          left={
            <View style={styles.taskEmoji}>
              <Text style={styles.emojiText}>{categoryMeta.emoji}</Text>
            </View>
          }
          title={task.title}
          subtitle={formatDueDate(task)}
          right={
            <View style={styles.taskRight}>
              <Text style={[theme.typography.Label, { color: theme.colors.textHigh }]}>
                {currencySymbol}{task.stake}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(task.status) },
                ]}
              >
                <Text style={[styles.statusText, theme.typography.Caption]}>
                  {getStatusLabel(task.status)}
                </Text>
              </View>
            </View>
          }
          onPress={() => !swiping && onPress(task)}
          testID={`task-${task.id}`}
        />
      </Animated.View>
    </View>
  );
};

export default function Tasks() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    tasks,
    completeTask,
    failTask,
    currentList,
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<TaskFilterType>('all');

  const filterOptions: SegmentedControlOption[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'upcoming', label: 'Upcoming' },
  ];

  const filteredTasks = useMemo(() => {
    const now = new Date();
    
    switch (selectedFilter) {
      case 'all':
        return tasks;
      case 'active':
        return tasks.filter(t => t.status === 'pending' || t.status === 'overdue');
      case 'completed':
        return tasks.filter(t => t.status === 'completed');
      case 'failed':
        return tasks.filter(t => t.status === 'failed');
      case 'upcoming':
        return tasks.filter(t => {
          if (!t.startAt) return false;
          const startDate = new Date(t.startAt);
          return startDate > now && t.status === 'pending';
        });
      default:
        return tasks;
    }
  }, [tasks, selectedFilter]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (a.status !== 'overdue' && b.status === 'overdue') return 1;
      
      if (!a.startAt) return 1;
      if (!b.startAt) return -1;
      
      return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
    });
  }, [filteredTasks]);

  const handleComplete = useCallback((taskId: string) => {
    console.log('[Tasks] Completing task:', taskId);
    completeTask(taskId);
  }, [completeTask]);

  const handleFail = useCallback((taskId: string) => {
    console.log('[Tasks] Failing task:', taskId);
    failTask(taskId);
  }, [failTask]);

  const handleTaskPress = useCallback((task: Task) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('[Tasks] Task pressed:', task.title);
  }, []);

  const handleAddTask = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('[Tasks] Add task pressed');
  };

  const currencySymbol = currentList?.currencySymbol || '$';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppBar title="Tasks" testID="tasks-appbar" />

      <View style={[styles.filterContainer, { paddingHorizontal: theme.spacing.md }]}>
        <SegmentedControl
          options={filterOptions}
          selectedValue={selectedFilter}
          onChange={(value) => setSelectedFilter(value as TaskFilterType)}
        />
      </View>

      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SwipeableTaskItem
            task={item}
            onComplete={handleComplete}
            onFail={handleFail}
            onPress={handleTaskPress}
            currencySymbol={currencySymbol}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
          sortedTasks.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[theme.typography.H2, { color: theme.colors.textLow, marginBottom: 8 }]}>
              No tasks found
            </Text>
            <Text style={[theme.typography.Body, { color: theme.colors.textLow, textAlign: 'center' }]}>
              {selectedFilter === 'all' 
                ? 'Create your first task to get started'
                : `No ${selectedFilter} tasks`}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        testID="tasks-list"
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingVertical: 12,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyListContent: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  swipeContainer: {
    position: 'relative',
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: ACTION_WIDTH,
  },
  leftAction: {
    left: 0,
  },
  rightAction: {
    right: 0,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskItem: {
    backgroundColor: '#FFFFFF',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
    fontSize: 11,
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
