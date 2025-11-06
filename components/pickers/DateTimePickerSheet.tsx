import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import * as chrono from 'chrono-node';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react-native';
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

  const getDeviceTimezone = useCallback(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  }, []);

  const parseInitialValue = useCallback((isoString: string | null) => {
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
  }, [getDeviceTimezone]);

  const initialState = parseInitialValue(value);
  const [selectedDate, setSelectedDate] = useState<string>(initialState.date);
  const [selectedTime, setSelectedTime] = useState<string | null>(initialState.time);
  const [isAllDay, setIsAllDay] = useState(initialState.allDay);
  const [timezone] = useState(initialState.timezone);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(initialState.date));
  const [naturalInput, setNaturalInput] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<{
    date: string | null;
    time: string | null;
    text: string;
  } | null>(null);


  useEffect(() => {
    if (visible) {
      const state = parseInitialValue(value);
      setSelectedDate(state.date);
      setSelectedTime(state.time);
      setIsAllDay(state.allDay);
      setCurrentMonth(new Date(state.date));
      setNaturalInput('');
      setParsedResult(null);
    }
  }, [visible, value, parseInitialValue]);

  useEffect(() => {
    if (!naturalInput.trim()) {
      setParsedResult(null);
      return;
    }

    const parseNaturalInput = () => {
      try {
        const results = chrono.parse(naturalInput, new Date(), { forwardDate: true });
        
        if (results.length > 0) {
          const parsed = results[0];
          const parsedDate = parsed.start.date();
          
          const dateStr = parsedDate.toISOString().split('T')[0];
          let timeStr: string | null = null;
          
          if (parsed.start.isCertain('hour') && parsed.start.isCertain('minute')) {
            const hours = parsedDate.getHours().toString().padStart(2, '0');
            const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
            timeStr = `${hours}:${minutes}`;
          }
          
          const displayDate = parsedDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: parsedDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
          });
          
          const displayTime = timeStr 
            ? parsedDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true,
              })
            : 'All day';
          
          setParsedResult({
            date: dateStr,
            time: timeStr,
            text: `${displayDate} at ${displayTime}`,
          });
          
          setSelectedDate(dateStr);
          setCurrentMonth(parsedDate);
          
          if (timeStr) {
            setSelectedTime(timeStr);
            setIsAllDay(false);
          } else {
            setSelectedTime(null);
            setIsAllDay(true);
          }
        } else {
          setParsedResult(null);
        }
      } catch (error) {
        console.log('[NLP] Parsing error:', error);
        setParsedResult(null);
      }
    };

    const debounce = setTimeout(parseNaturalInput, 300);
    return () => clearTimeout(debounce);
  }, [naturalInput]);

  const calendarWidth = Math.min(screenWidth - 32, 400);
  const dayCellSize = Math.floor((calendarWidth - 24) / 7);

  const handleQuickChip = (type: 'today' | 'tomorrow' | 'thisWeekend' | 'nextWeek' | 'nextMonth') => {
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
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.smartFieldSection, { marginBottom: theme.spacing.lg }]}>
            <Text style={[styles.sectionTitle, { color: theme.textHigh, marginBottom: theme.spacing.sm }]}>
              Quick Input
            </Text>
            <View 
              style={[
                styles.smartFieldContainer, 
                {
                  backgroundColor: theme.surfaceAlt,
                  borderColor: parsedResult ? theme.primary : theme.border,
                  borderWidth: parsedResult ? 2 : 1,
                }
              ]}
            >
              <Calendar size={20} color={theme.textLow} />
              <TextInput
                value={naturalInput}
                onChangeText={setNaturalInput}
                placeholder="e.g., Tomorrow at 5 PM, in 30 mins, Dec 25 at 9am"
                placeholderTextColor={theme.textLow}
                style={[
                  styles.smartFieldInput,
                  {
                    color: theme.textHigh,
                  },
                ]}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                testID={testID ? `${testID}-natural-input` : undefined}
              />
            </View>
            {parsedResult && (
              <View style={[styles.parsedResultContainer, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
                <Clock size={16} color={theme.primary} />
                <Text style={[styles.parsedResultText, { color: theme.primary }]}>
                  Parsed: {parsedResult.text}
                </Text>
              </View>
            )}
            {naturalInput && !parsedResult && (
              <Text style={[styles.helperText, { color: theme.textLow }]}>
                Try: &ldquo;tomorrow 3pm&rdquo; or &ldquo;next friday at 2:30&rdquo; or &ldquo;in 2 hours&rdquo;
              </Text>
            )}
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={[styles.section, { marginTop: theme.spacing.md }]}>
            <Text style={[styles.sectionSubtitle, { color: theme.textLow, marginBottom: theme.spacing.sm }]}>
              Or select manually:
            </Text>
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

          {!isAllDay && selectedTime && (
            <View style={[styles.section, { marginTop: theme.spacing.md }]}>
              <Text style={[styles.sectionTitle, { color: theme.textHigh, marginBottom: theme.spacing.sm }]}>
                Selected Time
              </Text>
              <View style={[styles.selectedTimeContainer, { backgroundColor: theme.surfaceAlt }]}>
                <Clock size={20} color={theme.primary} />
                <Text style={[styles.selectedTimeText, { color: theme.textHigh }]}>
                  {(() => {
                    const [hours, minutes] = selectedTime.split(':');
                    const date = new Date();
                    date.setHours(parseInt(hours), parseInt(minutes));
                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  })()}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  smartFieldSection: {
    gap: 8,
  },
  smartFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  smartFieldInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400' as const,
  },
  parsedResultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
  },
  parsedResultText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '400' as const,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  selectedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  selectedTimeText: {
    fontSize: 17,
    fontWeight: '600' as const,
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
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    minWidth: 80,
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
