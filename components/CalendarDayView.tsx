import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  PanResponder,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Clock } from 'lucide-react-native';
import { Task } from '@/types';

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

const HOUR_HEIGHT = 60;
const TOTAL_HEIGHT = 24 * HOUR_HEIGHT;

export function CalendarDayView({
  selectedDate,
  startTime,
  endTime,
  categoryColor,
  onTimeRangeChange,
  allDay,
}: CalendarDayViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const containerRef = useRef<View>(null);
  const [containerY, setContainerY] = useState(0);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const startHour = startTime.getHours();
  const startMinute = startTime.getMinutes();
  const endHour = endTime.getHours();
  const endMinute = endTime.getMinutes();

  useEffect(() => {
    if (scrollViewRef.current && startHour > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: Math.max(0, startHour * HOUR_HEIGHT - 100), animated: false });
      }, 100);
    }
  }, [startHour]);

  const format24Hour = useCallback((hour: number, minute: number = 0): string => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }, []);

  const yToTime = useCallback((y: number): { hour: number; minute: number } => {
    const totalMinutes = Math.max(0, Math.min(24 * 60 - 1, (y / TOTAL_HEIGHT) * 24 * 60));
    const hour = Math.floor(totalMinutes / 60);
    const minute = Math.round((totalMinutes % 60) / 15) * 15;
    return { hour, minute: minute === 60 ? 0 : minute };
  }, []);

  const timeToY = useCallback((hour: number, minute: number): number => {
    return ((hour * 60 + minute) / (24 * 60)) * TOTAL_HEIGHT;
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt, gestureState) => {
          if (allDay) return;
          
          const y = gestureState.y0 - containerY;
          setDragStart(y);
          setIsDragging(true);

          const time = yToTime(y);
          const newStart = new Date(selectedDate);
          newStart.setHours(time.hour, time.minute, 0, 0);
          onTimeRangeChange(newStart, newStart);

          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        },
        onPanResponderMove: (evt, gestureState) => {
          if (!isDragging || dragStart === null || allDay) return;

          const currentY = gestureState.moveY - containerY;
          const startY = Math.min(dragStart, currentY);
          const endY = Math.max(dragStart, currentY);

          const startTime = yToTime(startY);
          const endTime = yToTime(endY);

          const newStart = new Date(selectedDate);
          newStart.setHours(startTime.hour, startTime.minute, 0, 0);
          
          const newEnd = new Date(selectedDate);
          if (endTime.hour === startTime.hour && endTime.minute === startTime.minute) {
            newEnd.setTime(newStart.getTime() + 30 * 60 * 1000);
          } else {
            newEnd.setHours(endTime.hour, endTime.minute, 0, 0);
          }

          onTimeRangeChange(newStart, newEnd);
        },
        onPanResponderRelease: () => {
          setIsDragging(false);
          setDragStart(null);

          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
      }),
    [isDragging, dragStart, allDay, containerY, yToTime, selectedDate, onTimeRangeChange]
  );

  const renderTimeSlot = useCallback((hour: number) => {
    return (
      <View
        key={hour}
        style={styles.hourSlot}
      >
        <View style={styles.hourSlotContent}>
          <Text style={styles.hourText}>
            {format24Hour(hour)}
          </Text>
        </View>
      </View>
    );
  }, [format24Hour]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Clock size={20} color="#3B82F6" />
        <Text style={styles.title}>Select Time</Text>
      </View>

      <View style={styles.timeDisplay}>
        <View style={styles.timeDisplayRow}>
          <Text style={styles.timeDisplayLabel}>From</Text>
          <Text style={[styles.timeDisplayValue, { color: categoryColor }]}>
            {format24Hour(startHour, startMinute)}
          </Text>
        </View>
        <Text style={styles.timeDisplayArrow}>→</Text>
        <View style={styles.timeDisplayRow}>
          <Text style={styles.timeDisplayLabel}>To</Text>
          <Text style={[styles.timeDisplayValue, { color: categoryColor }]}>
            {format24Hour(endHour, endMinute)}
          </Text>
        </View>
      </View>

      <View style={styles.instructionBanner}>
        <Text style={styles.instructionText}>Drag on the timeline to select a time range</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={!isDragging}
      >
        <View
          ref={containerRef}
          style={styles.timelineContainer}
          onLayout={(event) => {
            containerRef.current?.measureInWindow((x, y) => {
              setContainerY(y);
            });
          }}
          {...panResponder.panHandlers}
        >
          {hours.map(renderTimeSlot)}
          
          <View
            style={[
              styles.selectedRange,
              {
                top: timeToY(startHour, startMinute),
                height: Math.max(30, timeToY(endHour, endMinute) - timeToY(startHour, startMinute)),
                backgroundColor: categoryColor + '20',
                borderColor: categoryColor,
              },
            ]}
          >
            <View style={[styles.rangeHandle, styles.rangeHandleTop, { backgroundColor: categoryColor }]}>
              <View style={styles.rangeHandleBar} />
            </View>
            <View style={styles.rangeContent}>
              <Text style={[styles.rangeTime, { color: categoryColor }]}>
                {format24Hour(startHour, startMinute)}
              </Text>
              <Text style={[styles.rangeTime, { color: categoryColor }]}>
                {format24Hour(endHour, endMinute)}
              </Text>
            </View>
            <View style={[styles.rangeHandle, styles.rangeHandleBottom, { backgroundColor: categoryColor }]}>
              <View style={styles.rangeHandleBar} />
            </View>
          </View>
        </View>
      </ScrollView>
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
  instructionBanner: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  instructionText: {
    fontSize: 13,
    color: '#1E40AF',
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeDisplayRow: {
    alignItems: 'center',
    gap: 4,
  },
  timeDisplayLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeDisplayValue: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  timeDisplayArrow: {
    fontSize: 20,
    color: '#D1D5DB',
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  timelineContainer: {
    position: 'relative',
    height: TOTAL_HEIGHT,
  },
  hourSlot: {
    height: HOUR_HEIGHT,
    paddingVertical: 0,
    paddingLeft: 20,
    paddingRight: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    justifyContent: 'flex-start',
  },
  hourSlotContent: {
    paddingTop: 8,
  },
  hourText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500' as const,
    fontVariant: ['tabular-nums'],
  },
  selectedRange: {
    position: 'absolute',
    left: 70,
    right: 20,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  rangeHandle: {
    height: 24,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeHandleTop: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  rangeHandleBottom: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  rangeHandleBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  rangeContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rangeTime: {
    fontSize: 14,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'],
  },
});
