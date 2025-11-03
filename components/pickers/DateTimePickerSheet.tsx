import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ModalSheet } from '@/components/interactive/modals/ModalSheet';
import { useTheme } from '@/contexts/ThemeContext';

interface DateTimePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  value: string | null;
  onChange: (value: string | null) => void;
  testID?: string;
}

export const DateTimePickerSheet: React.FC<DateTimePickerSheetProps> = ({
  visible,
  onClose,
  value,
  onChange,
  testID,
}) => {
  const { theme } = useTheme();
  
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return value ? new Date(value) : new Date();
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(() => {
    if (!value) return null;
    const d = new Date(value);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });
  const [isAllDay, setIsAllDay] = useState(() => {
    if (!value) return false;
    const d = new Date(value);
    return d.getHours() === 0 && d.getMinutes() === 0;
  });

  const [currentMonth, setCurrentMonth] = useState(() => selectedDate);

  const handleQuickChip = (type: 'today' | 'tomorrow' | 'nextWeek') => {
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
      case 'nextWeek':
        newDate = new Date(now);
        newDate.setDate(now.getDate() + 7);
        break;
    }

    setSelectedDate(newDate);
    setCurrentMonth(newDate);
  };

  const handleDateSelect = (date: Date) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTime(time);
    setIsAllDay(false);
  };

  const handleAllDayToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsAllDay(!isAllDay);
    if (!isAllDay) {
      setSelectedTime(null);
    }
  };

  const handleDone = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const finalDate = new Date(selectedDate);
    
    if (isAllDay) {
      finalDate.setHours(0, 0, 0, 0);
    } else if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      finalDate.setHours(hours, minutes, 0, 0);
    } else {
      finalDate.setHours(23, 59, 0, 0);
    }

    onChange(finalDate.toISOString());
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
    
    const days: Date[] = [];
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  }, [currentMonth]);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

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

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
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
      showCloseButton={false}
      footer={footer}
      maxHeight={Platform.OS === 'web' ? 700 : undefined}
      testID={testID}
    >
      <View style={styles.quickChips}>
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
        >
          <Text style={[styles.chipText, { color: theme.textHigh }]}>Tomorrow</Text>
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
        >
          <Text style={[styles.chipText, { color: theme.textHigh }]}>Next Week</Text>
        </Pressable>
      </View>

      <View style={[styles.calendarSection, { marginTop: theme.spacing.lg }]}>
        <View style={styles.calendarHeader}>
          <Pressable
            onPress={handlePrevMonth}
            style={({ pressed }) => [
              styles.navButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            hitSlop={8}
          >
            <Text style={[styles.navButtonText, { color: theme.primary }]}>‹</Text>
          </Pressable>
          <Text style={[styles.monthName, { color: theme.textHigh }]}>{monthName}</Text>
          <Pressable
            onPress={handleNextMonth}
            style={({ pressed }) => [
              styles.navButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            hitSlop={8}
          >
            <Text style={[styles.navButtonText, { color: theme.primary }]}>›</Text>
          </Pressable>
        </View>

        <View style={styles.weekDayHeaders}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <View key={i} style={styles.weekDayHeader}>
              <Text style={[styles.weekDayText, { color: theme.textLow }]}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {monthDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isSelected = isSameDay(date, selectedDate);
            const isTodayDate = isToday(date);

            return (
              <Pressable
                key={index}
                onPress={() => handleDateSelect(date)}
                style={({ pressed }) => [
                  styles.dayCell,
                  isSelected && {
                    backgroundColor: theme.primary,
                  },
                  isTodayDate && !isSelected && {
                    borderWidth: 1,
                    borderColor: theme.primary,
                  },
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isCurrentMonth
                        ? theme.textHigh
                        : theme.textLow,
                    },
                    !isCurrentMonth && { opacity: 0.4 },
                  ]}
                >
                  {date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.timeSection, { marginTop: theme.spacing.lg }]}>
        <View style={styles.timeSectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textHigh }]}>Time</Text>
          <Pressable
            onPress={handleAllDayToggle}
            style={({ pressed }) => [
              styles.allDayToggle,
              {
                borderColor: theme.border,
                backgroundColor: isAllDay ? theme.primary : 'transparent',
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.allDayText,
                { color: isAllDay ? '#FFFFFF' : theme.textLow },
              ]}
            >
              All-day
            </Text>
          </Pressable>
        </View>

        {!isAllDay && (
          <ScrollView
            style={[styles.timeList, { maxHeight: 200 }]}
            showsVerticalScrollIndicator={true}
          >
            {timeSlots.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <Pressable
                  key={time}
                  onPress={() => handleTimeSelect(time)}
                  style={({ pressed }) => [
                    styles.timeSlot,
                    {
                      backgroundColor: isSelected ? theme.primary : 'transparent',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.timeText,
                      { color: isSelected ? '#FFFFFF' : theme.textHigh },
                    ]}
                  >
                    {time}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  quickChips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  calendarSection: {
    gap: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  navButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 28,
    fontWeight: '300' as const,
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
    width: 40,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dayCell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  timeSection: {
    gap: 12,
  },
  timeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  allDayToggle: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  allDayText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  timeList: {
    borderRadius: 8,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 15,
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
