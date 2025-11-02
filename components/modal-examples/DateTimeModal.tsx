import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Clock } from 'lucide-react-native';
import { ModalInputWrapper } from '@/components/ModalInputWrapper';
import * as Haptics from 'expo-haptics';

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
  const timeInputRef = useRef<TextInput>(null);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const quickDates = [
    { label: 'Today', date: new Date() },
    { label: 'Tomorrow', date: tomorrow },
    { label: 'Next Week', date: nextWeek },
  ];

  const now = new Date();
  const nextHour = new Date();
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  
  const timePresets = [
    { label: 'Now', hours: now.getHours(), minutes: now.getMinutes() },
    { label: '09:00', hours: 9, minutes: 0 },
    { label: '12:00', hours: 12, minutes: 0 },
    { label: '17:00', hours: 17, minutes: 0 },
    { label: '20:00', hours: 20, minutes: 0 },
  ];

  const handleDateSelect = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    setSelectedDate(newDate);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleTimeInput = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned.length === 0) {
      setTimeInput('');
      return;
    }
    
    if (cleaned.length <= 2) {
      setTimeInput(cleaned);
    } else if (cleaned.length === 3) {
      setTimeInput(`${cleaned.slice(0, 2)}:${cleaned.slice(2)}`);
    } else {
      setTimeInput(`${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`);
    }
  };

  const applyTimeFromInput = () => {
    const match = timeInput.match(/^(\d{1,2}):?(\d{0,2})$/);
    if (!match) return;
    
    let hours = parseInt(match[1], 10);
    let minutes = match[2] ? parseInt(match[2], 10) : 0;
    
    if (isNaN(hours) || hours > 23 || isNaN(minutes) || minutes > 59) return;
    
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);
    setSelectedDate(newDate);
    setTimeInput(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
  };

  const handleTimePreset = (hours: number, minutes: number) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);
    setSelectedDate(newDate);
    setTimeInput(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAllDayToggle = () => {
    setAllDay(!allDay);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleConfirm = () => {
    if (!allDay) {
      applyTimeFromInput();
    }
    onConfirm(selectedDate, allDay);
    onClose();
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const formatSelectedDate = () => {
    const dateStr = selectedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    
    if (allDay) return dateStr;
    
    const timeStr = selectedDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    return `${dateStr} • ${timeStr}`;
  };

  return (
    <ModalInputWrapper
      open={open}
      title="Due Date"
      subtitle={formatSelectedDate()}
      onClose={onClose}
      onConfirm={handleConfirm}
      testID="datetime-modal"
      maxWidth={440}
      avoidKeyboard={!allDay}
    >
      <View style={styles.container}>
        <View style={styles.quickDatesRow}>
          {quickDates.map((item) => {
            const isSelected =
              item.date.toDateString() === selectedDate.toDateString();
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.quickDateChip, isSelected && styles.quickDateChipSelected]}
                onPress={() => handleDateSelect(item.date)}
              >
                <Text
                  style={[
                    styles.quickDateText,
                    isSelected && styles.quickDateTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        <View style={styles.allDayRow}>
          <View style={styles.allDayLeft}>
            <Clock size={20} color={allDay ? '#2F6BFF' : '#6B7280'} />
            <Text style={[styles.allDayLabel, allDay && styles.allDayLabelActive]}>
              All Day
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, allDay && styles.toggleActive]}
            onPress={handleAllDayToggle}
          >
            <View
              style={[
                styles.toggleThumb,
                allDay && styles.toggleThumbActive,
              ]}
            />
          </TouchableOpacity>
        </View>

        {!allDay && (
          <>
            <View style={styles.divider} />

            <View style={styles.timeSection}>
              <Text style={styles.timeSectionLabel}>Time</Text>
              
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timePresetsScroll}
                contentContainerStyle={styles.timePresetsContainer}
              >
                {timePresets.map((preset) => (
                  <TouchableOpacity
                    key={preset.label}
                    style={styles.timeChip}
                    onPress={() => handleTimePreset(preset.hours, preset.minutes)}
                  >
                    <Text style={styles.timeChipText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                ref={timeInputRef}
                style={styles.timeInput}
                placeholder="HH:MM"
                placeholderTextColor="#9CA3AF"
                value={timeInput}
                onChangeText={handleTimeInput}
                onBlur={applyTimeFromInput}
                keyboardType="number-pad"
                maxLength={5}
                selectTextOnFocus
              />
            </View>
          </>
        )}
      </View>
    </ModalInputWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  quickDatesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  quickDateChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  quickDateChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2F6BFF',
  },
  quickDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  quickDateTextSelected: {
    color: '#2F6BFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  allDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  allDayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  allDayLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  allDayLabelActive: {
    color: '#2F6BFF',
    fontWeight: '600',
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
  timeSection: {
    gap: 12,
  },
  timeSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timePresetsScroll: {
    marginHorizontal: -4,
  },
  timePresetsContainer: {
    paddingHorizontal: 4,
    gap: 8,
  },
  timeChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  timeInput: {
    fontSize: 32,
    fontWeight: '600',
    color: '#111827',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    textAlign: 'center',
  },
});
