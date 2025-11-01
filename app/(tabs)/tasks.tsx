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
import { CheckCircle2, XCircle, Filter, Undo2, Clock, Plus, Zap, X, User as UserIcon, Target, DollarSign } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { Task, TaskCategory, TaskStatus, User } from '@/types';
import { TaskFormModal, TaskFormData, FundTargetOption } from '@/components/TaskFormModal';
import { QuickAddModal, QuickTaskData } from '@/components/QuickAddModal';
import { MOCK_FUND_TARGETS } from '@/mocks/data';

interface TaskCardProps {
  task: Task;
  assignedUsers: User[];
  categoryColor: string;
  categoryEmoji: string;
  fundTarget?: { id: string; name: string; emoji: string };
  onComplete: () => void;
  onFail: () => void;
  onPress: () => void;
}

function TaskCard({
  task,
  assignedUsers,
  categoryColor,
  categoryEmoji,
  fundTarget,
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
    <Pressable onPress={onPress} style={styles.taskCardWrapper}>
      <View style={[styles.taskCard, { backgroundColor, opacity: isDisabled ? 0.6 : 1 }]}>
        {fundTarget && (
          <View style={styles.fundTargetBanner}>
            <Text style={styles.fundTargetBannerEmoji}>{fundTarget.emoji}</Text>
            <Text style={styles.fundTargetBannerText}>{fundTarget.name}</Text>
          </View>
        )}
        
        <View style={styles.taskCardContent}>
          <View style={styles.taskHeader}>
            <View style={styles.taskTitleRow}>
              <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
              <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
              <Text
                style={[
                  styles.taskTitle,
                  task.status === 'completed' && styles.taskTitleCompleted,
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.taskDetails}>
            <View style={styles.detailRow}>
              <Clock size={14} color={statusColor} />
              <Text style={[styles.detailText, { color: statusColor }]}>{dateText}</Text>
              {task.gracePeriod > 0 && task.status !== 'completed' && (
                <Text style={styles.graceText}>+{task.gracePeriod}m</Text>
              )}
            </View>
            
            <View style={styles.detailRow}>
              <DollarSign size={14} color="#8B5CF6" />
              <Text style={[styles.detailText, { color: '#8B5CF6' }]}>${task.stake}</Text>
            </View>

            {assignedUsers.length > 0 && (
              <View style={styles.detailRow}>
                <UserIcon size={14} color="#6B7280" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {assignedUsers.length === 1
                    ? assignedUsers[0].name
                    : `${assignedUsers.length} members`}
                </Text>
              </View>
            )}
          </View>

          {isActionable && (
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickActionButton, styles.completeButton]}
                onPress={(e) => {
                  e.stopPropagation();
                  if (Platform.OS !== 'web') {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                  onComplete();
                }}
              >
                <CheckCircle2 size={16} color="#10B981" strokeWidth={2.5} />
                <Text style={styles.actionButtonText}>Complete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickActionButton, styles.failButton]}
                onPress={(e) => {
                  e.stopPropagation();
                  if (Platform.OS !== 'web') {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  }
                  onFail();
                }}
              >
                <XCircle size={16} color="#EF4444" strokeWidth={2.5} />
                <Text style={styles.actionButtonText}>Fail</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Pressable>
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
      .filter(ft => ft.listId === currentList.id && ft.isActive)
      .map(ft => ({
        id: ft.id,
        name: ft.name,
        emoji: ft.emoji,
      }));
  }, [currentList]);

  const memberIdParam = params.memberId as string | undefined;
  const fundTargetIdParam = params.fundTargetId as string | undefined;

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
  }, [initialFilter, filter]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (memberIdParam) {
      filtered = filtered.filter((t) => {
        if (Array.isArray(t.assignedTo)) {
          return t.assignedTo.includes(memberIdParam);
        }
        return t.assignedTo === memberIdParam;
      });
    }

    if (fundTargetIdParam) {
      filtered = filtered.filter((t) => t.fundTargetId === fundTargetIdParam);
    }

    if (filter !== 'all') {
      if (['pending', 'completed', 'failed', 'overdue'].includes(filter)) {
        filtered = filtered.filter((t) => t.status === filter);
      } else {
        filtered = filtered.filter((t) => t.category === filter);
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
  }, [tasks, filter, memberIdParam, fundTargetIdParam]);

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
    router.setParams({ filter: undefined, memberId: undefined, fundTargetId: undefined });
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {fundTargets.length > 0 && (
          <View style={styles.focusGoalSection}>
            <View style={styles.focusGoalHeader}>
              <Target size={18} color="#8B5CF6" strokeWidth={2.5} />
              <Text style={styles.focusGoalHeaderText}>Focus Goals</Text>
              <Text style={styles.focusGoalHeaderSubtext}>Tap to filter tasks</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.focusGoalScroll}
            >
              {fundTargets.map((fund) => {
                const fundTasks = tasks.filter(t => t.fundTargetId === fund.id);
                const activeFundTasks = fundTasks.filter(t => t.status === 'pending' || t.status === 'overdue');
                const totalStaked = activeFundTasks.reduce((sum, t) => sum + t.stake, 0);
                return (
                  <TouchableOpacity
                    key={fund.id}
                    style={[
                      styles.focusGoalCard,
                      fundTargetIdParam === fund.id && styles.focusGoalCardActive
                    ]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      if (fundTargetIdParam === fund.id) {
                        router.setParams({ fundTargetId: undefined });
                      } else {
                        router.setParams({ fundTargetId: fund.id });
                      }
                    }}
                  >
                    <View style={styles.focusGoalEmoji}>
                      <Text style={styles.focusGoalEmojiText}>{fund.emoji}</Text>
                    </View>
                    <View style={styles.focusGoalContent}>
                      <Text style={styles.focusGoalName} numberOfLines={1}>{fund.name}</Text>
                      <View style={styles.focusGoalStats}>
                        <Text style={styles.focusGoalStatsText}>
                          {activeFundTasks.length} active
                        </Text>
                        {totalStaked > 0 && (
                          <>
                            <View style={styles.focusGoalStatsDot} />
                            <Text style={styles.focusGoalStatsAmount}>${totalStaked.toFixed(0)}</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

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
                Assign to a Focus Goal and set your commitment
              </Text>
            </View>
            <View style={styles.createTaskIconCircle}>
              <Plus size={22} color="#3B82F6" />
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

        {(filter !== 'all' || memberIdParam) && (
          <View style={styles.activeFiltersBar}>
            {memberIdParam && (
              <View style={styles.activeFilterPill}>
                <Text style={styles.activeFilterText}>
                  {currentListMembers.find(m => m.id === memberIdParam)?.name || 'Member'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    router.setParams({ memberId: undefined });
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={16} color="#3B82F6" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            )}
            {filter !== 'all' && (
              <View style={styles.activeFilterPill}>
                <Text style={styles.activeFilterText}>
                  {filters.find(f => f.value === filter)?.label}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setFilter('all');
                    router.setParams({ filter: undefined });
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={16} color="#3B82F6" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              onPress={clearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
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

        {filteredTasks.length > 0 ? (
          <View style={styles.taskList}>
            {filteredTasks.map((task) => {
              const categoryMeta = currentList?.categories?.[task.category];
              const assignedUserIds = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
              const assignedUsers = currentListMembers.filter((u) => assignedUserIds.includes(u.id));
              const fundTarget = task.fundTargetId ? fundTargets.find((f) => f.id === task.fundTargetId) : undefined;
              
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  assignedUsers={assignedUsers}
                  categoryColor={categoryMeta?.color || '#6B7280'}
                  categoryEmoji={categoryMeta?.emoji || '📋'}
                  fundTarget={fundTarget}
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
            <Target size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No tasks here</Text>
            <Text style={styles.emptySubtext}>
              Create a task and assign it to a Focus Goal
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  focusGoalSection: {
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  focusGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  focusGoalHeaderText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    flex: 1,
  },
  focusGoalHeaderSubtext: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#9CA3AF',
  },
  focusGoalScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  focusGoalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 180,
    gap: 12,
  },
  focusGoalCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#8B5CF6',
  },
  focusGoalEmoji: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  focusGoalEmojiText: {
    fontSize: 24,
  },
  focusGoalContent: {
    flex: 1,
    gap: 4,
  },
  focusGoalName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#111827',
  },
  focusGoalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  focusGoalStatsText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  focusGoalStatsDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9CA3AF',
  },
  focusGoalStatsAmount: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#8B5CF6',
  },
  createTaskButton: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  createTaskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  createTaskTextWrapper: {
    flex: 1,
    marginRight: 16,
  },
  createTaskTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  createTaskSubtext: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  createTaskIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
  },
  nextDueText: {
    fontSize: 13,
    color: '#6B7280',
  },
  nextDueTask: {
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  filterScroll: {
    backgroundColor: '#FFFFFF',
    maxHeight: 40,
    marginTop: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#3B82F6',
  },
  undoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
  },
  undoText: {
    fontSize: 13,
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
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  activeFiltersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 8,
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    gap: 6,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  taskList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  taskCardWrapper: {
    width: '100%',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  fundTargetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F5F3FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9D5FF',
  },
  fundTargetBannerEmoji: {
    fontSize: 16,
  },
  fundTargetBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#8B5CF6',
  },
  taskCardContent: {
    padding: 16,
    gap: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  taskTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    lineHeight: 22,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  taskDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#111827',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  completeButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  failButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  graceText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500' as const,
    marginLeft: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
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
