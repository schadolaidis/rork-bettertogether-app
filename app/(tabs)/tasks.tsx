import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, XCircle, Filter, Undo2, Clock, Plus, Zap, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { Task, TaskCategory, TaskStatus } from '@/types';
import { TaskFormModal, TaskFormData, FundTargetOption } from '@/components/TaskFormModal';
import { QuickAddModal, QuickTaskData } from '@/components/QuickAddModal';
import { MOCK_FUND_TARGETS } from '@/mocks/data';

interface TaskCardProps {
  task: Task;
  userName: string | string[];
  categoryColor: string;
  categoryEmoji: string;
  onComplete: () => void;
  onFail: () => void;
  onPress: () => void;
}

function TaskCard({
  task,
  userName,
  categoryColor,
  categoryEmoji,
  onComplete,
  onFail,
  onPress,
}: TaskCardProps) {
  const isDisabled = task.status === 'completed' || task.status === 'failed';
  const isActionable = task.status === 'pending' || task.status === 'overdue';
  const statusColor = useMemo(() => {
    switch (task.status) {
      case 'completed':
        return '#10B981';
      case 'overdue':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  }, [task.status]);

  const dueDate = task.endAt ? new Date(task.endAt) : new Date();
  const now = new Date();
  const isToday = dueDate.toDateString() === now.toDateString();
  const minutesUntil = Math.floor((dueDate.getTime() - now.getTime()) / (60 * 1000));
  const hoursUntil = Math.floor(minutesUntil / 60);

  let dateText = '';
  if (minutesUntil < 0) {
    dateText = 'Overdue';
  } else if (minutesUntil < 60) {
    dateText = `${minutesUntil}m`;
  } else if (hoursUntil < 24) {
    dateText = `${hoursUntil}h`;
  } else if (isToday) {
    dateText = 'Today';
  } else {
    dateText = dueDate.toLocaleDateString();
  }

  const backgroundColor = useMemo(() => {
    switch (task.status) {
      case 'completed':
        return '#F0FDF4';
      case 'failed':
        return '#FEF2F2';
      default:
        return '#FFFFFF';
    }
  }, [task.status]);

  return (
    <View style={[styles.taskCard, { backgroundColor, opacity: isDisabled ? 0.6 : 1 }]}>
      <Pressable onPress={onPress} style={styles.taskCardPressable}>
          <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
          <View style={styles.taskCardContent}>
            <View style={styles.taskHeader}>
              <Text
                style={[
                  styles.taskTitle,
                  task.status === 'completed' && styles.taskTitleCompleted,
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.taskMeta}>
              <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
              <Text style={styles.categoryText}>{task.category}</Text>
              <Text style={styles.metaSeparator}>{"•"}</Text>
              <Text style={styles.metaText}>
                {Array.isArray(userName) ? `${userName.length} members` : userName}
              </Text>
            </View>
            <View style={styles.taskFooter}>
              <View style={styles.dueContainer}>
                <Clock size={14} color={statusColor} />
                <Text style={[styles.dueText, { color: statusColor }]}>{dateText}</Text>
                {task.gracePeriod > 0 && task.status !== 'completed' && (
                  <Text style={styles.graceText}>+{task.gracePeriod}m</Text>
                )}
              </View>
              <View style={styles.stakeContainer}>
                <Text style={styles.stakeLabel}>Stake:</Text>
                <Text style={styles.stakeValue}>${task.stake}</Text>
              </View>
            </View>
          </View>
        </Pressable>
        {isActionable && (
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={(e) => {
                e.stopPropagation();
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                onComplete();
              }}
            >
              <CheckCircle2 size={20} color="#10B981" strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={(e) => {
                e.stopPropagation();
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                }
                onFail();
              }}
            >
              <XCircle size={20} color="#EF4444" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}
      </View>
  );
}

type FilterOption = 'all' | TaskStatus | TaskCategory;

export default function TasksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { tasks, currentList, currentListMembers, addTask, completeTask, failTask, undoFailTask, undoAction } = useApp();
  
  const fundTargets: FundTargetOption[] = useMemo(() => {
    if (!currentList) return [];
    return MOCK_FUND_TARGETS
      .filter(ft => ft.listId === currentList.id)
      .map(ft => ({
        id: ft.id,
        name: ft.name,
        emoji: ft.emoji,
      }));
  }, [currentList]);

  const initialFilter = useMemo(() => {
    const filterParam = params.filter as string;
    if (filterParam === 'open') return 'pending';
    if (filterParam === 'overdue') return 'overdue';
    if (filterParam === 'completed') return 'completed';
    return 'all';
  }, [params.filter]);

  const [filter, setFilter] = useState<FilterOption>(initialFilter);
  const [showFilters, setShowFilters] = useState(initialFilter !== 'all');
  const [showFullTaskForm, setShowFullTaskForm] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    if (initialFilter !== 'all' && initialFilter !== filter) {
      setFilter(initialFilter);
    }
  }, [initialFilter]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (filter !== 'all') {
      if (['pending', 'completed', 'failed', 'overdue'].includes(filter)) {
        filtered = tasks.filter((t) => t.status === filter);
      } else {
        filtered = tasks.filter((t) => t.category === filter);
      }
    }

    return filtered.sort((a, b) => {
      if (filter === 'completed') {
        const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return bTime - aTime;
      }
      if (a.status !== b.status) {
        const statusOrder: Record<TaskStatus, number> = {
          overdue: 0,
          pending: 1,
          completed: 2,
          failed: 3,
        };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      const aTime = new Date(a.endAt).getTime();
      const bTime = new Date(b.endAt).getTime();
      return aTime - bTime;
    });
  }, [tasks, filter]);

  const nextDueTask = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'pending' || t.status === 'overdue')
      .sort((a, b) => {
        const aTime = new Date(a.endAt).getTime();
        const bTime = new Date(b.endAt).getTime();
        return aTime - bTime;
      })[0];
  }, [tasks]);

  const filters: { label: string; value: FilterOption }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' },
    { label: 'Household', value: 'Household' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Work', value: 'Work' },
    { label: 'Leisure', value: 'Leisure' },
  ];

  const toggleFilters = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowFilters(!showFilters);
  };

  const clearFilters = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFilter('all');
    router.setParams({ filter: undefined });
  }, [router]);

  const [undoExpiration, setUndoExpiration] = useState<number>(0);

  useEffect(() => {
    if (!undoAction) {
      setUndoExpiration(0);
      return;
    }

    setUndoExpiration(undoAction.expiresAt);

    const interval = setInterval(() => {
      const remaining = undoAction.expiresAt - Date.now();
      if (remaining <= 0) {
        setUndoExpiration(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [undoAction]);

  const remainingSeconds = Math.max(0, Math.ceil((undoExpiration - Date.now()) / 1000));

  const handleFullTaskFormSubmit = useCallback(
    (data: TaskFormData) => {
      if (!currentList) return;

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

      console.log('[Task] Created (full form):', data.title);
    },
    [addTask, currentList]
  );

  const handleQuickAddSubmit = useCallback(
    (data: QuickTaskData) => {
      if (!currentList) return;

      const startDate = data.dueDate || new Date(Date.now() + 3600000);
      const endDate = new Date(startDate.getTime() + 7200000);

      addTask({
        title: data.title,
        description: '',
        category: data.category || 'Household',
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        allDay: false,
        gracePeriod: currentList.defaultGraceMinutes,
        stake: data.stake || currentList.defaultStakeCents / 100,
        assignedTo: currentListMembers[0]?.id || '',
        priority: 'medium',
        reminder: 'none',
        customReminderMinutes: 30,
        recurrence: 'none',
        isShared: false,
      });

      console.log('[Task] Created (quick add):', data.title);
    },
    [addTask, currentList, currentListMembers]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowFullTaskForm(true);
            }}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={toggleFilters}
          >
            <Filter size={20} color={showFilters ? '#3B82F6' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.createTaskButton}
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          setShowFullTaskForm(true);
        }}
      >
        <View style={styles.createTaskContent}>
          <View style={styles.createTaskTextWrapper}>
            <Text style={styles.createTaskTitle}>Create New Task</Text>
            <Text style={styles.createTaskSubtext}>
              Add a task with category, schedule, stake, and members
            </Text>
          </View>
          <View style={styles.createTaskIconCircle}>
            <Plus size={24} color="#3B82F6" />
          </View>
        </View>
      </TouchableOpacity>

      {nextDueTask && (
        <View style={styles.nextDueBar}>
          <Clock size={16} color="#3B82F6" />
          <Text style={styles.nextDueText}>
            Next due: <Text style={styles.nextDueTask}>{nextDueTask.title}</Text>
          </Text>
        </View>
      )}

      {filter !== 'all' && (
        <View style={styles.filterPillBar}>
          <View style={styles.filterPill}>
            <Text style={styles.filterPillText}>
              {filters.find(f => f.value === filter)?.label}
            </Text>
            <TouchableOpacity
              onPress={clearFilters}
              style={styles.filterPillClose}
            >
              <X size={14} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearAllText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {showFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setFilter(f.value);
                router.setParams({ filter: f.value === 'all' ? undefined : f.value });
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === f.value && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {undoAction && remainingSeconds > 0 && (
        <View style={styles.undoBar}>
          <Text style={styles.undoText}>Task marked as failed ({remainingSeconds}s)</Text>
          <TouchableOpacity
            style={styles.undoButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              undoFailTask();
            }}
          >
            <Undo2 size={16} color="#3B82F6" />
            <Text style={styles.undoButtonText}>Undo</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTasks.length > 0 ? (
          <View style={styles.taskList}>
            {filteredTasks.map((task) => {
              const categoryMeta = currentList?.categories[task.category];
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  userName={Array.isArray(task.assignedTo) ? task.assignedTo : task.assignedTo}
                  categoryColor={categoryMeta?.color || '#6B7280'}
                  categoryEmoji={categoryMeta?.emoji || '📋'}
                  onComplete={() => completeTask(task.id)}
                  onFail={() => failTask(task.id)}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    router.push(`/task-detail?id=${task.id}`);
                  }}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <CheckCircle2 size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>
              Tap &quot;Create New Task&quot; to add your first one
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          setShowQuickAdd(true);
        }}
      >
        <Zap size={28} color="#FFFFFF" fill="#FFFFFF" />
      </TouchableOpacity>

      {currentList && (
        <>
          <TaskFormModal
          visible={showFullTaskForm}
          onClose={() => setShowFullTaskForm(false)}
          onSubmit={handleFullTaskFormSubmit}
          categories={currentList.categories}
          members={currentListMembers}
          fundTargets={fundTargets}
          defaultGraceMinutes={currentList.defaultGraceMinutes}
          defaultStakeCents={currentList.defaultStakeCents}
          currencySymbol={currentList.currencySymbol}
          existingTasks={tasks}
        />
        <QuickAddModal
          visible={showQuickAdd}
          onClose={() => setShowQuickAdd(false)}
          onSubmit={handleQuickAddSubmit}
          categories={currentList.categories}
        />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#EFF6FF',
  },
  createTaskButton: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createTaskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  createTaskTextWrapper: {
    flex: 1,
    marginRight: 16,
  },
  createTaskTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  createTaskSubtext: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  createTaskIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextDueBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  nextDueText: {
    fontSize: 14,
    color: '#6B7280',
  },
  nextDueTask: {
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  filterScroll: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  undoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  undoText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500' as const,
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  undoButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  filterPillBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
    gap: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 6,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  filterPillClose: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
  },
  taskCardPressable: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 120,
  },
  categoryIndicator: {
    width: 6,
  },
  taskCardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    lineHeight: 24,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#3B82F6',
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  metaSeparator: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#F3F4F6',
  },
  quickActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  dueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  graceText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500' as const,
  },
  stakeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stakeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  stakeValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
