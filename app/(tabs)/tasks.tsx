import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Filter, Undo2, Plus, X, Target } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { TaskCategory, TaskStatus } from '@/types';
import { TaskFormModal, TaskFormData, FundTargetOption } from '@/components/TaskFormModal';
import { QuickAddModal, QuickTaskData } from '@/components/QuickAddModal';
import { SmartQuickAddModal } from '@/components/SmartQuickAddModal';
import { MOCK_FUND_TARGETS } from '@/mocks/data';
import { SectionHeader } from '@/components/design-system/SectionHeader';
import { TaskCard as SimpleTaskCard } from '@/components/design-system/TaskCard';
import { TaskLogicService } from '@/services/TaskLogicService';


type FilterOption = 'all' | TaskStatus | TaskCategory;

export default function TasksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { tasks, currentList, currentListMembers, addTask, undoFailTask, undoAction } = useApp();
  
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
  const [showSmartAdd, setShowSmartAdd] = useState(false);

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
          failed_joker_used: 4,
          failed_stake_paid: 5,
        };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      const aTime = new Date(a.endAt).getTime();
      const bTime = new Date(b.endAt).getTime();
      return aTime - bTime;
    });
  }, [tasks, filter, memberIdParam, fundTargetIdParam]);

  const groupedTasks = useMemo(() => {
    return TaskLogicService.groupTasks(filteredTasks);
  }, [filteredTasks]);

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

  const handleSmartAddSubmit = useCallback(
    (parsedData: any) => {
      if (!currentList) return;

      const startDate = parsedData.date || new Date(Date.now() + 3600000);
      const endDate = new Date(startDate.getTime() + 7200000);

      addTask({
        title: parsedData.title,
        description: parsedData.location ? `Ort: ${parsedData.location}` : '',
        category: parsedData.category || 'Work',
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        allDay: parsedData.allDay || false,
        gracePeriod: currentList.defaultGraceMinutes,
        stake: parsedData.stake || currentList.defaultStakeCents / 100,
        assignedTo: currentListMembers[0]?.id || '',
        priority: parsedData.priority || 'medium',
        reminder: parsedData.reminder !== undefined ? 'custom' : 'none',
        customReminderMinutes: parsedData.reminder || 30,
        recurrence: parsedData.recurrence || 'none',
        isShared: false,
      });

      console.log('[Task] Created (smart add):', parsedData.title);
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

        <View style={{ paddingHorizontal: 20, gap: 12, marginTop: 16 }}>
          <TouchableOpacity
            style={styles.smartCreateButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowSmartAdd(true);
            }}
          >
            <View style={styles.smartCreateContent}>
              <View style={styles.smartCreateIconWrapper}>
                <Text style={styles.sparkleIcon}>✨</Text>
              </View>
              <View style={styles.smartCreateTextWrapper}>
                <Text style={styles.smartCreateTitle}>Quick Add (AI)</Text>
                <Text style={styles.smartCreateSubtext}>
                  z.B.: &quot;morgen 10 uhr Meeting with Max&quot;
                </Text>
              </View>
            </View>
          </TouchableOpacity>

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
        </View>


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
          <ScrollView>
            {(['overdue', 'today','tomorrow','thisWeek','later', 'completed'] as const).map((groupKey) => {
              const list = groupedTasks[groupKey];
              if (!list || list.length === 0) return null;
              
              if (groupKey === 'completed' && filter !== 'completed') {
                return null;
              }

              const title = TaskLogicService.getGroupTitle(groupKey);
              const groupColor = TaskLogicService.getGroupColor(groupKey);
              
              return (
                <View key={groupKey}>
                  <View style={styles.groupHeader}>
                    <View style={[styles.groupIndicator, { backgroundColor: groupColor }]} />
                    <SectionHeader title={title} subtitle={`${list.length} ${list.length === 1 ? 'task' : 'tasks'}`} />
                  </View>
                  <View style={{ paddingHorizontal: 20, gap: 12, marginBottom: 8 }}>
                    {list.map(task => {
                      const categoryMeta = currentList?.categories?.[task.category];
                      const timeDisplay = TaskLogicService.getHumanReadableTime(task);
                      
                      return (
                        <SimpleTaskCard
                          key={task.id}
                          title={task.title}
                          categoryEmoji={categoryMeta?.emoji || '📋'}
                          categoryColor={categoryMeta?.color || '#6B7280'}
                          dueTime={timeDisplay.text}
                          status={task.status}
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
                </View>
              );
            })}
          </ScrollView>
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
        <SmartQuickAddModal
          visible={showSmartAdd}
          onClose={() => setShowSmartAdd(false)}
          onSubmit={handleSmartAddSubmit}
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
  smartCreateButton: {
    backgroundColor: '#667EEA',
    borderRadius: 16,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  smartCreateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  smartCreateIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleIcon: {
    fontSize: 26,
  },
  smartCreateTextWrapper: {
    flex: 1,
  },
  smartCreateTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  smartCreateSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
  },
  createTaskButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  groupIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
});
