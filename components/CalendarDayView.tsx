import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  GestureResponderEvent,
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

const HOUR_HEIGHT = 64;
const TOTAL_HEIGHT = 24 * HOUR_HEIGHT;
const MIN_SELECTION_HEIGHT = 30;

export function CalendarDayView({
  selectedDate,
  startTime,
  endTime,
  categoryColor,
  onTimeRangeChange,
  allDay,
}: CalendarDayViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const timelineRef = useRef<View>(null);
  const [timelineTop, setTimelineTop] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const startHour = startTime.getHours();
  const startMinute = startTime.getMinutes();
  const endHour = endTime.getHours();
  const endMinute = endTime.getMinutes();

  useEffect(() => {
    if (scrollViewRef.current && startHour > 0) {
      setTimeout(() => {
        const scrollY = Math.max(0, (startHour - 1) * HOUR_HEIGHT);
        scrollViewRef.current?.scrollTo({ y: scrollY, animated: false });
        setScrollOffset(scrollY);
      }, 100);
    }
  }, [startHour]);

  const format24Hour = useCallback((hour: number, minute: number = 0): string => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }, []);

  const yToTime = useCallback((y: number): { hour: number; minute: number } => {
    const clampedY = Math.max(0, Math.min(TOTAL_HEIGHT - 1, y));
    const totalMinutes = (clampedY / TOTAL_HEIGHT) * 24 * 60;
    const hour = Math.floor(totalMinutes / 60);
    const minute = Math.round((totalMinutes % 60) / 15) * 15;
    return { 
      hour: minute === 60 ? Math.min(23, hour + 1) : hour, 
      minute: minute === 60 ? 0 : minute 
    };
  }, []);

  const timeToY = useCallback((hour: number, minute: number): number => {
    const totalMinutes = hour * 60 + minute;
    return (totalMinutes / (24 * 60)) * TOTAL_HEIGHT;
  }, []);

  const handleTouchStart = useCallback((event: GestureResponderEvent) => {
    if (allDay) return;

    const touch = event.nativeEvent;
    const localY = touch.pageY - timelineTop + scrollOffset;
    
    setDragStartY(localY);
    setIsDragging(true);

    const time = yToTime(localY);
    const newStart = new Date(selectedDate);
    newStart.setHours(time.hour, time.minute, 0, 0);
    const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);
    onTimeRangeChange(newStart, newEnd);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [allDay, timelineTop, scrollOffset, yToTime, selectedDate, onTimeRangeChange]);

  const handleTouchMove = useCallback((event: GestureResponderEvent) => {
    if (!isDragging || dragStartY === null || allDay) return;

    const touch = event.nativeEvent;
    const localY = touch.pageY - timelineTop + scrollOffset;

    const startY = Math.min(dragStartY, localY);
    const endY = Math.max(dragStartY, localY);
    
    if (endY - startY < MIN_SELECTION_HEIGHT) {
      return;
    }

    const startTime = yToTime(startY);
    const endTime = yToTime(endY);

    const newStart = new Date(selectedDate);
    newStart.setHours(startTime.hour, startTime.minute, 0, 0);
    
    const newEnd = new Date(selectedDate);
    newEnd.setHours(endTime.hour, endTime.minute, 0, 0);

    if (newEnd > newStart) {
      onTimeRangeChange(newStart, newEnd);
    }
  }, [isDragging, dragStartY, allDay, timelineTop, scrollOffset, yToTime, selectedDate, onTimeRangeChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setDragStartY(null);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleScroll = useCallback((event: any) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  }, []);

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
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View
          ref={timelineRef}
          style={styles.timelineContainer}
          onLayout={(event) => {
            timelineRef.current?.measureInWindow((x, y) => {
              setTimelineTop(y);
            });
          }}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleTouchStart}
          onResponderMove={handleTouchMove}
          onResponderRelease={handleTouchEnd}
          onResponderTerminate={handleTouchEnd}
        >
          {hours.map(renderTimeSlot)}
          
          {!allDay && (
            <View
              style={[
                styles.selectedRange,
                {
                  top: timeToY(startHour, startMinute),
                  height: Math.max(MIN_SELECTION_HEIGHT, timeToY(endHour, endMinute) - timeToY(startHour, startMinute)),
                  backgroundColor: categoryColor + '20',
                  borderColor: categoryColor,
                },
              ]}
              pointerEvents="none"
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
          )}
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
    paddingLeft: 16,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    justifyContent: 'flex-start',
    backgroundColor: '#FAFAFA',
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
    left: 64,
    right: 16,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
