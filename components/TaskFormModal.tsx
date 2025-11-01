import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Switch,
  KeyboardAvoidingView,
} from 'react-native';

import {
  X,
  Calendar,
  Users,
  Flag,
  Bell,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskCategory, User, TaskPriority, ReminderType, RecurrenceType, Task } from '@/types';
import { EUDateFormatter } from '@/utils/EULocale';
import { NativeDatePicker } from '@/components/NativeDatePicker';

export interface TaskFormData {
  title: string;
  description: string;
  category: TaskCategory;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  gracePeriod: number;
  stake: number;
  assignedTo: string[];
  priority: TaskPriority;
  reminder: ReminderType;
  customReminderMinutes: number;
  recurrence: RecurrenceType;
  isShared: boolean;
  fundTargetId?: string;
}

export interface FundTargetOption {
  id: string;
  name: string;
  emoji: string;
}

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  categories: Record<TaskCategory, { emoji: string; color: string; label: string }>;
  members: User[];
  fundTargets?: FundTargetOption[];
  defaultGraceMinutes: number;
  defaultStakeCents: number;
  currencySymbol: string;
  existingTasks?: Task[];
  existingTask?: Task;
  mode?: 'create' | 'edit';
}

const DRAFT_KEY = '@bettertogether/task_draft';

export function TaskFormModal({
  visible,
  onClose,
  onSubmit,
  categories,
  members,
  fundTargets = [],
  defaultGraceMinutes,
  defaultStakeCents,
  currencySymbol,
  existingTask,
  mode = 'create',
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>(existingTask?.category || 'Household');
  const [startDate, setStartDate] = useState<Date>(() => {
    if (existingTask) {
      const d = new Date(existingTask.startAt);
      return isNaN(d.getTime()) ? (() => {
        const fallback = new Date();
        fallback.setHours(fallback.getHours() + 1, 0, 0, 0);
        return fallback;
      })() : d;
    }
    const date = new Date();
    date.setHours(date.getHours() + 1, 0, 0, 0);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    if (existingTask) {
      const d = new Date(existingTask.endAt);
      return isNaN(d.getTime()) ? (() => {
        const fallback = new Date();
        fallback.setHours(fallback.getHours() + 2, 0, 0, 0);
        return fallback;
      })() : d;
    }
    const date = new Date();
    date.setHours(date.getHours() + 2, 0, 0, 0);
    return date;
  });
  const [allDay, setAllDay] = useState(existingTask?.allDay || false);
  const [stake, setStake] = useState(existingTask ? String(existingTask.stake) : String(defaultStakeCents / 100));
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    existingTask
      ? Array.isArray(existingTask.assignedTo)
        ? existingTask.assignedTo
        : [existingTask.assignedTo]
      : [members[0]?.id || '']
  );
  const [priority, setPriority] = useState<TaskPriority>(existingTask?.priority || 'medium');
  const [reminder, setReminder] = useState<ReminderType>(existingTask?.reminder || 'none');
  const [customReminderMinutes, setCustomReminderMinutes] = useState(
    existingTask?.customReminderMinutes ? String(existingTask.customReminderMinutes) : '30'
  );
  const [recurrence, setRecurrence] = useState<RecurrenceType>(existingTask?.recurrence || 'none');
  const [isShared, setIsShared] = useState(existingTask?.isShared ?? true);
  const [selectedFundTarget, setSelectedFundTarget] = useState<string | undefined>(existingTask?.fundTargetId);

  useEffect(() => {
    if (existingTask && mode === 'edit') {
      console.log('[TaskForm] Loading existing task:', existingTask);
      setTitle(existingTask.title || '');
      setDescription(existingTask.description || '');
      setSelectedCategory(existingTask.category);
      
      const validStartDate = new Date(existingTask.startAt);
      const validEndDate = new Date(existingTask.endAt);
      
      if (!isNaN(validStartDate.getTime())) {
        setStartDate(validStartDate);
      } else {
        console.warn('[TaskForm] Invalid startAt date:', existingTask.startAt);
      }
      
      if (!isNaN(validEndDate.getTime())) {
        setEndDate(validEndDate);
      } else {
        console.warn('[TaskForm] Invalid endAt date:', existingTask.endAt);
      }
      
      setAllDay(existingTask.allDay || false);
      setStake(String(existingTask.stake));
      setSelectedMembers(
        Array.isArray(existingTask.assignedTo)
          ? existingTask.assignedTo
          : [existingTask.assignedTo]
      );
      setPriority(existingTask.priority || 'medium');
      setReminder(existingTask.reminder || 'none');
      setCustomReminderMinutes(
        existingTask.customReminderMinutes ? String(existingTask.customReminderMinutes) : '30'
      );
      setRecurrence(existingTask.recurrence || 'none');
      setIsShared(existingTask.isShared ?? true);
      setSelectedFundTarget(existingTask.fundTargetId);
    }
  }, [existingTask, mode]);

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showCustomReminderInput, setShowCustomReminderInput] = useState(false);
  const [showRecurrencePicker, setShowRecurrencePicker] = useState(false);
  const [showFundTargetPicker, setShowFundTargetPicker] = useState(false);
  const [showStakePicker, setShowStakePicker] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadDraft = useCallback(async () => {
    if (mode === 'edit') return;
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.error('[Draft] Failed to clear:', error);
    }
  }, [mode]);

  useEffect(() => {
    if (visible && mode === 'create') {
      loadDraft();
    }
  }, [visible, mode, loadDraft]);

  const saveDraft = useCallback(async () => {
    if (!title || mode === 'edit') return;
    try {
      const draft = {
        title,
        description,
        category: selectedCategory,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        allDay,
        stake,
        assignedTo: selectedMembers,
        priority,
        reminder,
        recurrence,
      };
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error('[Draft] Failed to save:', error);
    }
  }, [title, description, selectedCategory, startDate, endDate, allDay, stake, selectedMembers, priority, reminder, recurrence, mode]);

  useEffect(() => {
    if (visible && title && mode === 'create') {
      saveDraft();
    }
  }, [visible, title, mode, saveDraft]);

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.error('[Draft] Failed to clear:', error);
    }
  };

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      setTitleError('Task name is required');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    const now = new Date();
    if (mode === 'create' && startDate <= now) {
      setTitleError('Start date must be in the future');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    if (endDate <= startDate) {
      setTitleError('End date must be after start date');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    const stakeAmount = parseFloat(stake);

    if (stakeAmount < 0) {
      setTitleError('Stake must be positive');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category: selectedCategory,
      startDate,
      endDate,
      allDay,
      gracePeriod: defaultGraceMinutes,
      stake: isNaN(stakeAmount) ? defaultStakeCents / 100 : stakeAmount,
      assignedTo: selectedMembers,
      priority,
      reminder,
      customReminderMinutes: parseInt(customReminderMinutes, 10) || 30,
      recurrence,
      isShared,
      fundTargetId: selectedFundTarget,
    });

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (mode === 'create') {
      clearDraft();
    }
    onClose();
  }, [
    title,
    description,
    selectedCategory,
    startDate,
    endDate,
    allDay,
    stake,
    selectedMembers,
    priority,
    reminder,
    customReminderMinutes,
    recurrence,
    isShared,
    onSubmit,
    onClose,
    defaultGraceMinutes,
    defaultStakeCents,
    selectedFundTarget,
    mode,
  ]);

  const toggleMember = useCallback((userId: string) => {
    setSelectedMembers((prev) => {
      if (prev.includes(userId)) {
        return prev.length > 1 ? prev.filter((id) => id !== userId) : prev;
      }
      return [...prev, userId];
    });
  }, []);

  const handleDateSave = useCallback((newDate: Date, newAllDay: boolean) => {
    console.log('[DatePicker] Saving date:', newDate.toISOString(), 'AllDay:', newAllDay);
    
    const duration = endDate.getTime() - startDate.getTime();
    const newEnd = new Date(newDate.getTime() + (duration > 0 ? duration : 3600000));
    
    setStartDate(newDate);
    setEndDate(newEnd);
    setAllDay(newAllDay);
    setShowDatePicker(false);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [startDate, endDate]);



  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      console.warn('[TaskForm] Invalid date in formatDate:', date);
      return 'Invalid Date';
    }
    return EUDateFormatter.formatDate(date, 'long');
  };

  const formatTime = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      console.warn('[TaskForm] Invalid date in formatTime:', date);
      return 'Invalid Time';
    }
    return EUDateFormatter.formatTime(date);
  };

  const selectedMembersText = useMemo(() => {
    if (selectedMembers.length === 0) return 'Select members';
    if (selectedMembers.length === 1) {
      return members.find((m) => m.id === selectedMembers[0])?.name || '';
    }
    return `${selectedMembers.length} members`;
  }, [selectedMembers, members]);

  const categoryMeta = categories[selectedCategory];

  const priorityConfig = {
    low: { label: 'Low', color: '#6B7280', icon: '↓' },
    medium: { label: 'Medium', color: '#F59E0B', icon: '→' },
    high: { label: 'High', color: '#EF4444', icon: '↑' },
  };

  const reminderConfig = {
    none: { label: 'None' },
    at_due: { label: 'At Due Time' },
    '30_min': { label: '30 Minutes Before' },
    custom: { label: 'Custom' },
  };

  const recurrenceConfig = {
    none: { label: 'None' },
    daily: { label: 'Daily' },
    weekly: { label: 'Weekly' },
    monthly: { label: 'Monthly' },
  };

  const isFormValid = mode === 'edit'
    ? title.trim().length > 0 && endDate > startDate
    : title.trim().length > 0 && startDate > new Date() && endDate > startDate;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{mode === 'edit' ? 'Edit Task' : 'New Task'}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                onClose();
              }}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
          {titleError ? (
            <View style={styles.errorBanner}>
              <AlertCircle size={20} color="#EF4444" />
              <Text style={styles.errorText}>{titleError}</Text>
            </View>
          ) : null}

          <View style={styles.mainSection}>
            <TextInput
              style={[styles.titleInput, titleError ? styles.inputError : null]}
              placeholder="Task Name"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (titleError) setTitleError('');
              }}
              maxLength={100}
              autoFocus={false}
            />
            
            <TextInput
              style={styles.descriptionInput}
              placeholder="Description (optional)"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
              autoFocus={false}
            />
          </View>

          <View style={styles.fundTargetProminent}>
            {fundTargets && fundTargets.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.fundTargetCard,
                  selectedFundTarget && styles.fundTargetCardSelected
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setShowFundTargetPicker(true);
                }}
              >
                <View style={styles.fundTargetCardHeader}>
                  <View style={styles.fundTargetIconContainer}>
                    <Text style={styles.fundTargetCardEmoji}>
                      {selectedFundTarget
                        ? fundTargets.find((f) => f.id === selectedFundTarget)?.emoji || '🎯'
                        : '🎯'}
                    </Text>
                  </View>
                  <View style={styles.fundTargetCardContent}>
                    <Text style={styles.fundTargetCardLabel}>Fund Goal</Text>
                    <Text style={styles.fundTargetCardName}>
                      {selectedFundTarget
                        ? fundTargets.find((f) => f.id === selectedFundTarget)?.name || 'Select goal'
                        : 'Select a goal'}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#6B7280" />
                </View>
                {selectedFundTarget && (
                  <View style={styles.fundTargetStakeInfo}>
                    <Text style={styles.fundTargetStakeText}>
                      💶 {currencySymbol}{stake} goes to this goal if task fails
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            
            <TouchableOpacity
              style={styles.dateTimeCard}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowDatePicker(true);
              }}
            >
              <View style={styles.dateTimeCardLeft}>
                <View style={styles.dateTimeIcon}>
                  <Calendar size={20} color="#3B82F6" />
                </View>
                <View style={styles.dateTimeContent}>
                  <Text style={styles.dateTimeLabel}>Due Date & Time</Text>
                  <Text style={styles.dateTimeValueText}>
                    {formatDate(startDate)}
                    {!allDay && ` · ${formatTime(startDate)}`}
                  </Text>
                  {allDay && <Text style={styles.allDayBadge}>All Day</Text>}
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowCategoryPicker(true);
              }}
            >
              <View style={styles.fieldRowLeft}>
                <View style={styles.fieldIcon}>
                  <View style={[styles.categoryDot, { backgroundColor: categoryMeta.color }]} />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Category</Text>
                  <Text style={styles.fieldValue}>{categoryMeta.emoji} {categoryMeta.label}</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowMemberPicker(true);
              }}
            >
              <View style={styles.fieldRowLeft}>
                <View style={styles.fieldIcon}>
                  <Users size={20} color="#6B7280" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Assigned To</Text>
                  <Text style={styles.fieldValue}>{selectedMembersText}</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowStakePicker(true);
              }}
            >
              <View style={styles.fieldRowLeft}>
                <View style={styles.fieldIcon}>
                  <Text style={styles.fieldIconEmoji}>💶</Text>
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Stake Amount</Text>
                  <Text style={styles.fieldValue}>{currencySymbol}{stake}</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowPriorityPicker(true);
              }}
            >
              <View style={styles.fieldRowLeft}>
                <View style={styles.fieldIcon}>
                  <Flag size={20} color={priorityConfig[priority].color} />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Priority</Text>
                  <Text style={[styles.fieldValue, { color: priorityConfig[priority].color }]}>
                    {priorityConfig[priority].label}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowReminderPicker(true);
              }}
            >
              <View style={styles.fieldRowLeft}>
                <View style={styles.fieldIcon}>
                  <Bell size={20} color="#6B7280" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Reminder</Text>
                  <Text style={styles.fieldValue}>
                    {reminder === 'custom'
                      ? `${customReminderMinutes} min before`
                      : reminderConfig[reminder].label}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowRecurrencePicker(true);
              }}
            >
              <View style={styles.fieldRowLeft}>
                <View style={styles.fieldIcon}>
                  <RefreshCw size={20} color="#6B7280" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Recurrence</Text>
                  <Text style={styles.fieldValue}>{recurrenceConfig[recurrence].label}</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {selectedMembers.length > 1 && (
              <View style={styles.fieldRow}>
                <View style={styles.fieldRowLeft}>
                  <View style={styles.fieldIcon}>
                    <Users size={20} color="#6B7280" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Shared Task</Text>
                    <Text style={styles.fieldValue}>{isShared ? 'Yes' : 'No'}</Text>
                  </View>
                </View>
                <Switch
                  value={isShared}
                  onValueChange={setIsShared}
                  trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                  thumbColor={isShared ? '#3B82F6' : '#F3F4F6'}
                />
              </View>
            )}
          </View>


          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!isFormValid}
            >
              <Text style={styles.submitButtonText}>{mode === 'edit' ? 'Save Changes' : 'Create Task'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showCategoryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCategoryPicker(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.categoryPickerList}>
              {(Object.keys(categories) as TaskCategory[]).map((cat) => {
                const meta = categories[cat];
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryPickerOption,
                      isSelected && styles.categoryPickerOptionSelected,
                    ]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setSelectedCategory(cat);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <View style={styles.categoryPickerLeft}>
                      <Text style={styles.categoryPickerEmoji}>{meta.emoji}</Text>
                      <Text style={styles.categoryPickerText}>{meta.label}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.categoryPickerCheck}>
                        <Check size={20} color="#3B82F6" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showMemberPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Members</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowMemberPicker(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {members.map((member) => {
              const isSelected = selectedMembers.includes(member.id);
              return (
                <TouchableOpacity
                  key={member.id}
                  style={[styles.memberOption, isSelected && styles.memberOptionSelected]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    toggleMember(member.id);
                  }}
                >
                  <View style={[styles.memberAvatar, { backgroundColor: member.color }]}>
                    <Text style={styles.memberAvatarText}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.memberName}>{member.name}</Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowMemberPicker(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <NativeDatePicker
        visible={showDatePicker}
        date={startDate}
        allDay={allDay}
        minDate={mode === 'create' ? new Date() : undefined}
        onClose={() => setShowDatePicker(false)}
        onSave={handleDateSave}
        title="Set Due Date & Time"
      />

      <Modal visible={showPriorityPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Priority</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPriorityPicker(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {(Object.keys(priorityConfig) as TaskPriority[]).map((p) => {
              const config = priorityConfig[p];
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.optionItem, priority === p && styles.optionItemSelected]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setPriority(p);
                    setShowPriorityPicker(false);
                  }}
                >
                  <Flag size={20} color={config.color} />
                  <Text style={[styles.optionItemText, { color: config.color }]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      <Modal visible={showReminderPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Reminder</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowReminderPicker(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {(Object.keys(reminderConfig) as ReminderType[]).map((r) => {
              const config = reminderConfig[r];
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.optionItem, reminder === r && styles.optionItemSelected]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    if (r === 'custom') {
                      setShowReminderPicker(false);
                      setTimeout(() => {
                        setShowCustomReminderInput(true);
                      }, 300);
                    } else {
                      setReminder(r);
                      setShowReminderPicker(false);
                    }
                  }}
                >
                  <Bell size={20} color="#6B7280" />
                  <Text style={styles.optionItemText}>{config.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      <Modal visible={showRecurrencePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Recurrence</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowRecurrencePicker(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {(Object.keys(recurrenceConfig) as RecurrenceType[]).map((rec) => {
              const config = recurrenceConfig[rec];
              return (
                <TouchableOpacity
                  key={rec}
                  style={[styles.optionItem, recurrence === rec && styles.optionItemSelected]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setRecurrence(rec);
                    setShowRecurrencePicker(false);
                  }}
                >
                  <RefreshCw size={20} color="#6B7280" />
                  <Text style={styles.optionItemText}>{config.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      <Modal visible={showFundTargetPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Fund Target</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFundTargetPicker(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.optionItem, selectedFundTarget === undefined && styles.optionItemSelected]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setSelectedFundTarget(undefined);
                setShowFundTargetPicker(false);
              }}
            >
              <Text style={styles.categoryEmoji}>🚫</Text>
              <Text style={styles.optionItemText}>None</Text>
            </TouchableOpacity>
            {fundTargets.map((target) => (
              <TouchableOpacity
                key={target.id}
                style={[styles.optionItem, selectedFundTarget === target.id && styles.optionItemSelected]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedFundTarget(target.id);
                  setShowFundTargetPicker(false);
                }}
              >
                <Text style={styles.categoryEmoji}>{target.emoji}</Text>
                <Text style={styles.optionItemText}>{target.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={showCustomReminderInput} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Custom Reminder</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCustomReminderInput(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              <Text style={styles.label}>Minutes before task starts</Text>
              <TextInput
                style={[styles.input, { fontSize: 20 }]}
                placeholder="30"
                placeholderTextColor="#9CA3AF"
                value={customReminderMinutes}
                onChangeText={(text) => {
                  const num = text.replace(/[^0-9]/g, '');
                  setCustomReminderMinutes(num);
                }}
                keyboardType="number-pad"
              />
              <View style={styles.quickReminderChips}>
                {[
                  { label: '5 min', value: '5' },
                  { label: '15 min', value: '15' },
                  { label: '30 min', value: '30' },
                  { label: '1 hour', value: '60' },
                  { label: '1 day', value: '1440' },
                ].map((preset) => (
                  <TouchableOpacity
                    key={preset.value}
                    style={styles.reminderPresetChip}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setCustomReminderMinutes(preset.value);
                    }}
                  >
                    <Text style={styles.reminderPresetChipText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => {
                  const minutes = parseInt(customReminderMinutes, 10);
                  if (minutes > 0) {
                    setReminder('custom');
                    setShowCustomReminderInput(false);
                  }
                }}
              >
                <Text style={styles.doneButtonText}>Set Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showStakePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Stake Amount</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowStakePicker(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              <Text style={styles.label}>Amount ({currencySymbol})</Text>
              <TextInput
                style={[styles.input, { fontSize: 20 }]}
                placeholder="5.00"
                placeholderTextColor="#9CA3AF"
                value={stake}
                onChangeText={(text) => {
                  const filtered = text.replace(/[^0-9.]/g, '');
                  const parts = filtered.split('.');
                  if (parts.length > 2) {
                    setStake(parts[0] + '.' + parts.slice(1).join(''));
                  } else {
                    setStake(filtered);
                  }
                }}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setShowStakePicker(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#EF4444',
  },
  mainSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    marginBottom: 12,
  },
  fundTargetProminent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  fundTargetCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  fundTargetCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  fundTargetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  fundTargetIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  fundTargetCardEmoji: {
    fontSize: 28,
  },
  fundTargetCardContent: {
    flex: 1,
    gap: 4,
  },
  fundTargetCardLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fundTargetCardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  fundTargetStakeInfo: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  fundTargetStakeText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#3B82F6',
    textAlign: 'center',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  inputError: {
    borderBottomColor: '#EF4444',
  },
  descriptionInput: {
    fontSize: 15,
    color: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 0,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  fieldRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  fieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldIconEmoji: {
    fontSize: 20,
  },
  categoryDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  fieldContent: {
    flex: 1,
    gap: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#9CA3AF',
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#111827',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  submitButton: {
    flex: 2,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  categoryPickerList: {
    padding: 16,
  },
  categoryPickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryPickerOptionSelected: {
    backgroundColor: '#DBEAFE',
  },
  categoryPickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryPickerEmoji: {
    fontSize: 24,
  },
  categoryPickerText: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '500' as const,
  },
  categoryPickerCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  memberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  memberOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500' as const,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  doneButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionItemText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500' as const,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dateTimeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  dateTimeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTimeContent: {
    flex: 1,
    gap: 2,
  },
  dateTimeLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#9CA3AF',
  },
  dateTimeValueText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#111827',
  },
  allDayBadge: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#3B82F6',
    marginTop: 2,
  },
  quickReminderChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  reminderPresetChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reminderPresetChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#374151',
  },
});
