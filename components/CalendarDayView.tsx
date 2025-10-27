import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Clock, AlertCircle } from 'lucide-react-native';
import { Task } from '@/types';

interface TimeSlot {
  hour: number;
  minute: number;
}

interface CalendarDayViewProps {
  selectedDate: Date;
  startTime: Date;
  endTime: Date;
  categoryColor: string;
  onTimeRangeChange: (start: Date, end: Date) => void;
  allDay: boolean;
  existingTasks?: Task[];
  locale?: string;
}

interface ConflictInfo {
  hasConflict: boolean;
  conflictingTasks: Task[];
}

export function CalendarDayView({
  selectedDate,
  startTime,
  endTime,
  categoryColor,
  onTimeRangeChange,
  allDay,
  existingTasks = [],
  locale = 'de-AT',
}: CalendarDayViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'start' | 'end' | 'new' | null>(null);
  const [dragStartSlot, setDragStartSlot] = useState<TimeSlot | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const startHour = startTime.getHours();
  const startMinute = startTime.getMinutes();
  const endHour = endTime.getHours();
  const endMinute = endTime.getMinutes();

  const format24Hour = useCallback((hour: number, minute: number = 0): string => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }, []);

  const checkConflict = useCallback((start: Date, end: Date): ConflictInfo => {
    const conflicts = existingTasks.filter((task) => {
      if (task.allDay) return false;
      
      const taskStart = new Date(task.startAt);
      const taskEnd = new Date(task.endAt);
      
      const isSameDay = taskStart.toDateString() === selectedDate.toDateString();
      if (!isSameDay) return false;

      return (
        (start >= taskStart && start < taskEnd) ||
        (end > taskStart && end <= taskEnd) ||
        (start <= taskStart && end >= taskEnd)
      );
    });

    return {
      hasConflict: conflicts.length > 0,
      conflictingTasks: conflicts,
    };
  }, [existingTasks, selectedDate]);

  const currentConflict = useMemo(() => {
    return checkConflict(startTime, endTime);
  }, [startTime, endTime, checkConflict]);

  const createTimeFromSlot = useCallback((slot: TimeSlot): Date => {
    const date = new Date(selectedDate);
    date.setHours(slot.hour, slot.minute, 0, 0);
    return date;
  }, [selectedDate]);

  const handleSlotPress = useCallback((hour: number) => {
    if (allDay) return;

    const newStart = new Date(selectedDate);
    newStart.setHours(hour, 0, 0, 0);
    const newEnd = new Date(newStart);
    newEnd.setHours(hour + 1, 0, 0, 0);

    onTimeRangeChange(newStart, newEnd);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [selectedDate, allDay, onTimeRangeChange]);

  const handleDragStart = useCallback((hour: number, type: 'new' | 'resize-start' | 'resize-end') => {
    if (allDay) return;

    setIsDragging(true);
    setDragStartSlot({ hour, minute: 0 });

    if (type === 'new') {
      setDragType('new');
      const newStart = new Date(selectedDate);
      newStart.setHours(hour, 0, 0, 0);
      onTimeRangeChange(newStart, newStart);
    } else if (type === 'resize-start') {
      setDragType('start');
    } else if (type === 'resize-end') {
      setDragType('end');
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [selectedDate, allDay, onTimeRangeChange]);

  const handleDragMove = useCallback((hour: number) => {
    if (!isDragging || !dragStartSlot || allDay) return;

    if (dragType === 'new') {
      const start = Math.min(dragStartSlot.hour, hour);
      const end = Math.max(dragStartSlot.hour, hour) + 1;
      
      const newStart = new Date(selectedDate);
      newStart.setHours(start, 0, 0, 0);
      const newEnd = new Date(selectedDate);
      newEnd.setHours(end, 0, 0, 0);
      
      onTimeRangeChange(newStart, newEnd);
    } else if (dragType === 'start') {
      if (hour < endHour) {
        const newStart = new Date(selectedDate);
        newStart.setHours(hour, 0, 0, 0);
        onTimeRangeChange(newStart, endTime);
      }
    } else if (dragType === 'end') {
      if (hour >= startHour) {
        const newEnd = new Date(selectedDate);
        newEnd.setHours(hour + 1, 0, 0, 0);
        onTimeRangeChange(startTime, newEnd);
      }
    }
  }, [isDragging, dragStartSlot, dragType, selectedDate, startHour, endHour, allDay, startTime, endTime, onTimeRangeChange]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
    setDragStartSlot(null);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const isSlotInRange = useCallback((hour: number): boolean => {
    const slotStart = hour;
    const slotEnd = hour + 1;
    
    const rangeStart = startHour + (startMinute > 0 ? 1 : 0);
    const rangeEnd = endHour;

    return slotStart >= rangeStart - 1 && slotStart < rangeEnd;
  }, [startHour, startMinute, endHour]);

  const isSlotStart = useCallback((hour: number): boolean => {
    return hour === startHour;
  }, [startHour]);

  const isSlotEnd = useCallback((hour: number): boolean => {
    return hour === endHour - 1;
  }, [endHour]);

  const renderTimeSlot = useCallback((hour: number) => {
    const inRange = isSlotInRange(hour);
    const isStart = isSlotStart(hour);
    const isEnd = isSlotEnd(hour);

    return (
      <TouchableOpacity
        key={hour}
        style={[
          styles.hourSlot,
          inRange && { 
            backgroundColor: categoryColor + '15',
            borderLeftColor: categoryColor,
            borderLeftWidth: 4,
          },
          isStart && styles.hourSlotStart,
          isEnd && styles.hourSlotEnd,
        ]}
        onPress={() => handleSlotPress(hour)}
        onLongPress={() => handleDragStart(hour, 'new')}
        onPressIn={() => isDragging && handleDragMove(hour)}
        onPressOut={handleDragEnd}
        activeOpacity={0.7}
      >
        <View style={styles.hourSlotContent}>
          <Text
            style={[
              styles.hourText,
              inRange && { color: categoryColor, fontWeight: '700' as const },
            ]}
          >
            {format24Hour(hour)}
          </Text>
          {isStart && (
            <View style={[styles.marker, { backgroundColor: categoryColor }]}>
              <Text style={styles.markerText}>Start</Text>
            </View>
          )}
          {isEnd && (
            <View style={[styles.marker, { backgroundColor: categoryColor }]}>
              <Text style={styles.markerText}>End</Text>
            </View>
          )}
        </View>
        {inRange && !isStart && !isEnd && (
          <View style={[styles.rangeBar, { backgroundColor: categoryColor }]} />
        )}
      </TouchableOpacity>
    );
  }, [
    isSlotInRange,
    isSlotStart,
    isSlotEnd,
    categoryColor,
    format24Hour,
    handleSlotPress,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    isDragging,
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Clock size={20} color="#3B82F6" />
        <Text style={styles.title}>Zeitbereich auswählen</Text>
      </View>
      
      <Text style={styles.subtitle}>
        Tippen Sie eine Stunde an oder ziehen Sie, um einen Bereich auszuwählen
      </Text>

      {currentConflict.hasConflict && (
        <View style={styles.conflictBanner}>
          <AlertCircle size={18} color="#F59E0B" />
          <Text style={styles.conflictText}>
            Überschneidung mit {currentConflict.conflictingTasks.length} anderen Aufgabe(n)
          </Text>
        </View>
      )}

      <View style={styles.timeDisplay}>
        <View style={styles.timeDisplayRow}>
          <Text style={styles.timeDisplayLabel}>Start:</Text>
          <Text style={[styles.timeDisplayValue, { color: categoryColor }]}>
            {format24Hour(startHour, startMinute)}
          </Text>
        </View>
        <Text style={styles.timeDisplayArrow}>→</Text>
        <View style={styles.timeDisplayRow}>
          <Text style={styles.timeDisplayLabel}>Ende:</Text>
          <Text style={[styles.timeDisplayValue, { color: categoryColor }]}>
            {format24Hour(endHour, endMinute)}
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {hours.map(renderTimeSlot)}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerHint}>
          Tipp: Halten Sie gedrückt, um einen neuen Bereich zu erstellen
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  conflictBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  conflictText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500' as const,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeDisplayLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  timeDisplayValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  timeDisplayArrow: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  hourSlot: {
    minHeight: 60,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
    justifyContent: 'center',
  },
  hourSlotStart: {
    borderTopWidth: 2,
  },
  hourSlotEnd: {
    borderBottomWidth: 2,
  },
  hourSlotContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hourText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500' as const,
    fontVariant: ['tabular-nums'],
  },
  marker: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  markerText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  rangeBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerHint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
