import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar, Clock, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { EUDateFormatter } from '@/utils/EULocale';

interface DateTimePickerModalProps {
  visible: boolean;
  initialDate: Date;
  allDay?: boolean;
  minDate?: Date;
  onClose: () => void;
  onSave: (date: Date, allDay: boolean) => void;
  title?: string;
}

export function DateTimePickerModal({
  visible,
  initialDate,
  allDay: initialAllDay = false,
  minDate,
  onClose,
  onSave,
  title = 'Set Date & Time',
}: DateTimePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAllDay, setIsAllDay] = useState(false);
  const [showNativeDatePicker, setShowNativeDatePicker] = useState(false);
  const [showNativeTimePicker, setShowNativeTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      const validDate = new Date(initialDate);
      if (isNaN(validDate.getTime())) {
        console.warn('[DateTimePicker] Invalid initial date, using current time');
        const now = new Date();
        now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
        now.setSeconds(0, 0);
        setSelectedDate(now);
      } else {
        setSelectedDate(new Date(validDate));
      }
      setIsAllDay(initialAllDay);
    }
  }, [visible, initialDate, initialAllDay]);

  const handleDateChange = useCallback((_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowNativeDatePicker(false);
    }

    if (date && !isNaN(date.getTime())) {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (isAllDay) {
        newDate.setHours(0, 0, 0, 0);
      }
      
      setSelectedDate(newDate);
      console.log('[DateTimePicker] Date updated:', newDate.toISOString());
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [selectedDate, isAllDay]);

  const handleTimeChange = useCallback((_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowNativeTimePicker(false);
    }

    if (date && !isNaN(date.getTime())) {
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
      
      setSelectedDate(newDate);
      console.log('[DateTimePicker] Time updated:', newDate.toISOString());
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [selectedDate]);

  const handleAllDayToggle = useCallback((value: boolean) => {
    setIsAllDay(value);
    
    if (value) {
      const newDate = new Date(selectedDate);
      newDate.setHours(0, 0, 0, 0);
      setSelectedDate(newDate);
    } else {
      const newDate = new Date(selectedDate);
      const now = new Date();
      newDate.setHours(now.getHours() + 1, 0, 0, 0);
      setSelectedDate(newDate);
    }
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [selectedDate]);

  const handleQuickSelect = useCallback((daysFromNow: number, hour: number = 9) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + daysFromNow);
    
    if (isAllDay) {
      newDate.setHours(0, 0, 0, 0);
    } else {
      newDate.setHours(hour, 0, 0, 0);
    }
    
    setSelectedDate(newDate);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [isAllDay]);

  const handleSave = useCallback(() => {
    console.log('[DateTimePicker] Saving:', selectedDate.toISOString(), 'AllDay:', isAllDay);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    onSave(selectedDate, isAllDay);
  }, [selectedDate, isAllDay, onSave]);

  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) return 'Invalid Date';
    return EUDateFormatter.formatDate(date, 'long');
  };

  const formatTime = (date: Date) => {
    if (!date || isNaN(date.getTime())) return 'Invalid Time';
    return EUDateFormatter.formatTime(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
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
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.quickSelectSection}>
              <Text style={styles.sectionLabel}>Quick Select</Text>
              <View style={styles.quickSelectGrid}>
                <QuickSelectButton
                  label="Today"
                  active={isToday(selectedDate)}
                  onPress={() => handleQuickSelect(0)}
                />
                <QuickSelectButton
                  label="Tomorrow"
                  active={isTomorrow(selectedDate)}
                  onPress={() => handleQuickSelect(1)}
                />
                <QuickSelectButton
                  label="In 3 days"
                  active={false}
                  onPress={() => handleQuickSelect(3)}
                />
                <QuickSelectButton
                  label="Next week"
                  active={false}
                  onPress={() => handleQuickSelect(7)}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.allDaySection}>
              <View style={styles.allDayLeft}>
                <Text style={styles.allDayLabel}>All Day</Text>
                <Text style={styles.allDayHint}>No specific time</Text>
              </View>
              <Switch
                value={isAllDay}
                onValueChange={handleAllDayToggle}
                trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                thumbColor={isAllDay ? '#3B82F6' : '#F9FAFB'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.currentSelectionSection}>
              <Text style={styles.sectionLabel}>Selected</Text>
              
              <TouchableOpacity
                style={styles.selectionButton}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setShowNativeDatePicker(true);
                }}
              >
                <View style={styles.selectionIcon}>
                  <Calendar size={20} color="#3B82F6" />
                </View>
                <View style={styles.selectionContent}>
                  <Text style={styles.selectionLabel}>Date</Text>
                  <Text style={styles.selectionValue}>{formatDate(selectedDate)}</Text>
                </View>
              </TouchableOpacity>

              {!isAllDay && (
                <TouchableOpacity
                  style={styles.selectionButton}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setShowNativeTimePicker(true);
                  }}
                >
                  <View style={styles.selectionIcon}>
                    <Clock size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.selectionContent}>
                    <Text style={styles.selectionLabel}>Time</Text>
                    <Text style={styles.selectionValue}>{formatTime(selectedDate)}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

        {Platform.OS === 'ios' && showNativeDatePicker && (
          <View style={styles.pickerOverlay}>
            <TouchableOpacity
              style={styles.pickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowNativeDatePicker(false)}
            />
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowNativeDatePicker(false)}>
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

        {Platform.OS === 'android' && showNativeDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={minDate}
          />
        )}

        {Platform.OS === 'ios' && showNativeTimePicker && (
          <View style={styles.pickerOverlay}>
            <TouchableOpacity
              style={styles.pickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowNativeTimePicker(false)}
            />
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowNativeTimePicker(false)}>
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

        {Platform.OS === 'android' && showNativeTimePicker && (
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

interface QuickSelectButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function QuickSelectButton({ label, active, onPress }: QuickSelectButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.quickSelectButton, active && styles.quickSelectButtonActive]}
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
    >
      <Text style={[styles.quickSelectText, active && styles.quickSelectTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
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
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  quickSelectSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  quickSelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSelectButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quickSelectButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  quickSelectText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  quickSelectTextActive: {
    color: '#3B82F6',
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 24,
  },
  allDaySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  allDayLeft: {
    gap: 2,
  },
  allDayLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  allDayHint: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  currentSelectionSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  selectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionContent: {
    flex: 1,
    gap: 2,
  },
  selectionLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#9CA3AF',
  },
  selectionValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
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
    paddingVertical: 14,
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
