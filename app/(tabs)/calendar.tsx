import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
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
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, CheckCircle2, List } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { TaskCategory } from '@/types';
import { CalendarService, DayMarkers } from '@/services/CalendarService';
import { TaskFormModal, TaskFormData } from '@/components/TaskFormModal';

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    tasks,
    currentList,
    currentListMembers,
    calendarView,
    selectedDate,
    setCalendarViewType,
    setCalendarSelectedDate,
    addTask,
    t,
  } = useApp();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState<Date | null>(null);
  const [showDayAgenda, setShowDayAgenda] = useState(false);
  const [agendaDate, setAgendaDate] = useState<Date>(new Date());

  const [currentMonth, setCurrentMonth] = useState(() => ({
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth(),
  }));

  useEffect(() => {
    if (calendarView === 'month') {
      setCurrentMonth({
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth(),
      });
    }
  }, [selectedDate, calendarView]);

  const categoryColors = useMemo(() => {
    if (!currentList) return {} as Record<TaskCategory, string>;
    return {
      Household: currentList.categories.Household.color,
      Finance: currentList.categories.Finance.color,
      Work: currentList.categories.Work.color,
      Leisure: currentList.categories.Leisure.color,
    };
  }, [currentList]);

  const categoryEmojis = useMemo(() => {
    if (!currentList) return {} as Record<TaskCategory, string>;
    return {
      Household: currentList.categories.Household?.emoji || '🏠',
      Finance: currentList.categories.Finance?.emoji || '💰',
      Work: currentList.categories.Work?.emoji || '💼',
      Leisure: currentList.categories.Leisure?.emoji || '🎮',
    };
  }, [currentList]);

  const categoryMeta = useMemo(() => {
    if (!currentList) return {} as Record<TaskCategory, { emoji: string; color: string; label: string }>;
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

  const monthDays = useMemo(() => {
    return CalendarService.getMonthDays(currentMonth.year, currentMonth.month);
  }, [currentMonth]);

  const weekDays = useMemo(() => {
    return CalendarService.getWeekDays(selectedDate);
  }, [selectedDate]);

  const dayMarkers = useMemo(() => {
    const start = calendarView === 'month' ? monthDays[0] : weekDays[0];
    const end = calendarView === 'month' ? monthDays[monthDays.length - 1] : weekDays[6];
    const markers = CalendarService.getRange(start, end, tasks, { categoryColors });
    console.log('[Calendar] Day markers:', markers.length, 'View:', calendarView, 'Tasks:', tasks.length);
    return markers;
  }, [calendarView, monthDays, weekDays, tasks, categoryColors]);

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

    if (calendarView === 'month') {
      const newMonth = currentMonth.month - 1;
      const newYear = newMonth < 0 ? currentMonth.year - 1 : currentMonth.year;
      setCurrentMonth({
        year: newYear,
        month: newMonth < 0 ? 11 : newMonth,
      });
    } else if (calendarView === 'week') {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() - 7);
      setCalendarSelectedDate(newDate);
    } else {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() - 1);
      setCalendarSelectedDate(newDate);
    }
  }, [calendarView, currentMonth, selectedDate, setCalendarSelectedDate]);

  const handleNext = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (calendarView === 'month') {
      const newMonth = currentMonth.month + 1;
      const newYear = newMonth > 11 ? currentMonth.year + 1 : currentMonth.year;
      setCurrentMonth({
        year: newYear,
        month: newMonth > 11 ? 0 : newMonth,
      });
    } else if (calendarView === 'week') {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + 7);
      setCalendarSelectedDate(newDate);
    } else {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + 1);
      setCalendarSelectedDate(newDate);
    }
  }, [calendarView, currentMonth, selectedDate, setCalendarSelectedDate]);

  const handleDayPress = useCallback(
    (date: Date) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      setCalendarSelectedDate(date);
      setAgendaDate(date);
      setShowDayAgenda(true);
    },
    [setCalendarSelectedDate]
  );

  const handleCreateTaskForDate = useCallback(
    (date: Date) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      const taskDate = new Date(date);
      taskDate.setHours(taskDate.getHours() + 1, 0, 0, 0);
      setPreselectedDate(taskDate);
      setShowTaskModal(true);
    },
    []
  );

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
      setPreselectedDate(null);
    },
    [addTask]
  );

  const currentDateDisplay = useMemo(() => {
    if (calendarView === 'month') {
      return CalendarService.formatMonthYear(new Date(currentMonth.year, currentMonth.month));
    } else if (calendarView === 'week') {
      return CalendarService.formatWeekRange(weekDays[0]);
    } else {
      return CalendarService.formatDayDate(selectedDate);
    }
  }, [calendarView, currentMonth, weekDays, selectedDate]);

  const agendaTasks = useMemo(() => {
    return CalendarService.getTasksForDate(agendaDate, tasks);
  }, [agendaDate, tasks]);

  const dayViewTasks = useMemo(() => {
    return CalendarService.getTasksForDate(selectedDate, tasks);
  }, [selectedDate, tasks]);

  const tasksByHour = useMemo(() => {
    const map = new Map<number, typeof dayViewTasks>();
    dayViewTasks.forEach(task => {
      const endDate = new Date(task.endAt);
      const hour = endDate.getHours();
      const existing = map.get(hour) || [];
      map.set(hour, [...existing, task]);
    });
    console.log('[Calendar] Tasks by hour:', map.size, 'Total tasks:', dayViewTasks.length);
    return map;
  }, [dayViewTasks]);

  const tickerDays = useMemo(() => {
    const days = [];
    const baseDate = new Date();
    for (let i = -3; i <= 10; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      days.push(date);
    }
    return days;
  }, []);

  const groupedTasksByDate = useMemo(() => {
    const now = new Date();
    const sorted = [...tasks].sort((a, b) => 
      new Date(a.endAt).getTime() - new Date(b.endAt).getTime()
    );
    
    const groups: Record<string, typeof tasks> = {};
    sorted.forEach(task => {
      const taskDate = new Date(task.endAt);
      if (taskDate >= now || task.status === 'overdue' || task.status === 'pending') {
        const dateKey = CalendarService.getDateKey(taskDate);
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(task);
      }
    });
    
    return groups;
  }, [tasks]);

  const tickerScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (tickerScrollRef.current) {
      const todayIndex = tickerDays.findIndex(date => 
        CalendarService.isSameDay(date, selectedDate)
      );
      if (todayIndex >= 0) {
        const scrollX = Math.max(0, (todayIndex - 2) * 64);
        setTimeout(() => {
          tickerScrollRef.current?.scrollTo({ x: scrollX, animated: true });
        }, 100);
      }
    }
  }, [selectedDate, tickerDays]);

  const renderDayTicker = () => {
    const today = new Date();

    return (
      <ScrollView 
        ref={tickerScrollRef}
        horizontal 
        style={styles.dayTicker}
        contentContainerStyle={styles.dayTickerContent}
        showsHorizontalScrollIndicator={false}
      >
        {tickerDays.map((date, index) => {
          const dateKey = CalendarService.getDateKey(date);
          const marker = markerMap.get(dateKey);
          const isToday = CalendarService.isSameDay(date, today);
          const isSelected = CalendarService.isSameDay(date, selectedDate);
          const dayName = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.tickerDay,
                isToday && styles.tickerDayToday,
                isSelected && styles.tickerDaySelected,
              ]}
              onPress={() => handleDayPress(date)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tickerDayName,
                isToday && styles.tickerDayNameToday,
                isSelected && styles.tickerDayNameSelected,
              ]}>
                {dayName}
              </Text>
              <Text style={[
                styles.tickerDayNumber,
                isToday && styles.tickerDayNumberToday,
                isSelected && styles.tickerDayNumberSelected,
              ]}>
                {date.getDate()}
              </Text>
              {marker && marker.markers.length > 0 && (
                <View style={styles.tickerMarkerRow}>
                  {marker.markers.slice(0, 2).map((m, i) => (
                    <View
                      key={i}
                      style={[styles.tickerMarker, { backgroundColor: m.color }]}
                    />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderListView = () => {
    return (
      <ScrollView style={styles.listView} contentContainerStyle={styles.listViewContent}>
        {Object.entries(groupedTasksByDate).map(([dateKey, dateTasks]) => {
          const date = new Date(dateTasks[0].endAt);
          const isToday = CalendarService.isSameDay(date, new Date());
          
          return (
            <View key={dateKey} style={styles.listGroup}>
              <View style={styles.listGroupHeader}>
                <Text style={[styles.listGroupDate, isToday && styles.listGroupDateToday]}>
                  {isToday ? 'Today' : CalendarService.formatDayDate(date)}
                </Text>
                <Text style={styles.listGroupCount}>{dateTasks.length} {dateTasks.length === 1 ? 'task' : 'tasks'}</Text>
              </View>
              {dateTasks.map(task => {
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
                    style={styles.listTaskCard}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      router.push(`/task-detail?id=${task.id}`);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.listTaskTime}>
                      <Text style={[styles.listTaskTimeText, { color: statusColor }]}>{time}</Text>
                    </View>
                    <View style={[styles.listTaskIndicator, { backgroundColor: categoryColor }]} />
                    <View style={styles.listTaskContent}>
                      <View style={styles.listTaskHeader}>
                        <Text style={styles.listTaskTitle} numberOfLines={1}>
                          {task.title}
                        </Text>
                        <View style={[styles.listTaskStatus, { backgroundColor: statusColor }]}>
                          <Text style={styles.listTaskStatusText}>
                            {task.status === 'completed' ? '✓' : task.status.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.listTaskFooter}>
                        <View style={styles.listTaskCategory}>
                          <Text style={styles.listTaskEmoji}>{categoryEmoji}</Text>
                          <Text style={[styles.listTaskCategoryText, { color: categoryColor }]}>
                            {task.category}
                          </Text>
                        </View>
                        <Text style={styles.listTaskStake}>${task.stake}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
        {Object.keys(groupedTasksByDate).length === 0 && (
          <View style={styles.listEmpty}>
            <CheckCircle2 size={64} color="#D1D5DB" />
            <Text style={styles.listEmptyText}>No upcoming tasks</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderMonthView = () => {
    const today = new Date();
    const weekDayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <View style={styles.monthView}>
        <View style={styles.weekDayHeader}>
          {weekDayNames.map((name, index) => (
            <Text key={index} style={styles.weekDayName}>
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
                onLongPress={() => handleCreateTaskForDate(date)}
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
                {marker && marker.markers.length > 0 && (
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
                onLongPress={() => handleCreateTaskForDate(date)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.weekDayLabel,
                    isToday && styles.weekDayLabelToday,
                    isSelected && styles.weekDayLabelSelected,
                  ]}
                >
                  {weekDayNames[date.getDay()].slice(0, 3)}
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
                {marker && marker.markers.length > 0 && (
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

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <ScrollView style={styles.dayView} contentContainerStyle={styles.dayViewContent}>
        {dayViewTasks.length > 0 ? (
          <View style={styles.timelineView}>
            {hours.map((hour) => {
              const hourTasks = tasksByHour.get(hour) || [];
              const displayTime = `${hour.toString().padStart(2, '0')}:00`;
              
              return (
                <View key={hour} style={styles.timelineSlot}>
                  <View style={styles.timelineSlotHeader}>
                    <Text style={styles.timelineHour}>{displayTime}</Text>
                    <View style={styles.timelineLine} />
                  </View>
                  {hourTasks.length > 0 ? (
                    <View style={styles.timelineTasksContainer}>
                      {hourTasks.map((task) => {
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
                                <Text style={[styles.dayTaskTime, { color: statusColor }]}>{time}</Text>
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
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.dayEmpty}>
            <CheckCircle2 size={64} color="#D1D5DB" />
            <Text style={styles.dayEmptyText}>{t.calendar.noTasks}</Text>
            <Text style={styles.dayEmptySubtext}>Start planning your day</Text>
            <TouchableOpacity
              style={styles.createTaskButton}
              onPress={() => handleCreateTaskForDate(selectedDate)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.createTaskButtonText}>{t.calendar.createTask}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.calendar.title}</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            setPreselectedDate(null);
            setShowTaskModal(true);
          }}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewButton, calendarView === 'day' && styles.viewButtonActive]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setCalendarViewType('day');
          }}
        >
          <Text style={[styles.viewButtonText, calendarView === 'day' && styles.viewButtonTextActive]}>
            {t.calendar.day}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, calendarView === 'week' && styles.viewButtonActive]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setCalendarViewType('week');
          }}
        >
          <Text style={[styles.viewButtonText, calendarView === 'week' && styles.viewButtonTextActive]}>
            {t.calendar.week}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, calendarView === 'month' && styles.viewButtonActive]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setCalendarViewType('month');
          }}
        >
          <Text style={[styles.viewButtonText, calendarView === 'month' && styles.viewButtonTextActive]}>
            {t.calendar.month}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, calendarView === 'list' && styles.viewButtonActive]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setCalendarViewType('list');
          }}
        >
          <List size={16} color={calendarView === 'list' ? '#3B82F6' : '#6B7280'} />
        </TouchableOpacity>
      </View>

      {calendarView !== 'list' && renderDayTicker()}

      <View style={styles.navigation}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
          <ChevronLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.currentDate}>{currentDateDisplay}</Text>
        <TouchableOpacity style={styles.navButton} onPress={handleNext}>
          <ChevronRight size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {calendarView === 'month' && renderMonthView()}
        {calendarView === 'week' && renderWeekView()}
        {calendarView === 'day' && renderDayView()}
        {calendarView === 'list' && renderListView()}
      </ScrollView>

      <View style={styles.hint}>
        <CalendarIcon size={16} color="#3B82F6" />
        <Text style={styles.hintText}>
          {calendarView === 'day'
            ? '💡 Tap + to create a task for today'
            : '💡 Long press a date to quickly create a task'}
        </Text>
      </View>

      {showTaskModal && currentList && (
        <TaskFormModal
          visible={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setPreselectedDate(null);
          }}
          onSubmit={handleTaskSubmit}
          categories={categoryMeta}
          members={currentListMembers}
          defaultGraceMinutes={currentList.defaultGraceMinutes}
          defaultStakeCents={currentList.defaultStakeCents}
          currencySymbol={currentList.currencySymbol}
          existingTask={
            preselectedDate
              ? ({
                  startAt: preselectedDate.toISOString(),
                  endAt: new Date(preselectedDate.getTime() + 3600000).toISOString(),
                  category: 'Household',
                  allDay: false,
                } as any)
              : undefined
          }
          mode="create"
        />
      )}

      <Modal
        visible={showDayAgenda}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDayAgenda(false)}
      >
        <View style={agendaStyles.container}>
          <View style={agendaStyles.header}>
            <View>
              <Text style={agendaStyles.title}>{t.dashboard.tasks}</Text>
              <Text style={agendaStyles.date}>{CalendarService.formatDayDate(agendaDate)}</Text>
            </View>
            <View style={agendaStyles.headerActions}>
              <TouchableOpacity
                style={agendaStyles.createButtonSmall}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  handleCreateTaskForDate(agendaDate);
                  setShowDayAgenda(false);
                }}
              >
                <Plus size={20} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={agendaStyles.closeButton}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setShowDayAgenda(false);
                }}
              >
                <Text style={agendaStyles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={agendaStyles.scroll} contentContainerStyle={agendaStyles.content}>
            {agendaTasks.length > 0 ? (
              agendaTasks.map((task) => {
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
                    style={agendaStyles.task}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setShowDayAgenda(false);
                      router.push(`/task-detail?id=${task.id}`);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[agendaStyles.taskIndicator, { backgroundColor: categoryColor }]} />
                    <View style={agendaStyles.taskContent}>
                      <View style={agendaStyles.taskHeader}>
                        <Text style={agendaStyles.taskTime}>{time}</Text>
                        <View style={[agendaStyles.taskStatus, { backgroundColor: statusColor }]}>
                          <Text style={agendaStyles.taskStatusText}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                      <Text style={agendaStyles.taskTitle} numberOfLines={2}>
                        {task.title}
                      </Text>
                      <View style={agendaStyles.taskMeta}>
                        <Text style={agendaStyles.taskEmoji}>{categoryEmoji}</Text>
                        <Text style={agendaStyles.taskCategory}>{task.category}</Text>
                        <Text style={agendaStyles.taskStake}>${task.stake}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={agendaStyles.empty}>
                <CheckCircle2 size={48} color="#D1D5DB" />
                <Text style={agendaStyles.emptyText}>{t.dashboard.noTasksForDay}</Text>
                <TouchableOpacity
                  style={agendaStyles.createTaskButton}
                  onPress={() => {
                    handleCreateTaskForDate(agendaDate);
                    setShowDayAgenda(false);
                  }}
                >
                  <Plus size={20} color="#FFFFFF" />
                  <Text style={agendaStyles.createTaskButtonText}>{t.calendar.createTask}</Text>
                </TouchableOpacity>
              </View>
            )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewToggle: {
    flexDirection: 'row',
    padding: 3,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    paddingBottom: 12,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  currentDate: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  monthView: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  weekDayHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  weekDayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    textTransform: 'uppercase' as const,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
  },
  dayCell: {
    width: '14.285%',
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  dayCellToday: {
    backgroundColor: '#DBEAFE',
  },
  dayCellSelected: {
    backgroundColor: '#3B82F6',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#111827',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    textAlignVertical: 'center',
    lineHeight: 40,
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
    position: 'absolute',
    bottom: 6,
    flexDirection: 'row',
    gap: 2,
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
    paddingHorizontal: 12,
  },
  weekStrip: {
    flexDirection: 'row',
    gap: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
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
    fontSize: 22,
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
    gap: 2,
    marginTop: 6,
  },
  weekMarker: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dayView: {
    flex: 1,
  },
  dayViewContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  dayTaskCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  dayTaskIndicator: {
    width: 4,
  },
  dayTaskContent: {
    flex: 1,
    padding: 16,
  },
  dayTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayTaskTime: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  dayTaskStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayTaskStatusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  dayTaskTitle: {
    fontSize: 18,
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
    fontSize: 18,
  },
  dayTaskCategoryText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  dayTaskStake: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  dayEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  dayEmptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginTop: 16,
  },
  dayEmptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 24,
  },
  timelineView: {
    flex: 1,
  },
  timelineSlot: {
    marginBottom: 4,
  },
  timelineSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timelineHour: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    width: 50,
  },
  timelineLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 8,
  },
  timelineTasksContainer: {
    marginLeft: 58,
    gap: 8,
    marginBottom: 8,
  },
  createTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createTaskButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#1E40AF',
    flex: 1,
  },
  dayTicker: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dayTickerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tickerDay: {
    width: 52,
    height: 70,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    marginRight: 8,
  },
  tickerDayToday: {
    backgroundColor: '#DBEAFE',
  },
  tickerDaySelected: {
    backgroundColor: '#3B82F6',
  },
  tickerDayName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    marginBottom: 6,
    textTransform: 'uppercase' as const,
  },
  tickerDayNameToday: {
    color: '#3B82F6',
  },
  tickerDayNameSelected: {
    color: '#FFFFFF',
  },
  tickerDayNumber: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 2,
  },
  tickerDayNumberToday: {
    color: '#3B82F6',
  },
  tickerDayNumberSelected: {
    color: '#FFFFFF',
  },
  tickerMarkerRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
  },
  tickerMarker: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  listView: {
    flex: 1,
  },
  listViewContent: {
    padding: 16,
    paddingBottom: 80,
  },
  listGroup: {
    marginBottom: 24,
  },
  listGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listGroupDate: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  listGroupDateToday: {
    color: '#3B82F6',
  },
  listGroupCount: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  listTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listTaskTime: {
    width: 68,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  listTaskTimeText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  listTaskIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
  },
  listTaskContent: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  listTaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  listTaskTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  listTaskStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTaskStatusText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  listTaskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listTaskCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listTaskEmoji: {
    fontSize: 14,
  },
  listTaskCategoryText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  listTaskStake: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#111827',
  },
  listEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  listEmptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    marginTop: 16,
  },
});

const agendaStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  createButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  task: {
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
  taskIndicator: {
    width: 4,
  },
  taskContent: {
    flex: 1,
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTime: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  taskStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskStatusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskEmoji: {
    fontSize: 16,
  },
  taskCategory: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  taskStake: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#111827',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 24,
  },
  createTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createTaskButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
