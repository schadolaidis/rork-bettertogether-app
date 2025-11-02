import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { AppBar } from '@/components/design-system/AppBar';
import { WeekScroller } from '@/components/interactive/timeline/WeekScroller';
import { TimelineList } from '@/components/interactive/timeline/TimelineList';
import type { Task } from '@/types';

export default function Calendar() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tasks, selectedDate, setCalendarSelectedDate } = useApp();

  const [localSelectedDate, setLocalSelectedDate] = useState<Date>(selectedDate);

  const filteredTasks = useMemo(() => {
    const startOfDay = new Date(localSelectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(localSelectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    return tasks.filter((task) => {
      const taskStart = new Date(task.startAt);
      const taskEnd = new Date(task.endAt);
      
      return (
        (taskStart >= startOfDay && taskStart <= endOfDay) ||
        (taskEnd >= startOfDay && taskEnd <= endOfDay) ||
        (taskStart <= startOfDay && taskEnd >= endOfDay)
      );
    });
  }, [tasks, localSelectedDate]);

  const handleDateSelect = useCallback((date: Date) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalSelectedDate(date);
    setCalendarSelectedDate(date);
    console.log('[Calendar] Selected date:', date.toDateString());
  }, [setCalendarSelectedDate]);

  const handleMonthChange = useCallback((direction: 'prev' | 'next') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const newDate = new Date(localSelectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    
    setLocalSelectedDate(newDate);
    setCalendarSelectedDate(newDate);
    console.log('[Calendar] Month changed:', direction);
  }, [localSelectedDate, setCalendarSelectedDate]);

  const handleTimeBlockPress = useCallback((date: Date, hour: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const taskDate = new Date(date);
    taskDate.setHours(hour, 0, 0, 0);
    
    console.log('[Calendar] Time block pressed:', taskDate.toISOString());
    router.push(`/task-detail?new=true&date=${taskDate.toISOString()}`);
  }, [router]);

  const handleTaskPress = useCallback((task: Task) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    console.log('[Calendar] Task pressed:', task.id);
    router.push(`/task-detail?id=${task.id}`);
  }, [router]);

  const handleAddTask = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const taskDate = new Date(localSelectedDate);
    taskDate.setHours(9, 0, 0, 0);
    
    console.log('[Calendar] Add task for date:', taskDate.toISOString());
    router.push(`/task-detail?new=true&date=${taskDate.toISOString()}`);
  }, [localSelectedDate, router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppBar title="Calendar" testID="calendar-appbar" />
      
      <View style={styles.weekScrollerContainer}>
        <WeekScroller
          selectedDate={localSelectedDate}
          onDateSelect={handleDateSelect}
          onMonthChange={handleMonthChange}
        />
      </View>

      <TimelineList
        selectedDate={localSelectedDate}
        tasks={filteredTasks}
        onTimeBlockPress={handleTimeBlockPress}
        onTaskPress={handleTaskPress}
        startHour={8}
        endHour={20}
      />

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            bottom: insets.bottom + 80,
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
  weekScrollerContainer: {
    position: 'sticky' as any,
    top: 0,
    zIndex: 10,
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
