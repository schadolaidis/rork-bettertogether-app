import React, { useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Calendar as CalendarIcon,
  X,
  ChevronDown,
  Check,
  Plus,
  CheckSquare,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { Task, TaskCategory } from '@/types';
import { CalendarService, DayMarkers } from '@/services/CalendarService';
import { Calendar } from '@/components/Calendar';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  backgroundColor: string;
  onPress?: () => void;
}

function StatCard({ title, value, subtitle, icon, color, backgroundColor, onPress }: StatCardProps) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View>{icon}</View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
}

interface TaskItemProps {
  task: Task;
  categoryEmoji: string;
  onPress: () => void;
}

function TaskItem({ task, categoryEmoji, onPress }: TaskItemProps) {
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

  const dueDate = new Date(task.endAt);
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

  return (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.taskStatusDot, { backgroundColor: statusColor }]} />
      <Text style={styles.taskEmoji}>{categoryEmoji}</Text>
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={styles.taskMetaRow}>
          <Clock size={12} color={statusColor} />
          <Text style={[styles.taskDue, { color: statusColor }]}>{dateText}</Text>
          <Text style={styles.taskStake}>${task.stake}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface CompactCalendarSummaryProps {
  selectedDate: Date;
  tasks: Task[];
  categoryColors: Record<TaskCategory, string>;
  onDateSelect: (date: Date) => void;
  onOpenCalendar: () => void;
  onDayPress: (date: Date) => void;
}

function CompactCalendarSummary({
  selectedDate,
  tasks,
  categoryColors,
  onDateSelect,
  onOpenCalendar,
  onDayPress,
}: CompactCalendarSummaryProps) {
  const weekDays = useMemo(() => {
    return CalendarService.getWeekDays(selectedDate);
  }, [selectedDate]);

  const dayMarkers = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    return CalendarService.getRange(start, end, tasks, { categoryColors });
  }, [weekDays, tasks, categoryColors]);

  const markerMap = useMemo(() => {
    const map = new Map<string, DayMarkers>();
    dayMarkers.forEach((marker) => {
      map.set(marker.date, marker);
    });
    return map;
  }, [dayMarkers]);

  const selectedDateMarker = useMemo(() => {
    const dateKey = CalendarService.getDateKey(selectedDate);
    return markerMap.get(dateKey);
  }, [selectedDate, markerMap]);

  const handleDayPress = useCallback(
    (date: Date) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onDateSelect(date);
      onDayPress(date);
    },
    [onDateSelect, onDayPress]
  );

  const today = new Date();
  const weekDayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={compactCalendarStyles.container}>
      <View style={compactCalendarStyles.header}>
        <View>
          <Text style={compactCalendarStyles.title}>Calendar</Text>
          {selectedDateMarker && selectedDateMarker.totalTasks > 0 && (
            <Text style={compactCalendarStyles.subtitle}>
              {selectedDateMarker.totalTasks} task{selectedDateMarker.totalTasks !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={compactCalendarStyles.expandButton}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            onOpenCalendar();
          }}
          activeOpacity={0.7}
        >
          <CalendarIcon size={18} color="#3B82F6" />
          <Text style={compactCalendarStyles.expandText}>View</Text>
        </TouchableOpacity>
      </View>
      <View style={compactCalendarStyles.weekStrip}>
        {weekDays.map((date, index) => {
          const dateKey = CalendarService.getDateKey(date);
          const marker = markerMap.get(dateKey);
          const isToday = CalendarService.isSameDay(date, today);
          const isSelected = CalendarService.isSameDay(date, selectedDate);

          return (
            <TouchableOpacity
              key={index}
              style={[
                compactCalendarStyles.weekDay,
                isToday && compactCalendarStyles.weekDayToday,
                isSelected && compactCalendarStyles.weekDaySelected,
              ]}
              onPress={() => handleDayPress(date)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  compactCalendarStyles.weekDayLabel,
                  isToday && compactCalendarStyles.weekDayLabelToday,
                  isSelected && compactCalendarStyles.weekDayLabelSelected,
                ]}
              >
                {weekDayNames[date.getDay()]}
              </Text>
              <Text
                style={[
                  compactCalendarStyles.weekDayNumber,
                  isToday && compactCalendarStyles.weekDayNumberToday,
                  isSelected && compactCalendarStyles.weekDayNumberSelected,
                ]}
              >
                {date.getDate()}
              </Text>
              {marker && marker.markers.length > 0 && (
                <View style={compactCalendarStyles.markerContainer}>
                  {marker.markers.slice(0, 3).map((m, i) => (
                    <View
                      key={i}
                      style={[compactCalendarStyles.marker, { backgroundColor: m.color }]}
                    />
                  ))}
                </View>
              )}
              {marker && (marker.hasOverdue || marker.hasFailed) && (
                <View
                  style={[
                    compactCalendarStyles.badge,
                    { backgroundColor: marker.hasFailed ? '#EF4444' : '#F59E0B' },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

interface DayAgendaModalProps {
  date: Date;
  tasks: Task[];
  categoryColors: Record<TaskCategory, string>;
  categoryEmojis: Record<TaskCategory, string>;
  onClose: () => void;
}

function DayAgendaModal({
  date,
  tasks,
  categoryColors,
  categoryEmojis,
  onClose,
}: DayAgendaModalProps) {
  const router = useRouter();
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      return new Date(a.endAt).getTime() - new Date(b.endAt).getTime();
    });
  }, [tasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'overdue':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <View style={agendaModalStyles.agendaContainer}>
        <View style={agendaModalStyles.agendaHeader}>
          <View>
            <Text style={agendaModalStyles.agendaTitle}>Tasks</Text>
            <Text style={agendaModalStyles.agendaDate}>{CalendarService.formatDayDate(date)}</Text>
          </View>
          <TouchableOpacity
            style={agendaModalStyles.closeButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onClose();
            }}
          >
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={agendaModalStyles.agendaScroll} contentContainerStyle={agendaModalStyles.agendaContent}>
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task) => {
              const categoryColor = categoryColors[task.category] || '#6B7280';
              const categoryEmoji = categoryEmojis[task.category] || '📋';
              const statusColor = getStatusColor(task.status);
              const time = new Date(task.endAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              });

              return (
                <TouchableOpacity
                  key={task.id}
                  style={agendaModalStyles.agendaTask}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    onClose();
                    router.push(`/task-detail?id=${task.id}`);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[agendaModalStyles.agendaTaskIndicator, { backgroundColor: categoryColor }]} />
                  <View style={agendaModalStyles.agendaTaskContent}>
                    <View style={agendaModalStyles.agendaTaskHeader}>
                      <Text style={agendaModalStyles.agendaTaskTime}>{time}</Text>
                      <View style={[agendaModalStyles.agendaTaskStatus, { backgroundColor: statusColor }]}>
                        <Text style={agendaModalStyles.agendaTaskStatusText}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={agendaModalStyles.agendaTaskTitle} numberOfLines={2}>
                      {task.title}
                    </Text>
                    <View style={agendaModalStyles.agendaTaskMeta}>
                      <Text style={agendaModalStyles.agendaTaskEmoji}>{categoryEmoji}</Text>
                      <Text style={agendaModalStyles.agendaTaskCategory}>{task.category}</Text>
                      <Text style={agendaModalStyles.agendaTaskStake}>${task.stake}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={agendaModalStyles.agendaEmpty}>
              <CheckCircle2 size={48} color="#D1D5DB" />
              <Text style={agendaModalStyles.agendaEmptyText}>No tasks for this day</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    dashboardStats,
    tasks,
    allTasks,
    currentUser,
    currentList,
    currentListMembers,
    lists,
    calendarView,
    selectedDate,
    setCalendarViewType,
    setCalendarSelectedDate,
    switchList,
  } = useApp();

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showDayAgenda, setShowDayAgenda] = useState(false);
  const [showListSwitcher, setShowListSwitcher] = useState(false);
  const [agendaDate, setAgendaDate] = useState<Date>(new Date());

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'pending' || t.status === 'overdue')
      .sort((a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime())
      .slice(0, 5);
  }, [tasks]);

  const categoryColors = useMemo(() => {
    if (!currentList || !currentList.categories) return {} as Record<TaskCategory, string>;
    const colors: Record<string, string> = {};
    currentList.categories.forEach((cat) => {
      colors[cat.id] = cat.color;
    });
    return colors;
  }, [currentList]);

  const categoryEmojis = useMemo(() => {
    if (!currentList || !currentList.categories) return {} as Record<TaskCategory, string>;
    const emojis: Record<string, string> = {};
    currentList.categories.forEach((cat) => {
      emojis[cat.id] = cat.emoji;
    });
    return emojis;
  }, [currentList]);

  const currencySymbol = currentList?.currencySymbol || '$';
  const balanceColor = dashboardStats.totalBalance >= 0 ? '#10B981' : '#EF4444';
  const balanceSign = dashboardStats.totalBalance >= 0 ? '+' : '';

  const handleOpenCalendar = useCallback(() => {
    setShowCalendarModal(true);
  }, []);

  const handleCloseCalendar = useCallback(() => {
    setShowCalendarModal(false);
  }, []);

  const handleOpenTasksTap = useCallback(() => {
    router.push('/tasks?filter=open');
  }, [router]);

  const handleOverdueTap = useCallback(() => {
    router.push('/tasks?filter=overdue');
  }, [router]);

  const handleCompletedTap = useCallback(() => {
    router.push('/tasks?filter=completed');
  }, [router]);

  const handleBalanceTap = useCallback(() => {
    router.push('/balances?month=current');
  }, [router]);

  const handleDayPress = useCallback(
    (date: Date) => {
      setAgendaDate(date);
      setShowDayAgenda(true);
    },
    []
  );

  const agendaTasks = useMemo(() => {
    return CalendarService.getTasksForDate(agendaDate, tasks);
  }, [agendaDate, tasks]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{currentUser?.name || 'User'}</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: currentUser?.color || '#3B82F6' }]}>
            <Text style={styles.avatarText}>
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.listBanner}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setShowListSwitcher(true);
          }}
          activeOpacity={0.7}
        >
          <Users size={16} color="#3B82F6" />
          <Text style={styles.listName}>{currentList?.name || 'List'}</Text>
          <Text style={styles.listMembers}>
            {currentListMembers.length} member{currentListMembers.length !== 1 ? 's' : ''}
          </Text>
          <ChevronDown size={16} color="#3B82F6" />
        </TouchableOpacity>

        <CompactCalendarSummary
          selectedDate={selectedDate}
          tasks={tasks}
          categoryColors={categoryColors}
          onDateSelect={setCalendarSelectedDate}
          onOpenCalendar={handleOpenCalendar}
          onDayPress={handleDayPress}
        />

        <View style={styles.statsGrid}>
          <StatCard
            title="Open Tasks"
            value={dashboardStats.openTasks}
            icon={<AlertCircle size={24} color="#3B82F6" />}
            color="#3B82F6"
            backgroundColor="#EFF6FF"
            onPress={handleOpenTasksTap}
          />
          <StatCard
            title="Overdue"
            value={dashboardStats.overdueTasks}
            icon={<AlertCircle size={24} color="#F59E0B" />}
            color="#F59E0B"
            backgroundColor="#FEF3C7"
            onPress={handleOverdueTap}
          />
          <StatCard
            title="Completed"
            value={dashboardStats.completedThisMonth}
            subtitle="This month"
            icon={<CheckCircle2 size={24} color="#10B981" />}
            color="#10B981"
            backgroundColor="#D1FAE5"
            onPress={handleCompletedTap}
          />
          <StatCard
            title="Balance"
            value={`${balanceSign}${currencySymbol}${Math.abs(dashboardStats.totalBalance).toFixed(2)}`}
            icon={
              dashboardStats.totalBalance >= 0 ? (
                <TrendingUp size={24} color={balanceColor} />
              ) : (
                <TrendingDown size={24} color={balanceColor} />
              )
            }
            color={balanceColor}
            backgroundColor={dashboardStats.totalBalance >= 0 ? '#D1FAE5' : '#FEE2E2'}
            onPress={handleBalanceTap}
          />
        </View>

        {dashboardStats.nextDueTask && (
          <View style={styles.nextDueCard}>
            <Text style={styles.nextDueLabel}>Next Due</Text>
            <Text style={styles.nextDueTitle}>{dashboardStats.nextDueTask.title}</Text>
            <View style={styles.nextDueMeta}>
              <Text style={styles.nextDueCategory}>
                {currentList?.categories?.find(c => c.id === dashboardStats.nextDueTask?.category)?.emoji || '📋'}{' '}
                {dashboardStats.nextDueTask?.category}
              </Text>
              <Text style={styles.nextDueDot}>•</Text>
              <Text style={styles.nextDueStake}>${dashboardStats.nextDueTask.stake}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
          {upcomingTasks.length > 0 ? (
            <View style={styles.taskList}>
              {upcomingTasks.map((task) => {
                const categoryMeta = currentList?.categories?.find(c => c.id === task.category);
                return (
                  <TaskItem
                    key={task.id}
                    task={task}
                    categoryEmoji={categoryMeta?.emoji || '📋'}
                    onPress={() => router.push(`/task-detail?id=${task.id}`)}
                  />
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <CheckCircle2 size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No upcoming tasks</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showCalendarModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseCalendar}
      >
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>Calendar</Text>
            <TouchableOpacity
              style={modalStyles.closeButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                handleCloseCalendar();
              }}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Calendar
            view={calendarView}
            selectedDate={selectedDate}
            tasks={tasks}
            categoryColors={categoryColors}
            onViewChange={setCalendarViewType}
            onDateSelect={setCalendarSelectedDate}
          />
        </View>
      </Modal>

      {showDayAgenda && (
        <DayAgendaModal
          date={agendaDate}
          tasks={agendaTasks}
          categoryColors={categoryColors}
          categoryEmojis={categoryEmojis}
          onClose={() => setShowDayAgenda(false)}
        />
      )}

      <Modal
        visible={showListSwitcher}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowListSwitcher(false)}
      >
        <View style={listSwitcherStyles.container}>
          <View style={listSwitcherStyles.header}>
            <Text style={listSwitcherStyles.title}>Switch List</Text>
            <TouchableOpacity
              style={listSwitcherStyles.closeButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowListSwitcher(false);
              }}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={listSwitcherStyles.scroll}
            contentContainerStyle={listSwitcherStyles.content}
          >
            {lists
              .filter((l) => !l.archived)
              .map((list) => {
                const listTasks = allTasks.filter((t) => t.listId === list.id);
                const openTasks = listTasks.filter(
                  (t) => t.status === 'pending' || t.status === 'overdue'
                ).length;
                const isActive = list.id === currentList?.id;

                return (
                  <TouchableOpacity
                    key={list.id}
                    style={[
                      listSwitcherStyles.listCard,
                      isActive && listSwitcherStyles.listCardActive,
                    ]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                      switchList(list.id);
                      setShowListSwitcher(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={listSwitcherStyles.listCardContent}>
                      <View style={listSwitcherStyles.listCardHeader}>
                        <Text
                          style={[
                            listSwitcherStyles.listCardName,
                            isActive && listSwitcherStyles.listCardNameActive,
                          ]}
                        >
                          {list.name}
                        </Text>
                        {isActive && (
                          <View style={listSwitcherStyles.activeIndicator}>
                            <Check size={16} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <View style={listSwitcherStyles.listCardMeta}>
                        <View style={listSwitcherStyles.listCardMetaItem}>
                          <Users size={14} color="#6B7280" />
                          <Text style={listSwitcherStyles.listCardMetaText}>
                            {list.memberIds.length} member{list.memberIds.length !== 1 ? 's' : ''}
                          </Text>
                        </View>
                        <View style={listSwitcherStyles.listCardMetaItem}>
                          <CheckSquare size={14} color="#6B7280" />
                          <Text style={listSwitcherStyles.listCardMetaText}>
                            {openTasks} open task{openTasks !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

            <TouchableOpacity
              style={listSwitcherStyles.createButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowListSwitcher(false);
                router.push('/settings/teams');
              }}
              activeOpacity={0.7}
            >
              <View style={listSwitcherStyles.createIcon}>
                <Plus size={20} color="#3B82F6" />
              </View>
              <Text style={listSwitcherStyles.createText}>Create New List</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600' as const,
  },
  listBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginBottom: 24,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E40AF',
    flex: 1,
  },
  listMembers: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    minHeight: 140,
  },
  statIcon: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  nextDueCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  nextDueLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#F59E0B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  nextDueTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 8,
  },
  nextDueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextDueCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  nextDueDot: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  nextDueStake: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  calendarSection: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  taskList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  taskStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  taskEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 4,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskDue: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  taskStake: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 'auto' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

const compactCalendarStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  expandText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  weekStrip: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  weekDayToday: {
    backgroundColor: '#DBEAFE',
  },
  weekDaySelected: {
    backgroundColor: '#3B82F6',
  },
  weekDayLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  weekDayLabelToday: {
    color: '#3B82F6',
  },
  weekDayLabelSelected: {
    color: '#FFFFFF',
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  weekDayNumberToday: {
    color: '#3B82F6',
  },
  weekDayNumberSelected: {
    color: '#FFFFFF',
  },
  markerContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  marker: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
});

const listSwitcherStyles = StyleSheet.create({
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
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  listCardContent: {
    gap: 12,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    flex: 1,
  },
  listCardNameActive: {
    color: '#1E40AF',
  },
  activeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCardMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  listCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listCardMetaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  createIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
});

const agendaModalStyles = StyleSheet.create({
  agendaContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  agendaTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
  },
  agendaDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  agendaScroll: {
    flex: 1,
  },
  agendaContent: {
    padding: 20,
    gap: 12,
  },
  agendaTask: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  agendaTaskIndicator: {
    width: 4,
  },
  agendaTaskContent: {
    flex: 1,
    padding: 16,
  },
  agendaTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  agendaTaskTime: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  agendaTaskStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  agendaTaskStatusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  agendaTaskTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 8,
  },
  agendaTaskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  agendaTaskEmoji: {
    fontSize: 16,
  },
  agendaTaskCategory: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  agendaTaskStake: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#111827',
  },
  agendaEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  agendaEmptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
});
