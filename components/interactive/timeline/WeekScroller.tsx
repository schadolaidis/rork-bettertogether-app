import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export type WeekDay = {
  date: Date;
  dayShort: string;
  dayNumber: string;
  isToday: boolean;
};

export type WeekScrollerProps = {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange?: (direction: 'prev' | 'next') => void;
};

export const WeekScroller: React.FC<WeekScrollerProps> = ({
  selectedDate,
  onDateSelect,
  onMonthChange,
}) => {
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const generateWeekDays = (): WeekDay[] => {
    const days: WeekDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(selectedDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);

      const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = date.getDate().toString().padStart(2, '0');

      const isToday = date.getTime() === today.getTime();

      days.push({ date, dayShort, dayNumber, isToday });
    }

    return days;
  };

  const weekDays = generateWeekDays();
  const selectedIndex = weekDays.findIndex(
    (day) => day.date.toDateString() === selectedDate.toDateString()
  );

  useEffect(() => {
    if (selectedIndex >= 0 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: selectedIndex * 72,
        animated: true,
      });
    }
  }, [selectedIndex]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <Pressable
        style={[
          styles.navButton,
          {
            minWidth: theme.appBar.minTouchTarget,
            minHeight: theme.appBar.minTouchTarget,
          },
        ]}
        onPress={() => onMonthChange?.('prev')}
        testID="week-prev-button"
      >
        <ChevronLeft size={20} color={theme.colors.textHigh} />
      </Pressable>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={72}
        decelerationRate="fast"
        testID="week-scroll-view"
      >
        {weekDays.map((day, index) => {
          const isSelected = selectedDate.toDateString() === day.date.toDateString();

          return (
            <Pressable
              key={index}
              style={[
                styles.dayItem,
                {
                  minWidth: 64,
                  minHeight: theme.appBar.minTouchTarget,
                },
                isSelected && {
                  backgroundColor: theme.colors.accent,
                  borderRadius: theme.radius,
                },
              ]}
              onPress={() => onDateSelect(day.date)}
              testID={`day-item-${index}`}
            >
              <Text
                style={[
                  styles.dayShort,
                  theme.typography.Caption,
                  {
                    color: isSelected
                      ? theme.colors.surface
                      : day.isToday
                      ? theme.colors.primary
                      : theme.colors.textLow,
                  },
                ]}
              >
                {day.dayShort}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  theme.typography.Body,
                  {
                    color: isSelected
                      ? theme.colors.surface
                      : day.isToday
                      ? theme.colors.primary
                      : theme.colors.textHigh,
                    fontWeight: isSelected || day.isToday ? '600' : '400',
                  },
                ]}
              >
                {day.dayNumber}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        style={[
          styles.navButton,
          {
            minWidth: theme.appBar.minTouchTarget,
            minHeight: theme.appBar.minTouchTarget,
          },
        ]}
        onPress={() => onMonthChange?.('next')}
        testID="week-next-button"
      >
        <ChevronRight size={20} color={theme.colors.textHigh} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dayShort: {
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dayNumber: {},
});
