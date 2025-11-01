import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Modal,
  Switch,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';

import { Calendar, Clock, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface DueDateTime {
  dateISO: string;
  timeISO: string | null;
  allDay: boolean;
  timezone: string;
}

interface DateTimePickerProps {
  visible: boolean;
  value: DueDateTime;
  minDate?: Date;
  onClose: () => void;
  onConfirm: (value: DueDateTime) => void;
}

export function UnifiedDateTimePicker({
  visible,
  value,
  minDate,
  onClose,
  onConfirm,
}: DateTimePickerProps) {
  const [localDate, setLocalDate] = useState<Date>(new Date());
  const [isAllDay, setIsAllDay] = useState<boolean>(false);

  const [timeInput, setTimeInput] = useState('');
  const [savedTime, setSavedTime] = useState<{ hours: number; minutes: number } | null>(null);

  useEffect(() => {
    if (visible) {
      const parsedDate = new Date(value.dateISO);
      if (!isNaN(parsedDate.getTime())) {
        if (value.timeISO && !value.allDay) {
          const timeDate = new Date(value.timeISO);
          if (!isNaN(timeDate.getTime())) {
            parsedDate.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);
            setSavedTime({ hours: timeDate.getHours(), minutes: timeDate.getMinutes() });
            setTimeInput(`${String(timeDate.getHours()).padStart(2, '0')}:${String(timeDate.getMinutes()).padStart(2, '0')}`);
          }
        } else {
          const now = new Date();
          parsedDate.setHours(now.getHours(), 0, 0, 0);
          setTimeInput(`${String(now.getHours()).padStart(2, '0')}:00`);
        }
        setLocalDate(parsedDate);
      } else {
        const now = new Date();
        now.setHours(now.getHours() + 1, 0, 0, 0);
        setLocalDate(now);
        setTimeInput(`${String(now.getHours() + 1).padStart(2, '0')}:00`);
      }
      setIsAllDay(value.allDay);
      console.log('[DateTimePicker] Initialized:', parsedDate.toISOString(), 'AllDay:', value.allDay);
    }
  }, [visible, value]);

  const setQuickDate = useCallback((daysOffset: number) => {
    const today = new Date();
    today.setDate(today.getDate() + daysOffset);
    
    const updated = new Date(localDate);
    updated.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (isAllDay) {
      updated.setHours(0, 0, 0, 0);
    }
    
    setLocalDate(updated);
    console.log('[DateTimePicker] Date changed:', updated.toISOString());
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [localDate, isAllDay]);

  const handleTimeInputChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned.length === 0) {
      setTimeInput('');
      return;
    }
    
    if (cleaned.length <= 2) {
      setTimeInput(cleaned);
    } else if (cleaned.length === 3) {
      setTimeInput(`${cleaned.slice(0, 2)}:${cleaned.slice(2)}`);
    } else if (cleaned.length === 4) {
      setTimeInput(`${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`);
    } else {
      setTimeInput(`${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`);
    }
  }, []);

  const applyTimeFromInput = useCallback(() => {
    const match = timeInput.match(/^(\d{1,2}):?(\d{0,2})$/);
    if (!match) return false;
    
    let hours = parseInt(match[1], 10);
    let minutes = match[2] ? parseInt(match[2], 10) : 0;
    
    if (isNaN(hours) || hours > 23 || isNaN(minutes) || minutes > 59) {
      return false;
    }
    
    const updated = new Date(localDate);
    updated.setHours(hours, minutes, 0, 0);
    setLocalDate(updated);
    setSavedTime({ hours, minutes });
    setTimeInput(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    return true;
  }, [timeInput, localDate]);

  const setQuickTime = useCallback((hours: number, minutes: number) => {
    const updated = new Date(localDate);
    updated.setHours(hours, minutes, 0, 0);
    setLocalDate(updated);
    setSavedTime({ hours, minutes });
    setTimeInput(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [localDate]);

  const setTimeNow = useCallback(() => {
    const now = new Date();
    setQuickTime(now.getHours(), now.getMinutes());
  }, [setQuickTime]);

  const handleAllDayToggle = useCallback((enabled: boolean) => {
    setIsAllDay(enabled);
    
    if (!enabled && savedTime) {
      const updated = new Date(localDate);
      updated.setHours(savedTime.hours, savedTime.minutes, 0, 0);
      setLocalDate(updated);
      setTimeInput(`${String(savedTime.hours).padStart(2, '0')}:${String(savedTime.minutes).padStart(2, '0')}`);
    } else if (!enabled) {
      const now = new Date();
      const updated = new Date(localDate);
      updated.setHours(now.getHours() + 1, 0, 0, 0);
      setLocalDate(updated);
      setSavedTime({ hours: now.getHours() + 1, minutes: 0 });
      setTimeInput(`${String(now.getHours() + 1).padStart(2, '0')}:00`);
    }
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [localDate, savedTime]);

  const handleConfirm = useCallback(() => {
    if (!isAllDay) {
      const isValid = applyTimeFromInput();
      if (!isValid) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return;
      }
    }
    
    const dateOnly = new Date(localDate);
    dateOnly.setHours(0, 0, 0, 0);
    
    const result: DueDateTime = {
      dateISO: dateOnly.toISOString(),
      timeISO: isAllDay ? null : localDate.toISOString(),
      allDay: isAllDay,
      timezone: 'Europe/Vienna',
    };

    console.log('[DateTimePicker] Confirming:', result);
    onConfirm(result);
    onClose();
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [localDate, isAllDay, onConfirm, onClose, applyTimeFromInput]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('de-AT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('de-AT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const isTimeValid = useMemo(() => {
    const match = timeInput.match(/^(\d{1,2}):?(\d{0,2})$/);
    if (!match) return false;
    
    const hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    
    return !isNaN(hours) && hours <= 23 && !isNaN(minutes) && minutes <= 59;
  }, [timeInput]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={styles.title}>Set Due Date & Time</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.preview}>
              <View style={styles.previewIcon}>
                <Calendar size={24} color="#3B82F6" />
              </View>
              <View style={styles.previewText}>
                <Text style={styles.previewDate}>{formatDate(localDate)}</Text>
                {!isAllDay && (
                  <Text style={styles.previewTime}>{formatTime(localDate)}</Text>
                )}
                {isAllDay && (
                  <Text style={styles.allDayIndicator}>All Day</Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.allDaySection}>
              <View style={styles.allDayLeft}>
                <Clock size={20} color="#6B7280" />
                <View>
                  <Text style={styles.allDayLabel}>All Day</Text>
                  <Text style={styles.allDayHint}>No specific time</Text>
                </View>
              </View>
              <Switch
                value={isAllDay}
                onValueChange={handleAllDayToggle}
                trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                thumbColor={isAllDay ? '#3B82F6' : '#F9FAFB'}
              />
            </View>

            <View style={styles.divider} />

            <ScrollView style={styles.pickerSection} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.dateSection}>
                <View style={styles.dateSectionHeader}>
                  <Calendar size={18} color="#6B7280" />
                  <Text style={styles.dateSectionTitle}>Date</Text>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickChipsScroll}>
                  <TouchableOpacity style={styles.quickChip} onPress={() => setQuickDate(0)}>
                    <Text style={styles.quickChipText}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickChip} onPress={() => setQuickDate(1)}>
                    <Text style={styles.quickChipText}>Tomorrow</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickChip} onPress={() => setQuickDate(7)}>
                    <Text style={styles.quickChipText}>Next Week</Text>
                  </TouchableOpacity>
                </ScrollView>
                
                <Text style={styles.selectedValue}>{formatDate(localDate)}</Text>
              </View>

              {!isAllDay && (
                <View style={styles.timeSection}>
                  <View style={styles.timeSectionHeader}>
                    <Clock size={18} color="#6B7280" />
                    <Text style={styles.timeSectionTitle}>Time</Text>
                  </View>
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickChipsScroll}>
                    <TouchableOpacity style={styles.quickChip} onPress={setTimeNow}>
                      <Text style={styles.quickChipText}>Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickChip} onPress={() => setQuickTime(8, 0)}>
                      <Text style={styles.quickChipText}>08:00</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickChip} onPress={() => setQuickTime(12, 0)}>
                      <Text style={styles.quickChipText}>12:00</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickChip} onPress={() => setQuickTime(17, 0)}>
                      <Text style={styles.quickChipText}>17:00</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickChip} onPress={() => setQuickTime(19, 0)}>
                      <Text style={styles.quickChipText}>19:00</Text>
                    </TouchableOpacity>
                  </ScrollView>

                  <TextInput
                    style={[
                      styles.timeInput,
                      !isTimeValid && timeInput.length > 0 && styles.timeInputError
                    ]}
                    value={timeInput}
                    onChangeText={handleTimeInputChange}
                    onBlur={applyTimeFromInput}
                    placeholder="HH:MM"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                  
                  {!isTimeValid && timeInput.length > 0 && (
                    <Text style={styles.errorText}>Enter time as HH:MM (00-23:00-59)</Text>
                  )}
                </View>
              )}
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    flex: 1,
  },
  previewDate: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  previewTime: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  allDayIndicator: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  allDaySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  allDayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  allDayLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  allDayHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  pickerSection: {
    maxHeight: 360,
    paddingTop: 4,
  },
  dateSection: {
    paddingBottom: 20,
  },
  dateSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dateSectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  quickChipsScroll: {
    marginBottom: 12,
  },
  quickChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginRight: 8,
  },
  quickChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
  },
  selectedValue: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#111827',
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },

  timeSection: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  timeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timeSectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  timeInput: {
    fontSize: 28,
    fontWeight: '600' as const,
    color: '#111827',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlign: 'center',
    marginTop: 8,
  },
  timeInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 8,
  },
});
