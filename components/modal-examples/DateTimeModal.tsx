import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import { ModalInputWrapper } from '@/components/ModalInputWrapper';

interface DateTimeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (date: Date, allDay: boolean) => void;
  initialDate?: Date;
  initialAllDay?: boolean;
}

export function DateTimeModal({
  open,
  onClose,
  onConfirm,
  initialDate = new Date(),
  initialAllDay = false,
}: DateTimeModalProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [allDay, setAllDay] = useState(initialAllDay);
  const [timeInput, setTimeInput] = useState(
    initialDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );

  const today = new Date();
  const quickDates = [
    { label: 'Today', date: new Date() },
    {
      label: 'Tomorrow',
      date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
    {
      label: 'In 3 days',
      date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      label: 'Next week',
      date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  ];

  const timePresets = [
    '09:00',
    '12:00',
    '14:00',
    '17:00',
    '18:00',
    '20:00',
  ];

  const handleTimeInput = (text: string) => {
    const cleaned = text.replace(/[^0-9:]/g, '');
    setTimeInput(cleaned);

    const match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        const newDate = new Date(selectedDate);
        newDate.setHours(hours, minutes, 0, 0);
        setSelectedDate(newDate);
      }
    }
  };

  const handleTimePreset = (time: string) => {
    setTimeInput(time);
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    onConfirm(selectedDate, allDay);
  };

  return (
    <ModalInputWrapper
      open={open}
      title="Set Due Date & Time"
      onClose={onClose}
      onConfirm={handleConfirm}
      testID="datetime-modal"
      maxWidth={480}
    >
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick dates</Text>
          <View style={styles.chipGrid}>
            {quickDates.map((item) => {
              const isSelected =
                item.date.toDateString() === selectedDate.toDateString();
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => {
                    const newDate = new Date(item.date);
                    newDate.setHours(
                      selectedDate.getHours(),
                      selectedDate.getMinutes(),
                      0,
                      0
                    );
                    setSelectedDate(newDate);
                  }}
                >
                  <Calendar
                    size={16}
                    color={isSelected ? '#2F6BFF' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.allDayRow}>
            <Text style={styles.sectionLabel}>All day event</Text>
            <TouchableOpacity
              style={[styles.toggle, allDay && styles.toggleActive]}
              onPress={() => setAllDay(!allDay)}
            >
              <View
                style={[
                  styles.toggleThumb,
                  allDay && styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {!allDay && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Time</Text>
              <View style={styles.timeInputRow}>
                <Clock size={18} color="#6B7280" />
                <TextInput
                  style={styles.timeInput}
                  placeholder="HH:MM"
                  placeholderTextColor="#9CA3AF"
                  value={timeInput}
                  onChangeText={handleTimeInput}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Time presets</Text>
              <View style={styles.chipGrid}>
                {timePresets.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.chip,
                      timeInput === time && styles.chipSelected,
                    ]}
                    onPress={() => handleTimePreset(time)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        timeInput === time && styles.chipTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Selected:</Text>
          <Text style={styles.summaryValue}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {!allDay && ` at ${timeInput}`}
          </Text>
        </View>
      </ScrollView>
    </ModalInputWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 500,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2F6BFF',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  chipTextSelected: {
    color: '#2F6BFF',
    fontWeight: '600',
  },
  allDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#2F6BFF',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryCard: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
});
