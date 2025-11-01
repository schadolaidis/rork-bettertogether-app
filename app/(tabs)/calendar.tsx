import React, { useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { Task, TaskCategory } from '@/types';
import { TaskFormModal, TaskFormData } from '@/components/TaskFormModal';

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    tasks,
    currentList,
    currentListMembers,
    addTask,
  } = useApp();

  const [showTaskModal, setShowTaskModal] = useState(false);

  const categoryMeta = useMemo(() => {
    if (!currentList) {
      return {
        Household: { emoji: '🏠', color: '#10B981', label: 'Household' },
        Finance: { emoji: '💰', color: '#3B82F6', label: 'Finance' },
        Work: { emoji: '💼', color: '#8B5CF6', label: 'Work' },
        Leisure: { emoji: '🎮', color: '#F59E0B', label: 'Leisure' },
      };
    }
    return {
      Household: {
        emoji: currentList.categories.Household?.emoji || '🏠',
        color: currentList.categories.Household?.color || '#10B981',
        label: 'Household',
      },
      Finance: {
        emoji: currentList.categories.Finance?.emoji || '💰',
        color: currentList.categories.Finance?.color || '#3B82F6',
        label: 'Finance',
      },
      Work: {
        emoji: currentList.categories.Work?.emoji || '💼',
        color: currentList.categories.Work?.color || '#8B5CF6',
        label: 'Work',
      },
      Leisure: {
        emoji: currentList.categories.Leisure?.emoji || '🎮',
        color: currentList.categories.Leisure?.color || '#F59E0B',
        label: 'Leisure',
      },
    };
  }, [currentList]);

  const groupedTasks = useMemo(() => {
    const now = new Date();
    const upcoming = tasks.filter(task => {
      const taskDate = new Date(task.endAt);
      return (task.status === 'pending' || task.status === 'overdue') && taskDate >= now;
    }).sort((a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime());

    const groups: Record<string, { date: Date; tasks: Task[] }> = {};
    
    upcoming.forEach(task => {
      const taskDate = new Date(task.endAt);
      const dateKey = taskDate.toDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = { date: taskDate, tasks: [] };
      }
      groups[dateKey].tasks.push(task);
    });

    return Object.values(groups);
  }, [tasks]);

  const handleTaskSubmit = useCallback(
    (data: TaskFormData) => {
      addTask({
        title: data.title,
        description: data.description,
        category: data.category,
        startAt: data.startDate.toISOString(),
        endAt: data.endDate.toISOString(),
        allDay: data.allDay,
        gracePeriod: data.gracePeriod,
        stake: data.stake,
        assignedTo: data.assignedTo,
        priority: data.priority,
        reminder: data.reminder,
        customReminderMinutes: data.customReminderMinutes,
        recurrence: data.recurrence,
        isShared: data.isShared,
        fundTargetId: data.fundTargetId,
      });
      setShowTaskModal(false);
    },
    [addTask]
  );

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
      return `${dayName}, ${monthName} ${date.getDate()}`;
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CalendarIcon size={28} color="#3B82F6" />
          <Text style={styles.headerTitle}>Timeline</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            setShowTaskModal(true);
          }}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {groupedTasks.length > 0 ? (
          groupedTasks.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateText}>{formatDate(group.date)}</Text>
                  <Text style={styles.taskCount}>{group.tasks.length}</Text>
                </View>
              </View>

              <View style={styles.timeline}>
                {group.tasks.map((task, taskIndex) => {
                  const category = categoryMeta[task.category as TaskCategory] || {
                    emoji: '📋',
                    color: '#6B7280',
                    label: task.category
                  };
                  const statusColor = getStatusColor(task.status);
                  const isLast = taskIndex === group.tasks.length - 1;

                  return (
                    <View key={task.id} style={styles.taskContainer}>
                      <View style={styles.timelineLeft}>
                        <View style={[styles.timelineDot, { backgroundColor: category.color }]} />
                        {!isLast && <View style={styles.timelineLine} />}
                      </View>

                      <TouchableOpacity
                        style={[styles.taskCard, { borderLeftColor: category.color }]}
                        onPress={() => {
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                          router.push(`/task-detail?id=${task.id}`);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.taskHeader}>
                          <View style={styles.taskHeaderLeft}>
                            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                            <Text style={[styles.categoryLabel, { color: category.color }]}>
                              {task.category}
                            </Text>
                          </View>
                          <View style={styles.taskHeaderRight}>
                            <Clock size={14} color={statusColor} />
                            <Text style={[styles.taskTime, { color: statusColor }]}>
                              {formatTime(new Date(task.endAt))}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.taskTitle}>{task.title}</Text>

                        {task.description && (
                          <Text style={styles.taskDescription} numberOfLines={2}>
                            {task.description}
                          </Text>
                        )}

                        <View style={styles.taskFooter}>
                          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                            <Text style={styles.statusText}>
                              {task.status === 'overdue' ? '⚠️ Overdue' : '📌 Pending'}
                            </Text>
                          </View>
                          <Text style={styles.stake}>${task.stake}</Text>
                        </View>

                        <TouchableOpacity 
                          style={styles.detailsButton}
                          onPress={() => {
                            if (Platform.OS !== 'web') {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }
                            router.push(`/task-detail?id=${task.id}`);
                          }}
                        >
                          <ChevronRight size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <CalendarIcon size={64} color="#D1D5DB" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No upcoming tasks</Text>
            <Text style={styles.emptySubtitle}>Create your first task to see it here</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                setShowTaskModal(true);
              }}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Create Task</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {showTaskModal && currentList && (
        <TaskFormModal
          visible={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSubmit={handleTaskSubmit}
          categories={categoryMeta}
          members={currentListMembers}
          defaultGraceMinutes={currentList.defaultGraceMinutes}
          defaultStakeCents={currentList.defaultStakeCents}
          currencySymbol={currentList.currencySymbol}
          mode="create"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  dateGroup: {
    marginBottom: 32,
  },
  dateHeader: {
    marginBottom: 16,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  taskCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  timeline: {
    position: 'relative',
  },
  taskContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 32,
    marginRight: 16,
    position: 'relative',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    top: 14,
    bottom: -16,
    width: 2,
    backgroundColor: '#E2E8F0',
  },
  taskCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  taskHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskTime: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#0F172A',
    marginBottom: 8,
    lineHeight: 24,
  },
  taskDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  stake: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0F172A',
  },
  detailsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
