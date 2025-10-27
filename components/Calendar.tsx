import React, { useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { ChevronLeft, ChevronRight, X, CheckCircle2, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CalendarService, DayMarkers } from '@/services/CalendarService';
import { Task, TaskCategory } from '@/types';
import { CalendarViewType } from '@/contexts/AppContext';

interface CalendarProps {
  view: CalendarViewType;
  selectedDate: Date;
  tasks: Task[];
  categoryColors: Record<TaskCategory, string>;
  onViewChange: (view: CalendarViewType) => void;
  onDateSelect: (date: Date) => void;
}

interface DayAgendaProps {
  date: Date;
  tasks: Task[];
  categoryColors: Record<TaskCategory, string>;
  categoryEmojis: Record<TaskCategory, string>;
  onClose: () => void;
}

function DayAgenda({
  date,
  tasks,
  categoryColors,
  categoryEmojis,
  onClose,
}: DayAgendaProps) {
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
      <View style={styles.agendaContainer}>
        <View style={styles.agendaHeader}>
          <View>
            <Text style={styles.agendaTitle}>Tasks</Text>
            <Text style={styles.agendaDate}>{CalendarService.formatDayDate(date)}</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
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

        <ScrollView style={styles.agendaScroll} contentContainerStyle={styles.agendaContent}>
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
                  style={styles.agendaTask}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    onClose();
                    router.push(`/task-detail?id=${task.id}`);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.agendaTaskIndicator, { backgroundColor: categoryColor }]} />
                  <View style={styles.agendaTaskContent}>
                    <View style={styles.agendaTaskHeader}>
                      <Text style={styles.agendaTaskTime}>{time}</Text>
                      <View style={[styles.agendaTaskStatus, { backgroundColor: statusColor }]}>
                        <Text style={styles.agendaTaskStatusText}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.agendaTaskTitle} numberOfLines={2}>
                      {task.title}
                    </Text>
                    <View style={styles.agendaTaskMeta}>
                      <Text style={styles.agendaTaskEmoji}>{categoryEmoji}</Text>
                      <Text style={styles.agendaTaskCategory}>{task.category}</Text>
                      <Text style={styles.agendaTaskStake}>${task.stake}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.agendaEmpty}>
              <CheckCircle2 size={48} color="#D1D5DB" />
              <Text style={styles.agendaEmptyText}>No tasks for this day</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export function Calendar({
  view,
  selectedDate,
  tasks,
  categoryColors,
  onViewChange,
  onDateSelect,
}: CalendarProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(() => ({
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth(),
  }));
  const [showAgenda, setShowAgenda] = useState(false);
  const [agendaDate, setAgendaDate] = useState<Date>(new Date());

  const categoryEmojis = useMemo(() => {
    return {
      Household: '🏠',
      Finance: '💰',
      Work: '💼',
      Leisure: '🎮',
    } as Record<TaskCategory, string>;
  }, []);

  const monthDays = useMemo(() => {
    return CalendarService.getMonthDays(currentMonth.year, currentMonth.month);
  }, [currentMonth]);

  const weekDays = useMemo(() => {
    return CalendarService.getWeekDays(selectedDate);
  }, [selectedDate]);

  const dayMarkers = useMemo(() => {
    const start = view === 'month' ? monthDays[0] : weekDays[0];
    const end = view === 'month' ? monthDays[monthDays.length - 1] : weekDays[6];
    return CalendarService.getRange(start, end, tasks, { categoryColors });
  }, [view, monthDays, weekDays, tasks, categoryColors]);

  const markerMap = useMemo(() => {
    const map = new Map<string, DayMarkers>();
    dayMarkers.forEach((marker) => {
      map.set(marker.date, marker);
    });
    return map;
  }, [dayMarkers]);

  const handlePrevious = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (view === 'month') {
      const newMonth = currentMonth.month - 1;
      const newYear = newMonth < 0 ? currentMonth.year - 1 : currentMonth.year;
      setCurrentMonth({
        year: newYear,
        month: newMonth < 0 ? 11 : newMonth,
      });
    } else if (view === 'week') {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() - 7);
      onDateSelect(newDate);
    } else {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() - 1);
      onDateSelect(newDate);
    }
  }, [view, currentMonth, selectedDate, onDateSelect]);

  const handleNext = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (view === 'month') {
      const newMonth = currentMonth.month + 1;
      const newYear = newMonth > 11 ? currentMonth.year + 1 : currentMonth.year;
      setCurrentMonth({
        year: newYear,
        month: newMonth > 11 ? 0 : newMonth,
      });
    } else if (view === 'week') {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + 7);
      onDateSelect(newDate);
    } else {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + 1);
      onDateSelect(newDate);
    }
  }, [view, currentMonth, selectedDate, onDateSelect]);

  const handleDayPress = useCallback(
    (date: Date) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onDateSelect(date);
      setAgendaDate(date);
      setShowAgenda(true);
    },
    [onDateSelect]
  );

  const currentDateDisplay = useMemo(() => {
    if (view === 'month') {
      return CalendarService.formatMonthYear(new Date(currentMonth.year, currentMonth.month));
    } else if (view === 'week') {
      return CalendarService.formatWeekRange(weekDays[0]);
    } else {
      return CalendarService.formatDayDate(selectedDate);
    }
  }, [view, currentMonth, weekDays, selectedDate]);

  const agendaTasks = useMemo(() => {
    return CalendarService.getTasksForDate(agendaDate, tasks);
  }, [agendaDate, tasks]);

  const dayViewTasks = useMemo(() => {
    return CalendarService.getTasksForDate(selectedDate, tasks);
  }, [selectedDate, tasks]);

  const renderMonthView = () => {
    const today = new Date();
    const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <View style={styles.monthView}>
        <View style={styles.weekDayHeader}>
          {weekDayNames.map((name) => (
            <Text key={name} style={styles.weekDayName}>
              {name}
            </Text>
          ))}
        </View>
        <View style={styles.monthGrid}>
          {monthDays.map((date, index) => {
            const dateKey = CalendarService.getDateKey(date);
            const marker = markerMap.get(dateKey);
            const isToday = CalendarService.isSameDay(date, today);
            const isSelected = CalendarService.isSameDay(date, selectedDate);
            const isCurrentMonth = date.getMonth() === currentMonth.month;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isToday && styles.dayCellToday,
                  isSelected && styles.dayCellSelected,
                ]}
                onPress={() => handleDayPress(date)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    !isCurrentMonth && styles.dayNumberOtherMonth,
                    isToday && styles.dayNumberToday,
                    isSelected && styles.dayNumberSelected,
                  ]}
                >
                  {date.getDate()}
                </Text>
                {marker && (
                  <View style={styles.markerContainer}>
                    {marker.markers.slice(0, 3).map((m, i) => (
                      <View
                        key={i}
                        style={[styles.marker, { backgroundColor: m.color }]}
                      />
                    ))}
                  </View>
                )}
                {marker && (marker.hasOverdue || marker.hasFailed) && (
                  <View
                    style={[
                      styles.badge,
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
  };

  const renderWeekView = () => {
    const today = new Date();
    const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <View style={styles.weekView}>
        <View style={styles.weekStrip}>
          {weekDays.map((date, index) => {
            const dateKey = CalendarService.getDateKey(date);
            const marker = markerMap.get(dateKey);
            const isToday = CalendarService.isSameDay(date, today);
            const isSelected = CalendarService.isSameDay(date, selectedDate);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.weekDay,
                  isToday && styles.weekDayToday,
                  isSelected && styles.weekDaySelected,
                ]}
                onPress={() => handleDayPress(date)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.weekDayLabel,
                    isToday && styles.weekDayLabelToday,
                    isSelected && styles.weekDayLabelSelected,
                  ]}
                >
                  {weekDayNames[date.getDay()]}
                </Text>
                <Text
                  style={[
                    styles.weekDayNumber,
                    isToday && styles.weekDayNumberToday,
                    isSelected && styles.weekDayNumberSelected,
                  ]}
                >
                  {date.getDate()}
                </Text>
                {marker && (
                  <View style={styles.weekMarkerContainer}>
                    {marker.markers.slice(0, 4).map((m, i) => (
                      <View
                        key={i}
                        style={[styles.weekMarker, { backgroundColor: m.color }]}
                      />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderDayView = () => {
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
      <ScrollView style={styles.dayView} contentContainerStyle={styles.dayViewContent}>
        {dayViewTasks.length > 0 ? (
          dayViewTasks.map((task) => {
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
                style={styles.dayTaskCard}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push(`/task-detail?id=${task.id}`);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.dayTaskIndicator, { backgroundColor: categoryColor }]} />
                <View style={styles.dayTaskContent}>
                  <View style={styles.dayTaskHeader}>
                    <View style={styles.dayTaskTimeContainer}>
                      <Clock size={14} color={statusColor} />
                      <Text style={[styles.dayTaskTime, { color: statusColor }]}>{time}</Text>
                    </View>
                    <View style={[styles.dayTaskStatus, { backgroundColor: statusColor }]}>
                      <Text style={styles.dayTaskStatusText}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.dayTaskTitle} numberOfLines={2}>
                    {task.title}
                  </Text>
                  <View style={styles.dayTaskFooter}>
                    <View style={styles.dayTaskCategory}>
                      <Text style={styles.dayTaskEmoji}>{categoryEmoji}</Text>
                      <Text style={[styles.dayTaskCategoryText, { color: categoryColor }]}>
                        {task.category}
                      </Text>
                    </View>
                    <Text style={styles.dayTaskStake}>${task.stake}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.dayEmpty}>
            <CheckCircle2 size={48} color="#D1D5DB" />
            <Text style={styles.dayEmptyText}>No tasks for today</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewButton, view === 'day' && styles.viewButtonActive]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onViewChange('day');
          }}
        >
          <Text style={[styles.viewButtonText, view === 'day' && styles.viewButtonTextActive]}>
            Day
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, view === 'week' && styles.viewButtonActive]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onViewChange('week');
          }}
        >
          <Text style={[styles.viewButtonText, view === 'week' && styles.viewButtonTextActive]}>
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, view === 'month' && styles.viewButtonActive]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onViewChange('month');
          }}
        >
          <Text style={[styles.viewButtonText, view === 'month' && styles.viewButtonTextActive]}>
            Month
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navigation}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
          <ChevronLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.currentDate}>{currentDateDisplay}</Text>
        <TouchableOpacity style={styles.navButton} onPress={handleNext}>
          <ChevronRight size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}

      {showAgenda && (
        <DayAgenda
          date={agendaDate}
          tasks={agendaTasks}
          categoryColors={categoryColors}
          categoryEmojis={categoryEmojis}
          onClose={() => setShowAgenda(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  viewToggle: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    margin: 16,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  viewButtonTextActive: {
    color: '#3B82F6',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  currentDate: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  monthView: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  weekDayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCellToday: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#111827',
  },
  dayNumberOtherMonth: {
    color: '#D1D5DB',
  },
  dayNumberToday: {
    color: '#3B82F6',
    fontWeight: '700' as const,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  markerContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
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
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  weekView: {
    paddingBottom: 16,
  },
  weekStrip: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  weekDayToday: {
    backgroundColor: '#DBEAFE',
  },
  weekDaySelected: {
    backgroundColor: '#3B82F6',
  },
  weekDayLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 4,
  },
  weekDayLabelToday: {
    color: '#3B82F6',
  },
  weekDayLabelSelected: {
    color: '#FFFFFF',
  },
  weekDayNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  weekDayNumberToday: {
    color: '#3B82F6',
  },
  weekDayNumberSelected: {
    color: '#FFFFFF',
  },
  weekMarkerContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  weekMarker: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dayView: {
    maxHeight: 400,
  },
  dayViewContent: {
    padding: 16,
    gap: 12,
  },
  dayTaskCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  dayTaskIndicator: {
    width: 4,
  },
  dayTaskContent: {
    flex: 1,
    padding: 12,
  },
  dayTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayTaskTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dayTaskTime: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  dayTaskStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayTaskStatusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  dayTaskTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 8,
  },
  dayTaskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayTaskCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dayTaskEmoji: {
    fontSize: 16,
  },
  dayTaskCategoryText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  dayTaskStake: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#111827',
  },
  dayEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  dayEmptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
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
