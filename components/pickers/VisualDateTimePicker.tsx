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

const TimeSlot: React.FC<{
  label: string;
  time: string;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ label, time, isSelected, onSelect }) => {
  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onSelect();
      }}
      style={({ pressed }) => [
        styles.timeSlot,
        isSelected && styles.timeSlotSelected,
        pressed && !isSelected && styles.timeSlotPressed,
      ]}
    >
      <Text style={[styles.timeSlotLabel, isSelected && styles.timeSlotLabelSelected]}>
        {label}
      </Text>
      <Text style={[styles.timeSlotTime, isSelected && styles.timeSlotTimeSelected]}>
        {time}
      </Text>
    </Pressable>
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

  const timeSlots = useMemo(() => {
    const slots: { label: string; time: string }[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({ label: timeStr, time: timeStr });
      }
    }
    return slots;
  }, []);

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
            <>
              <View style={styles.timePickerRow}>
                <View style={styles.timePickerColumn}>
                  <Text style={styles.timePickerLabel}>Von</Text>
                  <Pressable
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    style={styles.timePickerButton}
                  >
                    <Text style={styles.timePickerButtonText}>{startTime}</Text>
                  </Pressable>
                </View>
                <Text style={styles.timePickerSeparator}>–</Text>
                <View style={styles.timePickerColumn}>
                  <Text style={styles.timePickerLabel}>Bis</Text>
                  <Pressable
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    style={styles.timePickerButton}
                  >
                    <Text style={styles.timePickerButtonText}>{endTime}</Text>
                  </Pressable>
                </View>
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.timeSlotScroll}
                contentContainerStyle={styles.timeSlotContainer}
              >
                {timeSlots.map((slot, index) => (
                  <TimeSlot
                    key={index}
                    label={slot.label}
                    time={slot.time}
                    isSelected={slot.time === startTime}
                    onSelect={() => {
                      setStartTime(slot.time);
                      const [h, m] = slot.time.split(':').map(Number);
                      let endH = h + 1;
                      const endM = m;
                      if (endH >= 24) endH = 0;
                      setEndTime(`${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`);
                    }}
                  />
                ))}
              </ScrollView>
            </>
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
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  timePickerColumn: {
    flex: 1,
    gap: 8,
  },
  timePickerLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
    textAlign: 'center',
  },
  timePickerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  timePickerButtonText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#3B82F6',
  },
  timePickerSeparator: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#6B7280',
    marginTop: 20,
  },
  timeSlotScroll: {
    marginTop: 8,
  },
  timeSlotContainer: {
    gap: 8,
    paddingHorizontal: 4,
  },
  timeSlot: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minWidth: 70,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  timeSlotPressed: {
    backgroundColor: '#E5E7EB',
  },
  timeSlotLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 2,
  },
  timeSlotLabelSelected: {
    color: '#BFDBFE',
  },
  timeSlotTime: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  timeSlotTimeSelected: {
    color: '#FFFFFF',
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
