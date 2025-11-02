import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { ModalSheet } from '@/components/design-system/ModalSheet';

export type DateTimeValue = {
  dateISO: string;
  timeISO: string | null;
  allDay: boolean;
  timezone: string;
};

export type DateTimeInputProps = {
  label?: string;
  value?: DateTimeValue;
  onChange?: (value: DateTimeValue) => void;
  helperText?: string;
  errorText?: string;
  testID?: string;
  placeholder?: string;
};

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  label,
  value,
  onChange,
  helperText,
  errorText,
  testID,
  placeholder = 'Select date & time',
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState<DateTimeValue>(
    value || {
      dateISO: new Date().toISOString(),
      timeISO: null,
      allDay: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  );

  const hasError = !!errorText;

  const formatDisplayValue = (val: DateTimeValue): string => {
    try {
      const date = new Date(val.dateISO);
      const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      if (val.allDay || !val.timeISO) {
        return `${dateStr} • All Day`;
      }

      const time = new Date(val.timeISO);
      const timeStr = time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      return `${dateStr} • ${timeStr}`;
    } catch {
      return placeholder;
    }
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsOpen(true);
  };

  const handleConfirm = (newValue: DateTimeValue) => {
    setLocalValue(newValue);
    onChange?.(newValue);
    setIsOpen(false);
  };

  const borderColor = hasError ? theme.colors.error : theme.colors.border;

  return (
    <View style={styles.container} testID={testID}>
      {label && (
        <Text
          style={[
            theme.typography.Label,
            { color: theme.colors.textHigh, marginBottom: theme.spacing.xs },
          ]}
        >
          {label}
        </Text>
      )}
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: theme.colors.surface,
            borderColor,
            borderRadius: theme.radius - 4,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        testID={testID ? `${testID}-button` : undefined}
      >
        <Calendar size={20} color={value ? theme.colors.primary : theme.colors.textLow} />
        <Text
          style={[
            theme.typography.Body,
            {
              color: value ? theme.colors.textHigh : theme.colors.textLow,
              flex: 1,
            },
          ]}
        >
          {value ? formatDisplayValue(value) : placeholder}
        </Text>
      </Pressable>
      {(helperText || errorText) && (
        <Text
          style={[
            theme.typography.Caption,
            {
              color: hasError ? theme.colors.error : theme.colors.textLow,
              marginTop: theme.spacing.xxs,
            },
          ]}
          testID={testID ? `${testID}-helper` : undefined}
        >
          {errorText || helperText}
        </Text>
      )}

      <DateTimePickerSheet
        open={isOpen}
        value={localValue}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        testID={testID ? `${testID}-picker` : undefined}
      />
    </View>
  );
};

type DateTimePickerSheetProps = {
  open: boolean;
  value: DateTimeValue;
  onClose: () => void;
  onConfirm: (value: DateTimeValue) => void;
  testID?: string;
};

const DateTimePickerSheet: React.FC<DateTimePickerSheetProps> = ({
  open,
  value,
  onClose,
  onConfirm,
  testID,
}) => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(value.dateISO));
  const [allDay, setAllDay] = useState<boolean>(value.allDay);
  const [timeHours, setTimeHours] = useState<number>(
    value.timeISO ? new Date(value.timeISO).getHours() : 9
  );
  const [timeMinutes, setTimeMinutes] = useState<number>(
    value.timeISO ? new Date(value.timeISO).getMinutes() : 0
  );

  const setQuickDate = (daysOffset: number) => {
    const today = new Date();
    today.setDate(today.getDate() + daysOffset);
    today.setHours(timeHours, timeMinutes, 0, 0);
    setSelectedDate(today);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const setQuickTime = (hours: number, minutes: number) => {
    setTimeHours(hours);
    setTimeMinutes(minutes);
    const updated = new Date(selectedDate);
    updated.setHours(hours, minutes, 0, 0);
    setSelectedDate(updated);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAllDayToggle = () => {
    const newValue = !allDay;
    setAllDay(newValue);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleConfirm = () => {
    const dateOnly = new Date(selectedDate);
    dateOnly.setHours(0, 0, 0, 0);

    const timeDate = new Date(selectedDate);
    timeDate.setHours(timeHours, timeMinutes, 0, 0);

    const result: DateTimeValue = {
      dateISO: dateOnly.toISOString(),
      timeISO: allDay ? null : timeDate.toISOString(),
      allDay,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    onConfirm(result);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ModalSheet open={open} onClose={onClose} maxHeight={600} testID={testID}>
      <View style={{ paddingHorizontal: theme.spacing.md }}>
        <Text
          style={[
            theme.typography.H2,
            { color: theme.colors.textHigh, marginBottom: theme.spacing.lg },
          ]}
        >
          Select Date & Time
        </Text>

        <View style={{ gap: theme.spacing.md }}>
          <View>
            <Text
              style={[
                theme.typography.Label,
                { color: theme.colors.textLow, marginBottom: theme.spacing.xs },
              ]}
            >
              QUICK SELECT
            </Text>
            <View style={styles.chipRow}>
              <Pressable
                onPress={() => setQuickDate(0)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: theme.colors.surfaceAlt,
                    borderRadius: theme.radius - 4,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[theme.typography.Label, { color: theme.colors.textHigh }]}>
                  Today
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setQuickDate(1)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: theme.colors.surfaceAlt,
                    borderRadius: theme.radius - 4,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[theme.typography.Label, { color: theme.colors.textHigh }]}>
                  Tomorrow
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setQuickDate(7)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: theme.colors.surfaceAlt,
                    borderRadius: theme.radius - 4,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[theme.typography.Label, { color: theme.colors.textHigh }]}>
                  Next Week
                </Text>
              </Pressable>
            </View>
          </View>

          <View>
            <Text
              style={[
                theme.typography.Label,
                { color: theme.colors.textLow, marginBottom: theme.spacing.xs },
              ]}
            >
              SELECTED DATE
            </Text>
            <Text style={[theme.typography.H2, { color: theme.colors.textHigh }]}>
              {formatDate(selectedDate)}
            </Text>
          </View>

          <View>
            <Pressable
              onPress={handleAllDayToggle}
              style={({ pressed }) => [
                styles.toggleRow,
                {
                  backgroundColor: allDay ? theme.colors.surfaceAlt : theme.colors.surface,
                  borderRadius: theme.radius - 4,
                  borderWidth: 1,
                  borderColor: allDay ? theme.colors.primary : theme.colors.border,
                  padding: theme.spacing.md,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.Body,
                  { color: allDay ? theme.colors.primary : theme.colors.textHigh },
                ]}
              >
                All Day
              </Text>
              <View
                style={[
                  styles.toggleIndicator,
                  {
                    backgroundColor: allDay ? theme.colors.primary : theme.colors.border,
                    borderRadius: 12,
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: theme.colors.surface,
                      transform: [{ translateX: allDay ? 20 : 2 }],
                    },
                  ]}
                />
              </View>
            </Pressable>
          </View>

          {!allDay && (
            <View>
              <Text
                style={[
                  theme.typography.Label,
                  { color: theme.colors.textLow, marginBottom: theme.spacing.xs },
                ]}
              >
                TIME
              </Text>
              <View style={styles.chipRow}>
                <Pressable
                  onPress={() => {
                    const now = new Date();
                    setQuickTime(now.getHours(), now.getMinutes());
                  }}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderRadius: theme.radius - 4,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={[theme.typography.Label, { color: theme.colors.textHigh }]}>
                    Now
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setQuickTime(9, 0)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderRadius: theme.radius - 4,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={[theme.typography.Label, { color: theme.colors.textHigh }]}>
                    09:00
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setQuickTime(12, 0)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderRadius: theme.radius - 4,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={[theme.typography.Label, { color: theme.colors.textHigh }]}>
                    12:00
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setQuickTime(17, 0)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderRadius: theme.radius - 4,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={[theme.typography.Label, { color: theme.colors.textHigh }]}>
                    17:00
                  </Text>
                </Pressable>
              </View>

              <Text
                style={[
                  theme.typography.H1,
                  { color: theme.colors.textHigh, marginTop: theme.spacing.xs },
                ]}
              >
                {String(timeHours).padStart(2, '0')}:{String(timeMinutes).padStart(2, '0')}
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  borderRadius: theme.radius - 4,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[theme.typography.Body, { color: theme.colors.textHigh }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radius - 4,
                  flex: 2,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.Body,
                  { color: theme.colors.surface, fontWeight: '600' },
                ]}
              >
                Confirm
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  field: {
    minHeight: 48,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleIndicator: {
    width: 44,
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
