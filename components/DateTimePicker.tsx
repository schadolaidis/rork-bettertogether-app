import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
  Switch,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar, Clock, X, ChevronLeft, ChevronRight, Zap } from 'lucide-react-native';
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
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    if (visible) {
      const validDate = new Date(initialDate);
      if (isNaN(validDate.getTime())) {
        console.warn('[DateTimePicker] Invalid initial date, using current time');
        const now = new Date();
        now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
        now.setSeconds(0, 0);
        setSelectedDate(now);
        setCurrentMonth(now);
      } else {
        const date = new Date(validDate);
        setSelectedDate(date);
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      }
      setIsAllDay(initialAllDay);
      
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialDate, initialAllDay, fadeAnim, slideAnim]);

  const handleDateChange = useCallback((_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowNativeDatePicker(false);
    }

    if (date && !isNaN(date.getTime())) {
      setSelectedDate((prev) => {
        const newDate = new Date(prev);
        newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (isAllDay) {
          newDate.setHours(0, 0, 0, 0);
        }
        
        console.log('[DateTimePicker] Date updated:', newDate.toISOString());
        return newDate;
      });
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [isAllDay]);

  const handleTimeChange = useCallback((_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowNativeTimePicker(false);
    }

    if (date && !isNaN(date.getTime())) {
      setSelectedDate((prev) => {
        const newDate = new Date(prev);
        newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
        
        console.log('[DateTimePicker] Time updated:', newDate.toISOString());
        return newDate;
      });
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, []);

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
    setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [isAllDay]);

  const handleDateSelect = useCallback((date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(
      isAllDay ? 0 : selectedDate.getHours(),
      isAllDay ? 0 : selectedDate.getMinutes(),
      0,
      0
    );
    setSelectedDate(newDate);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [selectedDate, isAllDay]);

  const handleTimeSelect = useCallback((hours: number, minutes: number) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);
    setSelectedDate(newDate);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [selectedDate]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentMonth]);

  const getRelativeTimeText = useCallback((date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
    return null;
  }, []);

  const hours = useMemo(() => {
    const result = [];
    for (let i = 0; i < 24; i++) {
      result.push(i);
    }
    return result;
  }, []);

  const minutes = useMemo(() => [0, 15, 30, 45], []);

  const handleSave = useCallback(() => {
    const finalDate = new Date(selectedDate);
    
    if (isAllDay) {
      finalDate.setHours(0, 0, 0, 0);
    }
    
    console.log('[DateTimePicker] Saving:', finalDate.toISOString(), 'AllDay:', isAllDay);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    onSave(finalDate, isAllDay);
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
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
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
            <View style={styles.previewSection}>
              <View style={styles.previewIcon}>
                <Calendar size={24} color="#3B82F6" />
              </View>
              <View style={styles.previewTextContainer}>
                <Text style={styles.previewDate}>{formatDate(selectedDate)}</Text>
                {!isAllDay && (
                  <Text style={styles.previewTime}>{formatTime(selectedDate)}</Text>
                )}
                {getRelativeTimeText(selectedDate) && (
                  <View style={styles.relativeTimeBadge}>
                    <Zap size={12} color="#3B82F6" />
                    <Text style={styles.relativeTimeText}>{getRelativeTimeText(selectedDate)}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.quickSelectSection}>
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

            <View style={styles.calendarSection}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  style={styles.monthNavButton}
                  onPress={() => navigateMonth('prev')}
                >
                  <ChevronLeft size={20} color="#6B7280" />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity
                  style={styles.monthNavButton}
                  onPress={() => navigateMonth('next')}
                >
                  <ChevronRight size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.weekdayHeader}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <View key={i} style={styles.weekdayCell}>
                    <Text style={styles.weekdayText}>{day}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <View key={`empty-${index}`} style={styles.dayCell} />;
                  }
                  
                  const isSelected = day.toDateString() === selectedDate.toDateString();
                  const isTodayDate = day.toDateString() === new Date().toDateString();
                  const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayCell,
                        isSelected && styles.dayCellSelected,
                        isTodayDate && !isSelected && styles.dayCellToday,
                      ]}
                      onPress={() => handleDateSelect(day)}
                      disabled={isPast}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.dayTextSelected,
                          isTodayDate && !isSelected && styles.dayTextToday,
                          isPast && styles.dayTextPast,
                        ]}
                      >
                        {day.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.allDaySection}>
              <View style={styles.allDayLeft}>
                <Clock size={20} color="#6B7280" />
                <View>
                  <Text style={styles.allDayLabel}>All Day Event</Text>
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

            {!isAllDay && (
              <>
                <View style={styles.divider} />
                <View style={styles.timeSection}>
                  <Text style={styles.sectionLabel}>Time</Text>
                  <View style={styles.timePickerContainer}>
                    <ScrollView
                      style={styles.timePicker}
                      showsVerticalScrollIndicator={false}
                    >
                      {hours.map((hour) => (
                        <TouchableOpacity
                          key={hour}
                          style={[
                            styles.timeOption,
                            selectedDate.getHours() === hour && styles.timeOptionSelected,
                          ]}
                          onPress={() => handleTimeSelect(hour, selectedDate.getMinutes())}
                        >
                          <Text
                            style={[
                              styles.timeOptionText,
                              selectedDate.getHours() === hour && styles.timeOptionTextSelected,
                            ]}
                          >
                            {String(hour).padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <Text style={styles.timeSeparator}>:</Text>
                    <ScrollView
                      style={styles.timePicker}
                      showsVerticalScrollIndicator={false}
                    >
                      {minutes.map((minute) => (
                        <TouchableOpacity
                          key={minute}
                          style={[
                            styles.timeOption,
                            selectedDate.getMinutes() === minute && styles.timeOptionSelected,
                          ]}
                          onPress={() => handleTimeSelect(selectedDate.getHours(), minute)}
                        >
                          <Text
                            style={[
                              styles.timeOptionText,
                              selectedDate.getMinutes() === minute && styles.timeOptionTextSelected,
                            ]}
                          >
                            {String(minute).padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </>
            )}
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
        </Animated.View>

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
      </KeyboardAvoidingView>
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
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
  previewSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTextContainer: {
    flex: 1,
    gap: 4,
  },
  previewDate: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    letterSpacing: -0.5,
  },
  previewTime: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  relativeTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  relativeTimeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  quickSelectSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  quickSelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSelectButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  quickSelectButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quickSelectText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  quickSelectTextActive: {
    color: '#3B82F6',
    fontWeight: '700' as const,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 24,
  },
  calendarSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#111827',
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#9CA3AF',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  dayCellToday: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#111827',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  dayTextToday: {
    color: '#F59E0B',
    fontWeight: '700' as const,
  },
  dayTextPast: {
    color: '#D1D5DB',
  },
  allDaySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
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
  timeSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  timePicker: {
    maxHeight: 180,
    width: 80,
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#3B82F6',
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 4,
  },
  timeOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  timeOptionText: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  timeOptionTextSelected: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#3B82F6',
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
    paddingVertical: 16,
    borderRadius: 14,
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
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
