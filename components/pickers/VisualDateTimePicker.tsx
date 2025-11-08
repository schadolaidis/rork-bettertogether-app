import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import { ModalSheet } from '@/components/interactive/modals/ModalSheet';

interface VisualDateTimePickerProps {
  visible: boolean;
  onClose: () => void;
  value: string | null;
  onChange: (value: string | null) => void;
  testID?: string;
  disablePast?: boolean;
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const TimePickerWheel: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const [hour, minute] = value.split(':').map(Number);

  const incrementHour = () => {
    const newHour = (hour + 1) % 24;
    onChange(`${newHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const decrementHour = () => {
    const newHour = (hour - 1 + 24) % 24;
    onChange(`${newHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const incrementMinute = () => {
    let newMinute = minute + 15;
    let newHour = hour;
    if (newMinute >= 60) {
      newMinute = 0;
      newHour = (hour + 1) % 24;
    }
    onChange(`${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const decrementMinute = () => {
    let newMinute = minute - 15;
    let newHour = hour;
    if (newMinute < 0) {
      newMinute = 45;
      newHour = (hour - 1 + 24) % 24;
    }
    onChange(`${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.timePickerWheel}>
      <Text style={styles.timePickerWheelLabel}>{label}</Text>
      <View style={styles.timeWheelContainer}>
        <View style={styles.timeWheelColumn}>
          <Pressable
            onPress={decrementHour}
            style={({ pressed }) => [
              styles.timeWheelButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            hitSlop={8}
          >
            <ChevronLeft size={24} color="#3B82F6" strokeWidth={2.5} style={{ transform: [{ rotate: '90deg' }] }} />
          </Pressable>
          <View style={styles.timeWheelValue}>
            <Text style={styles.timeWheelText}>{hour.toString().padStart(2, '0')}</Text>
          </View>
          <Pressable
            onPress={incrementHour}
            style={({ pressed }) => [
              styles.timeWheelButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            hitSlop={8}
          >
            <ChevronRight size={24} color="#3B82F6" strokeWidth={2.5} style={{ transform: [{ rotate: '90deg' }] }} />
          </Pressable>
        </View>

        <Text style={styles.timeWheelSeparator}>:</Text>

        <View style={styles.timeWheelColumn}>
          <Pressable
            onPress={decrementMinute}
            style={({ pressed }) => [
              styles.timeWheelButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            hitSlop={8}
          >
            <ChevronLeft size={24} color="#3B82F6" strokeWidth={2.5} style={{ transform: [{ rotate: '90deg' }] }} />
          </Pressable>
          <View style={styles.timeWheelValue}>
            <Text style={styles.timeWheelText}>{minute.toString().padStart(2, '0')}</Text>
          </View>
          <Pressable
            onPress={incrementMinute}
            style={({ pressed }) => [
              styles.timeWheelButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            hitSlop={8}
          >
            <ChevronRight size={24} color="#3B82F6" strokeWidth={2.5} style={{ transform: [{ rotate: '90deg' }] }} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export const VisualDateTimePicker: React.FC<VisualDateTimePickerProps> = ({
  visible,
  onClose,
  value,
  onChange,
  testID,
  disablePast = false,
}) => {
  const parseInitialValue = useCallback((isoString: string | null) => {
    if (!isoString) {
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
      now.setHours(now.getHours() + 1);
      const endTime = new Date(now);
      endTime.setHours(endTime.getHours() + 1);
      
      return {
        date: now.toISOString().split('T')[0],
        startTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        endTime: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
        allDay: false,
      };
    }

    try {
      const d = new Date(isoString);
      const dateStr = d.toISOString().split('T')[0];
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const isAllDay = hours === 0 && minutes === 0;
      const startTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const endDate = new Date(d);
      endDate.setHours(endDate.getHours() + 1);
      const endTimeStr = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      return {
        date: dateStr,
        startTime: isAllDay ? '09:00' : startTimeStr,
        endTime: isAllDay ? '10:00' : endTimeStr,
        allDay: isAllDay,
      };
    } catch {
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
      now.setHours(now.getHours() + 1);
      const endTime = new Date(now);
      endTime.setHours(endTime.getHours() + 1);
      
      return {
        date: now.toISOString().split('T')[0],
        startTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        endTime: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
        allDay: false,
      };
    }
  }, []);

  const initialState = useMemo(() => parseInitialValue(value), [value, parseInitialValue]);
  const [selectedDate, setSelectedDate] = useState<string>(initialState.date);
  const [startTime, setStartTime] = useState<string>(initialState.startTime);
  const [endTime, setEndTime] = useState<string>(initialState.endTime);
  const [isAllDay, setIsAllDay] = useState(initialState.allDay);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(initialState.date));

  const handleDateSelect = useCallback((dateStr: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedDate(dateStr);
    const newDate = new Date(dateStr);
    setCurrentMonth(newDate);
  }, []);

  const handleDone = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const startHour = parseInt(startTime.split(':')[0], 10);
    const startMinute = parseInt(startTime.split(':')[1], 10);
    const endHour = parseInt(endTime.split(':')[0], 10);
    const endMinute = parseInt(endTime.split(':')[1], 10);

    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(isAllDay ? 0 : startHour, isAllDay ? 0 : startMinute, 0, 0);

    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(isAllDay ? 23 : endHour, isAllDay ? 59 : endMinute, isAllDay ? 59 : 0, isAllDay ? 999 : 0);

    if (endDateTime <= startDateTime && !isAllDay) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    onChange(startDateTime.toISOString());
    onClose();
  }, [selectedDate, startTime, endTime, isAllDay, onChange, onClose]);

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: { date: string; isCurrentMonth: boolean }[] = [];

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d.toISOString().split('T')[0],
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d.toISOString().split('T')[0],
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d.toISOString().split('T')[0],
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth]);



  const isToday = useCallback((dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  }, []);

  const isPastDate = useCallback((dateStr: string) => {
    if (!disablePast) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  }, [disablePast]);

  const monthName = useMemo(() => {
    return currentMonth.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  const handlePrevMonth = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  }, [currentMonth]);

  const formatDisplayDate = useMemo(() => {
    const date = new Date(selectedDate);
    return date.toLocaleDateString('de-DE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, [selectedDate]);

  const footer = (
    <View style={styles.footerContainer}>
      <Pressable
        onPress={onClose}
        style={({ pressed }) => [
          styles.footerButton,
          styles.footerButtonCancel,
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Text style={styles.footerButtonTextCancel}>Abbrechen</Text>
      </Pressable>
      <Pressable
        onPress={handleDone}
        style={({ pressed }) => [
          styles.footerButton,
          styles.footerButtonPrimary,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text style={styles.footerButtonTextPrimary}>Übernehmen</Text>
      </Pressable>
    </View>
  );

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title="Datum & Uhrzeit"
      showCloseButton={true}
      footer={footer}
      maxHeight={Platform.OS === 'web' ? 800 : undefined}
      testID={testID}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <Pressable
              onPress={handlePrevMonth}
              style={({ pressed }) => [
                styles.navButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              hitSlop={8}
            >
              <ChevronLeft size={24} color="#3B82F6" strokeWidth={2.5} />
            </Pressable>
            <Text style={styles.monthName}>{monthName}</Text>
            <Pressable
              onPress={handleNextMonth}
              style={({ pressed }) => [
                styles.navButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              hitSlop={8}
            >
              <ChevronRight size={24} color="#3B82F6" strokeWidth={2.5} />
            </Pressable>
          </View>

          <View style={styles.weekDayHeaders}>
            {WEEKDAYS.map((day, i) => (
              <View key={i} style={styles.weekDayHeader}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {monthDays.map((item, index) => {
              const isSelected = item.date === selectedDate;
              const isTodayDate = isToday(item.date);
              const isPast = isPastDate(item.date);
              const date = new Date(item.date);
              const dayNum = date.getDate();

              return (
                <Pressable
                  key={index}
                  onPress={() => {
                    if (!isPast) {
                      handleDateSelect(item.date);
                    }
                  }}
                  disabled={isPast}
                  hitSlop={2}
                  style={({ pressed }) => [
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isTodayDate && !isSelected && styles.dayCellToday,
                    pressed && !isSelected && !isPast && styles.dayCellPressed,
                    isPast && styles.dayCellPast,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      !item.isCurrentMonth && styles.dayTextOtherMonth,
                      isPast && styles.dayTextPast,
                    ]}
                  >
                    {dayNum}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.selectedDateDisplay}>
          <Clock size={18} color="#3B82F6" />
          <Text style={styles.selectedDateText}>{formatDisplayDate}</Text>
        </View>

        <View style={styles.timeSection}>
          <View style={styles.timeSectionHeader}>
            <Text style={styles.sectionTitle}>Uhrzeit</Text>
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setIsAllDay(!isAllDay);
              }}
              style={({ pressed }) => [
                styles.allDayToggle,
                isAllDay && styles.allDayToggleActive,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.allDayToggleText, isAllDay && styles.allDayToggleTextActive]}>
                Ganztägig
              </Text>
            </Pressable>
          </View>

          {!isAllDay && (
            <View style={styles.timePickersContainer}>
              <TimePickerWheel
                value={startTime}
                onChange={setStartTime}
                label="Von"
              />
              <TimePickerWheel
                value={endTime}
                onChange={setEndTime}
                label="Bis"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  calendarSection: {
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  monthName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    textTransform: 'capitalize',
  },
  weekDayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: '#3B82F6',
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  dayCellPressed: {
    backgroundColor: '#EFF6FF',
  },
  dayCellPast: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#111827',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  dayTextOtherMonth: {
    color: '#9CA3AF',
  },
  dayTextPast: {
    color: '#D1D5DB',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  selectedDateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginBottom: 20,
  },
  selectedDateText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1E40AF',
  },
  timeSection: {
    gap: 16,
  },
  timeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#111827',
  },
  allDayToggle: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  allDayToggleActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  allDayToggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  allDayToggleTextActive: {
    color: '#3B82F6',
  },
  timePickersContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 16,
  },
  timePickerWheel: {
    flex: 1,
    gap: 12,
  },
  timePickerWheelLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
    textAlign: 'center',
  },
  timeWheelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  timeWheelColumn: {
    alignItems: 'center',
    gap: 8,
  },
  timeWheelButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
  },
  timeWheelValue: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 56,
    alignItems: 'center',
  },
  timeWheelText: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#3B82F6',
  },
  timeWheelSeparator: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#3B82F6',
    marginHorizontal: 4,
  },
  footerContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  footerButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  footerButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  footerButtonTextCancel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#6B7280',
  },
  footerButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
