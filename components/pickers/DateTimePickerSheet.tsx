import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  useWindowDimensions,
  TextInput,
  Keyboard,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, Keyboard as KeyboardIcon } from 'lucide-react-native';
import { ModalSheet } from '@/components/interactive/modals/ModalSheet';
import { useTheme } from '@/contexts/ThemeContext';

interface DateTimePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  value: string | null;
  onChange: (value: string | null) => void;
  testID?: string;
  disablePast?: boolean;
  initialFocus?: 'date' | 'time';
}

type TimePickerMode = 'dial' | 'keyboard';

const WEEKDAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DateTimePickerSheet: React.FC<DateTimePickerSheetProps> = ({
  visible,
  onClose,
  value,
  onChange,
  testID,
  disablePast = false,
  initialFocus = 'date',
}) => {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const getDeviceTimezone = () => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  };

  const parseInitialValue = (isoString: string | null) => {
    if (!isoString) {
      const now = new Date();
      return {
        date: now.toISOString().split('T')[0],
        time: null as string | null,
        allDay: false,
        timezone: getDeviceTimezone(),
      };
    }

    try {
      const d = new Date(isoString);
      const dateStr = d.toISOString().split('T')[0];
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const isAllDay = hours === 0 && minutes === 0;
      const timeStr = isAllDay ? null : `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      return {
        date: dateStr,
        time: timeStr,
        allDay: isAllDay,
        timezone: getDeviceTimezone(),
      };
    } catch {
      const now = new Date();
      return {
        date: now.toISOString().split('T')[0],
        time: null,
        allDay: false,
        timezone: getDeviceTimezone(),
      };
    }
  };

  const initialState = parseInitialValue(value);
  const [selectedDate, setSelectedDate] = useState<string>(initialState.date);
  const [selectedTime, setSelectedTime] = useState<string | null>(initialState.time);
  const [isAllDay, setIsAllDay] = useState(initialState.allDay);
  const [timezone] = useState(initialState.timezone);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(initialState.date));
  const [timePickerMode, setTimePickerMode] = useState<TimePickerMode>('dial');
  const [keyboardTimeInput, setKeyboardTimeInput] = useState('');
  const [keyboardTimeError, setKeyboardTimeError] = useState('');

  useEffect(() => {
    if (visible) {
      const state = parseInitialValue(value);
      setSelectedDate(state.date);
      setSelectedTime(state.time);
      setIsAllDay(state.allDay);
      setCurrentMonth(new Date(state.date));
      setKeyboardTimeInput('');
      setKeyboardTimeError('');
    }
  }, [visible, value]);

  const calendarWidth = Math.min(screenWidth - 32, 400);
  const dayCellSize = Math.floor((calendarWidth - 24) / 7);

  const handleQuickChip = (type: 'today' | 'tomorrow' | 'nextWeek' | 'thisWeekend' | 'nextMonth') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const now = new Date();
    let newDate: Date;

    switch (type) {
      case 'today':
        newDate = now;
        break;
      case 'tomorrow':
        newDate = new Date(now);
        newDate.setDate(now.getDate() + 1);
        break;
      case 'thisWeekend':
        newDate = new Date(now);
        const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
        newDate.setDate(now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
        break;
      case 'nextWeek':
        newDate = new Date(now);
        newDate.setDate(now.getDate() + 7);
        break;
      case 'nextMonth':
        newDate = new Date(now);
        newDate.setMonth(now.getMonth() + 1);
        break;
    }

    const dateStr = newDate.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setCurrentMonth(newDate);
    console.log('[DatePicker] Quick chip selected:', type, dateStr);
  };

  const handleTimeChip = (time: string | 'now') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    let finalTime = time;
    if (time === 'now') {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      finalTime = `${hours}:${minutes}`;
    }

    setSelectedTime(finalTime);
    setIsAllDay(false);
    setKeyboardTimeInput('');
    setKeyboardTimeError('');
    console.log('[TimePicker] Time chip selected:', time, '→', finalTime);
  };

  const handleDateSelect = (dateStr: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedDate(dateStr);
    const newDate = new Date(dateStr);
    setCurrentMonth(newDate);
    console.log('[DatePicker] Date selected:', dateStr);
  };

  const handleAllDayToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newAllDay = !isAllDay;
    setIsAllDay(newAllDay);
    if (newAllDay) {
      setSelectedTime(null);
    }
    console.log('[DatePicker] All-day toggled:', newAllDay);
  };

  const validateTimeInput = (input: string): { valid: boolean; time?: string; error?: string } => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    const match = input.match(timeRegex);

    if (!match) {
      return { valid: false, error: 'Enter valid time (HH:MM)' };
    }

    const hours = match[1].padStart(2, '0');
    const minutes = match[2];
    return { valid: true, time: `${hours}:${minutes}` };
  };

  const handleKeyboardTimeConfirm = () => {
    const result = validateTimeInput(keyboardTimeInput);
    if (result.valid && result.time) {
      setSelectedTime(result.time);
      setIsAllDay(false);
      setKeyboardTimeError('');
      Keyboard.dismiss();
      console.log('[TimePicker] Keyboard time confirmed:', result.time);
    } else {
      setKeyboardTimeError(result.error || 'Invalid time');
    }
  };

  const handleDone = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    let isoString: string;

    if (isAllDay) {
      isoString = `${selectedDate}T00:00:00`;
    } else if (selectedTime) {
      isoString = `${selectedDate}T${selectedTime}:00`;
    } else {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      isoString = `${selectedDate}T${hours}:${minutes}:00`;
    }

    console.log('[DatePicker] Done pressed:', {
      date: selectedDate,
      time: selectedTime,
      allDay: isAllDay,
      timezone,
      isoString,
    });

    onChange(isoString);
    onClose();
  };

  const handleCancel = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: { date: string; isCurrentMonth: boolean }[] = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
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

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const isPastDate = (dateStr: string) => {
    if (!disablePast) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  };

  const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const toggleTimePickerMode = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTimePickerMode((prev) => (prev === 'dial' ? 'keyboard' : 'dial'));
    setKeyboardTimeError('');
  };

  const footer = (
    <View style={styles.footerContainer}>
      <Pressable
        onPress={handleCancel}
        style={({ pressed }) => [
          styles.footerButton,
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Text style={[styles.footerButtonText, { color: theme.textLow }]}>Cancel</Text>
      </Pressable>
      <Pressable
        onPress={handleDone}
        style={({ pressed }) => [
          styles.footerButtonPrimary,
          {
            backgroundColor: theme.primary,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text style={[styles.footerButtonText, { color: '#FFFFFF' }]}>Done</Text>
      </Pressable>
    </View>
  );

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title="Set Due Date & Time"
      showCloseButton={true}
      footer={footer}
      maxHeight={Platform.OS === 'web' ? 700 : undefined}
      testID={testID}
    >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textHigh }]}>All Day</Text>
              <Pressable
                onPress={handleAllDayToggle}
                style={({ pressed }) => [
                  styles.toggleButton,
                  {
                    backgroundColor: isAllDay ? theme.primary : theme.surfaceAlt,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                testID={testID ? `${testID}-all-day-toggle` : undefined}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: theme.surface,
                      transform: [{ translateX: isAllDay ? 20 : 2 }],
                    },
                  ]}
                />
              </Pressable>
            </View>
          </View>

          <View style={[styles.section, { marginTop: theme.spacing.lg }]}>
            <Text style={[styles.sectionTitle, { color: theme.textHigh, marginBottom: theme.spacing.md }]}>
              Date
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickChipsScroll}
            >
              <Pressable
                onPress={() => handleQuickChip('today')}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: theme.surfaceAlt,
                    borderColor: theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                testID={testID ? `${testID}-today-chip` : undefined}
              >
                <Text style={[styles.chipText, { color: theme.textHigh }]}>Today</Text>
              </Pressable>
              <Pressable
                onPress={() => handleQuickChip('tomorrow')}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: theme.surfaceAlt,
                    borderColor: theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                testID={testID ? `${testID}-tomorrow-chip` : undefined}
              >
                <Text style={[styles.chipText, { color: theme.textHigh }]}>Tomorrow</Text>
              </Pressable>
              <Pressable
                onPress={() => handleQuickChip('thisWeekend')}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: theme.surfaceAlt,
                    borderColor: theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                testID={testID ? `${testID}-weekend-chip` : undefined}
              >
                <Text style={[styles.chipText, { color: theme.textHigh }]}>This Weekend</Text>
              </Pressable>
              <Pressable
                onPress={() => handleQuickChip('nextWeek')}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: theme.surfaceAlt,
                    borderColor: theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                testID={testID ? `${testID}-next-week-chip` : undefined}
              >
                <Text style={[styles.chipText, { color: theme.textHigh }]}>Next Week</Text>
              </Pressable>
              <Pressable
                onPress={() => handleQuickChip('nextMonth')}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: theme.surfaceAlt,
                    borderColor: theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                testID={testID ? `${testID}-next-month-chip` : undefined}
              >
                <Text style={[styles.chipText, { color: theme.textHigh }]}>Next Month</Text>
              </Pressable>
            </ScrollView>

            <View style={[styles.calendarContainer, { marginTop: theme.spacing.md }]}>
              <View style={styles.calendarHeader}>
                <Pressable
                  onPress={handlePrevMonth}
                  style={({ pressed }) => [
                    styles.navButton,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                  hitSlop={8}
                  testID={testID ? `${testID}-prev-month` : undefined}
                >
                  <ChevronLeft size={24} color={theme.primary} />
                </Pressable>
                <Text style={[styles.monthName, { color: theme.textHigh }]}>{monthName}</Text>
                <Pressable
                  onPress={handleNextMonth}
                  style={({ pressed }) => [
                    styles.navButton,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                  hitSlop={8}
                  testID={testID ? `${testID}-next-month` : undefined}
                >
                  <ChevronRight size={24} color={theme.primary} />
                </Pressable>
              </View>

              <View style={styles.weekDayHeaders}>
                {WEEKDAYS_SHORT.map((day, i) => (
                  <View key={i} style={[styles.weekDayHeader, { width: dayCellSize }]}>
                    <Text style={[styles.weekDayText, { color: theme.textLow }]}>{day}</Text>
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
                      hitSlop={4}
                      style={({ pressed }) => [
                        styles.dayCell,
                        {
                          width: dayCellSize,
                          height: dayCellSize,
                          borderRadius: dayCellSize / 2,
                        },
                        isSelected && {
                          backgroundColor: theme.primary,
                        },
                        isTodayDate && !isSelected && {
                          borderWidth: 2,
                          borderColor: theme.primary,
                        },
                        pressed && !isSelected && !isPast && {
                          backgroundColor: theme.surfaceAlt,
                        },
                        isPast && {
                          opacity: 0.3,
                        },
                      ]}
                      testID={testID ? `${testID}-day-${item.date}` : undefined}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          {
                            color: isSelected
                              ? '#FFFFFF'
                              : item.isCurrentMonth
                              ? theme.textHigh
                              : theme.textLow,
                          },
                          !item.isCurrentMonth && { opacity: 0.4 },
                        ]}
                      >
                        {dayNum}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={[styles.section, { marginTop: theme.spacing.lg }]}>
            <View style={styles.timeSectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textHigh }]}>Time</Text>
              <Pressable
                onPress={toggleTimePickerMode}
                style={({ pressed }) => [
                  styles.modeToggle,
                  {
                    backgroundColor: theme.surfaceAlt,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                testID={testID ? `${testID}-time-mode-toggle` : undefined}
              >
                <KeyboardIcon size={16} color={theme.textHigh} />
                <Text style={[styles.modeToggleText, { color: theme.textHigh }]}>
                  {timePickerMode === 'dial' ? 'Keyboard' : 'Dial'}
                </Text>
              </Pressable>
            </View>

            {!isAllDay && (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[styles.quickChipsScroll, { marginTop: theme.spacing.md }]}
                >
                  <Pressable
                    onPress={() => handleTimeChip('now')}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: theme.surfaceAlt,
                        borderColor: theme.border,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                    testID={testID ? `${testID}-time-chip-now` : undefined}
                  >
                    <Text style={[styles.chipText, { color: theme.textHigh }]}>Now</Text>
                  </Pressable>
                  {['08:00', '09:00', '12:00', '14:00', '17:00', '19:00', '21:00'].map((time) => (
                    <Pressable
                      key={time}
                      onPress={() => handleTimeChip(time)}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          backgroundColor: selectedTime === time ? theme.primary : theme.surfaceAlt,
                          borderColor: theme.border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                      testID={testID ? `${testID}-time-chip-${time}` : undefined}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: selectedTime === time ? '#FFFFFF' : theme.textHigh },
                        ]}
                      >
                        {time}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {timePickerMode === 'keyboard' ? (
                  <View style={[styles.keyboardTimeContainer, { marginTop: theme.spacing.md }]}>
                    <TextInput
                      style={[
                        styles.keyboardTimeInput,
                        {
                          backgroundColor: theme.surfaceAlt,
                          color: theme.textHigh,
                          borderColor: keyboardTimeError ? theme.error : theme.border,
                        },
                      ]}
                      value={keyboardTimeInput}
                      onChangeText={(text) => {
                        setKeyboardTimeInput(text);
                        setKeyboardTimeError('');
                      }}
                      placeholder="HH:MM (e.g., 14:30)"
                      placeholderTextColor={theme.textLow}
                      keyboardType="numbers-and-punctuation"
                      onSubmitEditing={handleKeyboardTimeConfirm}
                      testID={testID ? `${testID}-keyboard-input` : undefined}
                    />
                    <Pressable
                      onPress={handleKeyboardTimeConfirm}
                      style={({ pressed }) => [
                        styles.keyboardTimeButton,
                        {
                          backgroundColor: theme.primary,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                      testID={testID ? `${testID}-keyboard-confirm` : undefined}
                    >
                      <Text style={[styles.keyboardTimeButtonText, { color: '#FFFFFF' }]}>
                        Set
                      </Text>
                    </Pressable>
                    {keyboardTimeError && (
                      <Text
                        style={[styles.keyboardTimeError, { color: theme.error }]}
                        testID={testID ? `${testID}-keyboard-error` : undefined}
                      >
                        {keyboardTimeError}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View style={[styles.dialContainer, { marginTop: theme.spacing.md, backgroundColor: theme.surfaceAlt, borderRadius: theme.radius.input }]}>
                    <ScrollView
                      style={styles.dialScroll}
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={styles.dialContent}
                    >
                      {Array.from({ length: 24 }).map((_, h) => 
                        Array.from({ length: 4 }).map((_, m) => {
                          const hours = h.toString().padStart(2, '0');
                          const minutes = (m * 15).toString().padStart(2, '0');
                          const time = `${hours}:${minutes}`;
                          const isSelected = selectedTime === time;

                          return (
                            <Pressable
                              key={time}
                              onPress={() => handleTimeChip(time)}
                              style={({ pressed }) => [
                                styles.dialTimeSlot,
                                {
                                  backgroundColor: isSelected ? theme.primary : 'transparent',
                                  opacity: pressed ? 0.7 : 1,
                                },
                              ]}
                              testID={testID ? `${testID}-dial-time-${time}` : undefined}
                            >
                              <Text
                                style={[
                                  styles.dialTimeText,
                                  { color: isSelected ? '#FFFFFF' : theme.textHigh },
                                ]}
                              >
                                {time}
                              </Text>
                            </Pressable>
                          );
                        })
                      ).flat()}
                    </ScrollView>
                  </View>
                )}
              </>
            )}

            {isAllDay && (
              <View style={[styles.allDayPlaceholder, { marginTop: theme.spacing.md }]}>
                <Text style={[styles.allDayPlaceholderText, { color: theme.textLow }]}>
                  Time is disabled when All Day is on
                </Text>
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
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  toggleButton: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute' as const,
  },
  quickChips: {
    flexDirection: 'row',
    gap: 8,
  },
  quickChipsScroll: {
    gap: 8,
    paddingHorizontal: 2,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 90,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  calendarContainer: {
    gap: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthName: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  weekDayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekDayHeader: {
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  timeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  keyboardTimeContainer: {
    gap: 12,
  },
  keyboardTimeInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '500' as const,
    borderWidth: 1,
  },
  keyboardTimeButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  keyboardTimeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  keyboardTimeError: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  dialContainer: {
    maxHeight: 240,
  },
  dialScroll: {
    borderRadius: 8,
  },
  dialContent: {
    gap: 4,
  },
  dialTimeSlot: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dialTimeText: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  allDayPlaceholder: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  allDayPlaceholderText: {
    fontSize: 14,
    fontWeight: '400' as const,
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
  footerButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
