import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface DateTimePickerModalProps {
  visible: boolean;
  initialDate: Date;
  allDay?: boolean;
  minDate?: Date;
  onClose: () => void;
  onSave: (date: Date, allDay: boolean) => void;
  title?: string;
  taskPriority?: 'low' | 'medium' | 'high';
}

export function DateTimePickerModal({
  visible,
  initialDate,
  allDay: initialAllDay = false,
  minDate,
  onClose,
  onSave,
  title = 'Set Date & Time',
  taskPriority,
}: DateTimePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState({ hour: 9, minute: 0 });
  const slideAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      const validDate = new Date(initialDate);
      if (isNaN(validDate.getTime())) {
        console.warn('[DateTimePicker] Invalid initial date, using current time');
        const now = new Date();
        now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
        now.setSeconds(0, 0);
        setSelectedDate(now);
        setViewDate(new Date(now));
        setSelectedTime({ hour: now.getHours(), minute: now.getMinutes() });
      } else {
        setSelectedDate(new Date(validDate));
        setViewDate(new Date(validDate));
        setSelectedTime({ hour: validDate.getHours(), minute: validDate.getMinutes() });
      }
    }
  }, [visible, initialDate]);

  const selectDate = useCallback((date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
    setSelectedDate(newDate);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [selectedTime]);

  const selectTime = useCallback((hour: number, minute: number) => {
    setSelectedTime({ hour, minute });
    const newDate = new Date(selectedDate);
    newDate.setHours(hour, minute, 0, 0);
    setSelectedDate(newDate);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [selectedDate]);

  const handleQuickSelect = useCallback((daysFromNow: number, hour: number = 9) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + daysFromNow);
    newDate.setHours(hour, 0, 0, 0);
    
    setSelectedDate(newDate);
    setViewDate(new Date(newDate));
    setSelectedTime({ hour, minute: 0 });
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const handleSave = useCallback(() => {
    console.log('[DateTimePicker] Saving:', selectedDate.toISOString());
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    onSave(selectedDate, false);
  }, [selectedDate, onSave]);



  const formatTime = (hour: number, minute: number) => {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
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

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    
    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isPast: boolean }[] = [];
    
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        isSelected: isSameDay(date, selectedDate),
        isPast: date < today && !isToday(date),
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isToday(date),
        isSelected: isSameDay(date, selectedDate),
        isPast: date < today && !isToday(date),
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        isSelected: isSameDay(date, selectedDate),
        isPast: false,
      });
    }
    
    return days;
  }, [viewDate, selectedDate]);

  const goToPrevMonth = useCallback(() => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getSmartSuggestion = () => {
    if (!taskPriority) return null;
    
    const daysUntil = getDaysUntil(selectedDate);
    
    if (taskPriority === 'high' && daysUntil > 2) {
      return '⚡ High priority — consider earlier date';
    }
    if (taskPriority === 'low' && daysUntil < 7) {
      return '💡 Low priority — you have time';
    }
    
    return null;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  const smartSuggestion = getSmartSuggestion();
  const daysUntil = getDaysUntil(selectedDate);
  const daysUntilText = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.livePreview}>
                <Text style={styles.livePreviewText}>{daysUntilText}</Text>
                <View style={styles.livePreviewDot} />
                <Text style={styles.livePreviewTime}>{formatTime(selectedTime.hour, selectedTime.minute)}</Text>
              </View>
            </View>
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
              <View style={styles.quickSelectGrid}>
                <QuickSelectButton
                  label="Today"
                  sublabel="9:00"
                  emoji="☀️"
                  active={isToday(selectedDate) && selectedTime.hour === 9}
                  onPress={() => handleQuickSelect(0, 9)}
                />
                <QuickSelectButton
                  label="Tomorrow"
                  sublabel="9:00"
                  emoji="🌅"
                  active={isTomorrow(selectedDate) && selectedTime.hour === 9}
                  onPress={() => handleQuickSelect(1, 9)}
                />
                <QuickSelectButton
                  label="This Weekend"
                  sublabel="10:00"
                  emoji="🎉"
                  active={false}
                  onPress={() => {
                    const today = new Date();
                    const dayOfWeek = today.getDay();
                    const daysUntilSaturday = 6 - dayOfWeek;
                    handleQuickSelect(daysUntilSaturday > 0 ? daysUntilSaturday : 7, 10);
                  }}
                />
                <QuickSelectButton
                  label="Next Week"
                  sublabel="9:00"
                  emoji="📅"
                  active={false}
                  onPress={() => handleQuickSelect(7, 9)}
                />
              </View>
            </View>

            {smartSuggestion && (
              <View style={styles.smartSuggestion}>
                <Sparkles size={16} color="#8B5CF6" />
                <Text style={styles.smartSuggestionText}>{smartSuggestion}</Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.calendarSection}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  style={styles.calendarNavButton}
                  onPress={goToPrevMonth}
                >
                  <ChevronLeft size={20} color="#6B7280" />
                </TouchableOpacity>
                <Text style={styles.calendarMonth}>
                  {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity
                  style={styles.calendarNavButton}
                  onPress={goToNextMonth}
                >
                  <ChevronRight size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.calendarWeekdays}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <View key={i} style={styles.weekdayCell}>
                    <Text style={styles.weekdayText}>{day}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {calendarDays.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      day.isToday && styles.calendarDayToday,
                      day.isSelected && styles.calendarDaySelected,
                      day.isPast && styles.calendarDayPast,
                    ]}
                    onPress={() => selectDate(day.date)}
                    disabled={day.isPast}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        !day.isCurrentMonth && styles.calendarDayTextDimmed,
                        day.isToday && styles.calendarDayTextToday,
                        day.isSelected && styles.calendarDayTextSelected,
                        day.isPast && styles.calendarDayTextPast,
                      ]}
                    >
                      {day.date.getDate()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.timeSection}>
              <Text style={styles.sectionLabel}>TIME</Text>
              
              <View style={styles.timePickerContainer}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeColumnLabel}>Hour</Text>
                  <ScrollView
                    style={styles.timeScrollView}
                    contentContainerStyle={styles.timeScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {hours.map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.timeButton,
                          selectedTime.hour === hour && styles.timeButtonSelected,
                        ]}
                        onPress={() => selectTime(hour, selectedTime.minute)}
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            selectedTime.hour === hour && styles.timeButtonTextSelected,
                          ]}
                        >
                          {String(hour).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Text style={styles.timeSeparator}>:</Text>

                <View style={styles.timeColumn}>
                  <Text style={styles.timeColumnLabel}>Minute</Text>
                  <ScrollView
                    style={styles.timeScrollView}
                    contentContainerStyle={styles.timeScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {minutes.map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.timeButton,
                          selectedTime.minute === minute && styles.timeButtonSelected,
                        ]}
                        onPress={() => selectTime(selectedTime.hour, minute)}
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            selectedTime.minute === minute && styles.timeButtonTextSelected,
                          ]}
                        >
                          {String(minute).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
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
              <Text style={styles.saveButtonText}>Set Due Date</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

interface QuickSelectButtonProps {
  label: string;
  sublabel?: string;
  emoji?: string;
  active: boolean;
  onPress: () => void;
}

function QuickSelectButton({ label, sublabel, emoji, active, onPress }: QuickSelectButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.quickSelectButton, active && styles.quickSelectButtonActive]}
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onPress();
      }}
    >
      {emoji && <Text style={styles.quickSelectEmoji}>{emoji}</Text>}
      <Text style={[styles.quickSelectText, active && styles.quickSelectTextActive]}>
        {label}
      </Text>
      {sublabel && (
        <Text style={[styles.quickSelectSublabel, active && styles.quickSelectSublabelActive]}>
          {sublabel}
        </Text>
      )}
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
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#111827',
  },
  livePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePreviewText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  livePreviewDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  livePreviewTime: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  quickSelectSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  quickSelectGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  quickSelectButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  quickSelectButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  quickSelectEmoji: {
    fontSize: 24,
  },
  quickSelectText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
  },
  quickSelectTextActive: {
    color: '#3B82F6',
  },
  quickSelectSublabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#9CA3AF',
  },
  quickSelectSublabelActive: {
    color: '#60A5FA',
  },
  smartSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  smartSuggestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#7C3AED',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginVertical: 16,
  },
  calendarSection: {
    paddingHorizontal: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  calendarWeekdays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#9CA3AF',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 4,
  },
  calendarDayToday: {
    backgroundColor: '#FEF3C7',
  },
  calendarDaySelected: {
    backgroundColor: '#3B82F6',
  },
  calendarDayPast: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#111827',
  },
  calendarDayTextDimmed: {
    color: '#D1D5DB',
  },
  calendarDayTextToday: {
    color: '#D97706',
    fontWeight: '700' as const,
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  calendarDayTextPast: {
    color: '#9CA3AF',
  },
  timeSection: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeColumn: {
    flex: 1,
    gap: 8,
  },
  timeColumnLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
    textAlign: 'center',
  },
  timeScrollView: {
    maxHeight: 180,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  timeScrollContent: {
    padding: 8,
    gap: 4,
  },
  timeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  timeButtonSelected: {
    backgroundColor: '#3B82F6',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#374151',
  },
  timeButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#3B82F6',
    marginTop: 32,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FAFBFC',
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
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
