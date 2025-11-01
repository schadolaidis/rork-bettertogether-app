import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Modal,
  Switch,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar, Clock, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { EUDateFormatter } from '@/utils/EULocale';

interface NativeDatePickerProps {
  visible: boolean;
  date: Date;
  allDay: boolean;
  minDate?: Date;
  onClose: () => void;
  onSave: (date: Date, allDay: boolean) => void;
  title?: string;
}

export function NativeDatePicker({
  visible,
  date,
  allDay,
  minDate,
  onClose,
  onSave,
  title = 'Set Date & Time',
}: NativeDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAllDay, setIsAllDay] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      const validDate = new Date(date);
      if (isNaN(validDate.getTime())) {
        const now = new Date();
        now.setHours(now.getHours() + 1, 0, 0, 0);
        setSelectedDate(now);
      } else {
        setSelectedDate(validDate);
      }
      setIsAllDay(allDay);
      console.log('[NativeDatePicker] Initialized with:', validDate.toISOString(), 'AllDay:', allDay);
    }
  }, [visible, date, allDay]);

  const handleDateChange = (_event: DateTimePickerEvent, newDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (newDate && !isNaN(newDate.getTime())) {
      const updated = new Date(selectedDate);
      updated.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      
      if (isAllDay) {
        updated.setHours(0, 0, 0, 0);
      }
      
      setSelectedDate(updated);
      console.log('[NativeDatePicker] Date changed:', updated.toISOString());
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleTimeChange = (_event: DateTimePickerEvent, newDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (newDate && !isNaN(newDate.getTime())) {
      const updated = new Date(selectedDate);
      updated.setHours(newDate.getHours(), newDate.getMinutes(), 0, 0);
      setSelectedDate(updated);
      console.log('[NativeDatePicker] Time changed:', updated.toISOString());
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleAllDayToggle = (value: boolean) => {
    setIsAllDay(value);
    
    const updated = new Date(selectedDate);
    if (value) {
      updated.setHours(0, 0, 0, 0);
    } else {
      const now = new Date();
      updated.setHours(now.getHours() + 1, 0, 0, 0);
    }
    setSelectedDate(updated);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = () => {
    console.log('[NativeDatePicker] Saving:', selectedDate.toISOString(), 'AllDay:', isAllDay);
    onSave(selectedDate, isAllDay);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const formatDate = (d: Date) => {
    if (!d || isNaN(d.getTime())) return 'Invalid Date';
    return EUDateFormatter.formatDate(d, 'long');
  };

  const formatTime = (d: Date) => {
    if (!d || isNaN(d.getTime())) return 'Invalid Time';
    return EUDateFormatter.formatTime(d);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.container}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
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
                <Text style={styles.previewDate}>{formatDate(selectedDate)}</Text>
                {!isAllDay && (
                  <Text style={styles.previewTime}>{formatTime(selectedDate)}</Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.allDaySection}>
              <View style={styles.allDayLeft}>
                <Clock size={20} color="#6B7280" />
                <View>
                  <Text style={styles.allDayLabel}>All Day</Text>
                  <Text style={styles.allDayHint}>No specific time needed</Text>
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

            <View style={styles.pickerSection}>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setShowDatePicker(true);
                }}
              >
                <Calendar size={20} color="#3B82F6" />
                <View style={styles.pickerButtonText}>
                  <Text style={styles.pickerButtonLabel}>Date</Text>
                  <Text style={styles.pickerButtonValue}>{formatDate(selectedDate)}</Text>
                </View>
              </TouchableOpacity>

              {!isAllDay && (
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setShowTimePicker(true);
                  }}
                >
                  <Clock size={20} color="#3B82F6" />
                  <View style={styles.pickerButtonText}>
                    <Text style={styles.pickerButtonLabel}>Time</Text>
                    <Text style={styles.pickerButtonValue}>{formatTime(selectedDate)}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

        {Platform.OS === 'ios' && showDatePicker && (
          <View style={styles.pickerOverlay}>
            <TouchableOpacity
              style={styles.pickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            />
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minDate}
              />
            </View>
          </View>
        )}

        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={minDate}
          />
        )}

        {Platform.OS === 'ios' && showTimePicker && (
          <View style={styles.pickerOverlay}>
            <TouchableOpacity
              style={styles.pickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowTimePicker(false)}
            />
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                is24Hour={true}
              />
            </View>
          </View>
        )}

        {Platform.OS === 'android' && showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display="default"
            onChange={handleTimeChange}
            is24Hour={true}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
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
    paddingHorizontal: 24,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    flex: 1,
    gap: 4,
  },
  previewDate: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  previewTime: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#6B7280',
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
    gap: 12,
    paddingTop: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerButtonText: {
    flex: 1,
    gap: 2,
  },
  pickerButtonLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#9CA3AF',
  },
  pickerButtonValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 24,
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
  saveButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerDone: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
});
