import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform, 
  ScrollView, 
  TextInput,
  Switch,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { 
  X, 
  Calendar, 
  Users, 
  Flag, 
  Bell, 
  RefreshCw, 
  CheckCircle2,
  Check,
  ChevronRight,
  Clock,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { FundTargetOption } from '@/components/TaskFormModal';
import { MOCK_FUND_TARGETS } from '@/mocks/data';
import { TaskCategory, TaskPriority, ReminderType, RecurrenceType } from '@/types';
import { EUDateFormatter } from '@/utils/EULocale';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function TaskDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, currentList, currentListMembers, updateTask, completeTask } = useApp();

  const task = useMemo(() => {
    return tasks.find((t) => t.id === id);
  }, [tasks, id]);

  const fundTargets: FundTargetOption[] = useMemo(() => {
    if (!currentList) return [];
    return MOCK_FUND_TARGETS
      .filter(ft => ft.listId === currentList.id && ft.isActive)
      .map(ft => ({
        id: ft.id,
        name: ft.name,
        emoji: ft.emoji,
      }));
  }, [currentList]);

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showAssignedToPicker, setShowAssignedToPicker] = useState(false);
  const [showStakeInput, setShowStakeInput] = useState(false);
  const [showFundTargetPicker, setShowFundTargetPicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(new Date());
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showRecurrencePicker, setShowRecurrencePicker] = useState(false);
  
  const [editedTitle, setEditedTitle] = useState(task?.title || '');
  const [editedDescription, setEditedDescription] = useState(task?.description || '');

  const handleUpdateField = useCallback((field: string, value: any) => {
    if (!task) return;
    console.log('[TaskDetail] Updating field:', field, value);
    updateTask(task.id, { [field]: value });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [task, updateTask]);

  const handleSaveTitle = useCallback(() => {
    if (editedTitle.trim()) {
      handleUpdateField('title', editedTitle.trim());
    }
  }, [editedTitle, handleUpdateField]);

  const handleSaveDescription = useCallback(() => {
    handleUpdateField('description', editedDescription.trim());
  }, [editedDescription, handleUpdateField]);

  const handleCompleteTask = useCallback(() => {
    if (!task) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    completeTask(task.id);
    router.back();
  }, [task, completeTask, router]);

  const handleStartDateChange = useCallback((_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    
    if (!task || !selectedDate || isNaN(selectedDate.getTime())) return;
    
    console.log('[TaskDetail] Date selected:', selectedDate.toISOString());
    const currentStart = new Date(task.startAt);
    const newStart = new Date(selectedDate);
    newStart.setHours(currentStart.getHours(), currentStart.getMinutes(), 0, 0);
    
    const duration = new Date(task.endAt).getTime() - currentStart.getTime();
    const newEnd = new Date(newStart.getTime() + (duration > 0 ? duration : 3600000));
    
    updateTask(task.id, {
      startAt: newStart.toISOString(),
      endAt: newEnd.toISOString()
    });
    setTempStartDate(newStart);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [task, updateTask]);

  const handleStartTimeChange = useCallback((_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }
    
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      console.log('[TaskDetail] Time selected:', selectedDate.toISOString());
      setTempStartDate(selectedDate);
    }
  }, []);

  const confirmTimePicker = useCallback(() => {
    if (!task) return;
    console.log('[TaskDetail] Confirming time:', tempStartDate.toISOString());
    const newStart = new Date(task.startAt);
    newStart.setHours(tempStartDate.getHours(), tempStartDate.getMinutes(), 0, 0);
    
    const newEnd = new Date(newStart.getTime() + 3600000);
    
    updateTask(task.id, {
      startAt: newStart.toISOString(),
      endAt: newEnd.toISOString()
    });
    setShowStartTimePicker(false);
    
    console.log('[TaskDetail] Applied - Start:', newStart.toISOString(), 'End:', newEnd.toISOString());
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [task, tempStartDate, updateTask]);

  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) return 'Invalid Date';
    return EUDateFormatter.formatDate(date, 'long');
  };

  const formatTime = (date: Date) => {
    if (!date || isNaN(date.getTime())) return 'Invalid Time';
    return EUDateFormatter.formatTime(date);
  };

  if (!task || !currentList) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Task not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.back();
            }}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const categoryMeta = currentList.categories?.[task.category] || {
    emoji: '📋',
    color: '#6B7280',
    label: task.category
  };

  const assignedMembers = Array.isArray(task.assignedTo)
    ? currentListMembers.filter((m) => task.assignedTo.includes(m.id))
    : currentListMembers.filter((m) => m.id === task.assignedTo);

  const priorityConfig = {
    low: { label: 'Low', color: '#6B7280' },
    medium: { label: 'Medium', color: '#F59E0B' },
    high: { label: 'High', color: '#EF4444' },
  };

  const reminderConfig = {
    none: { label: 'None' },
    at_due: { label: 'At Due Time' },
    '30_min': { label: '30 Minutes Before' },
    custom: { label: `${task.customReminderMinutes || 30} Minutes Before` },
  };

  const recurrenceConfig = {
    none: { label: 'None' },
    daily: { label: 'Daily' },
    weekly: { label: 'Weekly' },
    monthly: { label: 'Monthly' },
  };

  const startDate = new Date(task.startAt);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Task</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.back();
            }}
          >
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainSection}>
            <TextInput
              style={styles.titleInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
              onBlur={handleSaveTitle}
              placeholder="Task Name"
              placeholderTextColor="#9CA3AF"
              maxLength={100}
            />
            
            <TextInput
              style={styles.descriptionInput}
              placeholder="Description (optional)"
              placeholderTextColor="#9CA3AF"
              value={editedDescription}
              onChangeText={setEditedDescription}
              onBlur={handleSaveDescription}
              multiline
              maxLength={500}
            />
          </View>

          <View style={styles.fundTargetProminent}>
            {fundTargets && fundTargets.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.fundTargetCard,
                  task.fundTargetId && styles.fundTargetCardSelected
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
                      {task.fundTargetId
                        ? fundTargets.find((f) => f.id === task.fundTargetId)?.emoji || '🎯'
                        : '🎯'}
                    </Text>
                  </View>
                  <View style={styles.fundTargetCardContent}>
                    <Text style={styles.fundTargetCardLabel}>Fund Goal</Text>
                    <Text style={styles.fundTargetCardName}>
                      {task.fundTargetId
                        ? fundTargets.find((f) => f.id === task.fundTargetId)?.name || 'Select goal'
                        : 'Select a goal'}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#6B7280" />
                </View>
                {task.fundTargetId && (
                  <View style={styles.fundTargetStakeInfo}>
                    <Text style={styles.fundTargetStakeText}>
                      💶 {currentList.currencySymbol}{task.stake} goes to this goal if task fails
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            
            <View style={styles.dateTimeSection}>
              <View style={styles.allDayRow}>
                <View style={styles.allDayContent}>
                  <Text style={styles.allDayLabel}>All Day</Text>
                  <Text style={styles.allDayHint}>No specific time</Text>
                </View>
                <Switch
                  value={task.allDay || false}
                  onValueChange={(value) => {
                    const newStart = new Date(task.startAt);
                    const newEnd = new Date(task.endAt);
                    
                    if (value) {
                      newStart.setHours(0, 0, 0, 0);
                      newEnd.setHours(23, 59, 59, 999);
                    } else {
                      const now = new Date();
                      newStart.setHours(now.getHours() + 1, 0, 0, 0);
                      newEnd.setHours(now.getHours() + 2, 0, 0, 0);
                    }
                    
                    updateTask(task.id, {
                      startAt: newStart.toISOString(),
                      endAt: newEnd.toISOString(),
                      allDay: value
                    });
                    
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                  thumbColor={task.allDay ? '#3B82F6' : '#F3F4F6'}
                />
              </View>

              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    const validStart = new Date(task.startAt);
                    setTempStartDate(isNaN(validStart.getTime()) ? new Date() : validStart);
                    setShowStartDatePicker(true);
                  }}
                >
                  <Calendar size={18} color="#6B7280" />
                  <Text style={styles.dateTimeValue}>{formatDate(startDate)}</Text>
                </TouchableOpacity>

                {!task.allDay && (
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      const validStart = new Date(task.startAt);
                      setTempStartDate(isNaN(validStart.getTime()) ? new Date() : validStart);
                      setShowStartTimePicker(true);
                    }}
                  >
                    <Clock size={18} color="#6B7280" />
                    <Text style={styles.dateTimeValue}>{formatTime(startDate)}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

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
                setShowAssignedToPicker(true);
              }}
            >
              <View style={styles.fieldRowLeft}>
                <View style={styles.fieldIcon}>
                  <Users size={20} color="#6B7280" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Assigned To</Text>
                  <Text style={styles.fieldValue}>{assignedMembers.map((m) => m.name).join(', ') || 'Unassigned'}</Text>
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
                setShowStakeInput(true);
              }}
            >
              <View style={styles.fieldRowLeft}>
                <View style={styles.fieldIcon}>
                  <Text style={styles.fieldIconEmoji}>💶</Text>
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Stake Amount</Text>
                  <Text style={styles.fieldValue}>{currentList.currencySymbol}{task.stake}</Text>
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
                  <Flag size={20} color={priorityConfig[task.priority || 'medium'].color} />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Priority</Text>
                  <Text style={[styles.fieldValue, { color: priorityConfig[task.priority || 'medium'].color }]}>
                    {priorityConfig[task.priority || 'medium'].label}
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
                    {task.reminder === 'custom'
                      ? `${task.customReminderMinutes || 30} min before`
                      : reminderConfig[task.reminder || 'none'].label}
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
                  <Text style={styles.fieldValue}>{recurrenceConfig[task.recurrence || 'none'].label}</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {task.status !== 'completed' && task.status !== 'failed' && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteTask}
            >
              <CheckCircle2 size={20} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
            </TouchableOpacity>
          )}

          {task.createdAt && (
            <View style={styles.metadataSection}>
              <Text style={styles.metadataText}>
                Created {EUDateFormatter.formatDate(new Date(task.createdAt), 'long')}
              </Text>
              {task.completedAt && (
                <Text style={styles.metadataText}>
                  Completed {EUDateFormatter.formatDate(new Date(task.completedAt), 'long')}
                </Text>
              )}
            </View>
          )}
        </ScrollView>

      <CategoryPickerModal
        visible={showCategoryPicker}
        categories={currentList.categories}
        selected={task.category}
        onClose={() => setShowCategoryPicker(false)}
        onSelect={(value) => {
          handleUpdateField('category', value);
          setShowCategoryPicker(false);
        }}
      />

      <SimplePicker
        visible={showPriorityPicker}
        title="Priority"
        options={Object.keys(priorityConfig).map((key) => ({
          label: priorityConfig[key as TaskPriority].label,
          value: key,
          color: priorityConfig[key as TaskPriority].color,
        }))}
        selected={task.priority || 'medium'}
        onClose={() => setShowPriorityPicker(false)}
        onSelect={(value) => handleUpdateField('priority', value)}
      />

      <SimplePicker
        visible={showReminderPicker}
        title="Reminder"
        options={Object.keys(reminderConfig).map((key) => ({
          label: reminderConfig[key as ReminderType].label,
          value: key,
        }))}
        selected={task.reminder || 'none'}
        onClose={() => setShowReminderPicker(false)}
        onSelect={(value) => handleUpdateField('reminder', value)}
      />

      <SimplePicker
        visible={showRecurrencePicker}
        title="Repeat"
        options={Object.keys(recurrenceConfig).map((key) => ({
          label: recurrenceConfig[key as RecurrenceType].label,
          value: key,
        }))}
        selected={task.recurrence || 'none'}
        onClose={() => setShowRecurrencePicker(false)}
        onSelect={(value) => handleUpdateField('recurrence', value)}
      />

      <AssignedToPickerModal
        visible={showAssignedToPicker}
        members={currentListMembers}
        selected={Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo]}
        onClose={() => setShowAssignedToPicker(false)}
        onSave={(memberIds) => {
          handleUpdateField('assignedTo', memberIds.length === 1 ? memberIds[0] : memberIds);
          setShowAssignedToPicker(false);
        }}
      />

      <TextInputModal
        visible={showStakeInput}
        title="Stake Amount"
        value={task.stake.toString()}
        placeholder="0.00"
        keyboardType="decimal-pad"
        onClose={() => setShowStakeInput(false)}
        onSave={(value) => {
          const numValue = parseFloat(value);
          if (!isNaN(numValue) && numValue >= 0) {
            handleUpdateField('stake', numValue);
          }
        }}
      />

      <FundTargetPickerModal
        visible={showFundTargetPicker}
        fundTargets={fundTargets}
        selected={task.fundTargetId || null}
        onClose={() => setShowFundTargetPicker(false)}
        onSelect={(fundTargetId) => {
          handleUpdateField('fundTargetId', fundTargetId);
          setShowFundTargetPicker(false);
        }}
      />

      {Platform.OS === 'ios' && showStartDatePicker && (
        <View style={styles.iosPickerOverlay}>
          <TouchableOpacity 
            style={styles.iosPickerBackdrop}
            activeOpacity={1}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowStartDatePicker(false);
            }}
          />
          <View style={styles.iosPickerContainer}>
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowStartDatePicker(false);
              }}>
                <Text style={styles.iosPickerDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempStartDate}
              mode="date"
              display="spinner"
              onChange={handleStartDateChange}
              style={styles.iosPicker}
            />
          </View>
        </View>
      )}

      {Platform.OS === 'android' && showStartDatePicker && (
        <DateTimePicker
          value={tempStartDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {Platform.OS === 'ios' && showStartTimePicker && (
        <View style={styles.iosPickerOverlay}>
          <TouchableOpacity 
            style={styles.iosPickerBackdrop}
            activeOpacity={1}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowStartTimePicker(false);
            }}
          />
          <View style={styles.iosPickerContainer}>
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity onPress={confirmTimePicker}>
                <Text style={styles.iosPickerDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempStartDate}
              mode="time"
              display="spinner"
              onChange={handleStartTimeChange}
              is24Hour={true}
              style={styles.iosPicker}
            />
          </View>
        </View>
      )}

      {Platform.OS === 'android' && showStartTimePicker && (
        <DateTimePicker
          value={tempStartDate}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
          is24Hour={true}
        />
      )}

      {Platform.OS === 'web' && showStartDatePicker && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowStartDatePicker(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Date</Text>
            <View style={{ padding: 20 }}>
              <TextInput
                style={[styles.modalInput, { fontSize: 16 }]}
                value={tempStartDate.toISOString().split('T')[0]}
                onChangeText={(text) => {
                  const date = new Date(text);
                  if (!isNaN(date.getTime())) {
                    const newStart = new Date(date);
                    newStart.setHours(tempStartDate.getHours(), tempStartDate.getMinutes(), 0, 0);
                    handleStartDateChange({} as DateTimePickerEvent, newStart);
                  }
                }}
                placeholder="YYYY-MM-DD"
              />
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={() => setShowStartDatePicker(false)}
              >
                <Text style={styles.modalSaveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {Platform.OS === 'web' && showStartTimePicker && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowStartTimePicker(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Time</Text>
            <View style={{ padding: 20 }}>
              <TextInput
                style={[styles.modalInput, { fontSize: 16 }]}
                value={`${String(tempStartDate.getHours()).padStart(2, '0')}:${String(tempStartDate.getMinutes()).padStart(2, '0')}`}
                onChangeText={(text) => {
                  const [hours, minutes] = text.split(':').map(Number);
                  if (!isNaN(hours) && !isNaN(minutes)) {
                    const newStart = new Date(tempStartDate);
                    newStart.setHours(hours, minutes, 0, 0);
                    handleStartTimeChange({} as DateTimePickerEvent, newStart);
                  }
                }}
                placeholder="HH:MM"
              />
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={() => setShowStartTimePicker(false)}
              >
                <Text style={styles.modalSaveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      </View>
    </KeyboardAvoidingView>
  );
}



interface CategoryPickerModalProps {
  visible: boolean;
  categories: Record<TaskCategory, { emoji: string; color: string; label: string }>;
  selected: TaskCategory;
  onClose: () => void;
  onSelect: (value: TaskCategory) => void;
}

function CategoryPickerModal({ visible, categories, selected, onClose, onSelect }: CategoryPickerModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.modalContent}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>Category</Text>
        <View style={styles.pickerList}>
          {(Object.keys(categories) as TaskCategory[]).map((cat) => {
            const meta = categories[cat];
            const isSelected = selected === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  onSelect(cat);
                }}
              >
                <Text style={styles.pickerEmoji}>{meta.emoji}</Text>
                <Text style={styles.pickerLabel}>{meta.label}</Text>
                {isSelected && (
                  <Check size={20} color="#3B82F6" strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

interface SimplePickerProps {
  visible: boolean;
  title: string;
  options: { label: string; value: string; color?: string }[];
  selected: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}

function SimplePicker({ visible, title, options, selected, onClose, onSelect }: SimplePickerProps) {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.modalContent}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>{title}</Text>
        <View style={styles.pickerList}>
          {options.map((option) => {
            const isSelected = selected === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.pickerLabel,
                    option.color && { color: option.color },
                  ]}
                >
                  {option.label}
                </Text>
                {isSelected && (
                  <Check size={20} color="#3B82F6" strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

interface AssignedToPickerModalProps {
  visible: boolean;
  members: { id: string; name: string; color: string }[];
  selected: string[];
  onClose: () => void;
  onSave: (memberIds: string[]) => void;
}

function AssignedToPickerModal({ visible, members, selected, onClose, onSave }: AssignedToPickerModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(selected);

  useEffect(() => {
    if (visible) {
      setSelectedIds(selected);
    }
  }, [visible, selected]);

  if (!visible) return null;

  const toggleMember = (memberId: string) => {
    if (selectedIds.includes(memberId)) {
      setSelectedIds(selectedIds.filter((id) => id !== memberId));
    } else {
      setSelectedIds([...selectedIds, memberId]);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.modalContent}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>Assigned To</Text>
        <View style={styles.pickerList}>
          {members.map((member) => {
            const isSelected = selectedIds.includes(member.id);
            return (
              <TouchableOpacity
                key={member.id}
                style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
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
                <Text style={styles.pickerLabel}>{member.name}</Text>
                {isSelected && (
                  <Check size={20} color="#3B82F6" strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          style={styles.modalSaveButton}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            onSave(selectedIds);
          }}
        >
          <Text style={styles.modalSaveButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface TextInputModalProps {
  visible: boolean;
  title: string;
  value: string;
  placeholder: string;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  onClose: () => void;
  onSave: (value: string) => void;
}

function TextInputModal({ visible, title, value, placeholder, keyboardType = 'default', onClose, onSave }: TextInputModalProps) {
  const [text, setText] = useState(value);

  useEffect(() => {
    if (visible) {
      setText(value);
    }
  }, [visible, value]);

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.modalContent}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>{title}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.modalInput}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType={keyboardType}
            autoFocus
          />
        </View>
        <TouchableOpacity
          style={styles.modalSaveButton}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            onSave(text);
            onClose();
          }}
        >
          <Text style={styles.modalSaveButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface FundTargetPickerModalProps {
  visible: boolean;
  fundTargets: FundTargetOption[];
  selected: string | null;
  onClose: () => void;
  onSelect: (fundTargetId: string | null) => void;
}

function FundTargetPickerModal({ visible, fundTargets, selected, onClose, onSelect }: FundTargetPickerModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.modalContent}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>Link to Focus Goal</Text>
        <View style={styles.pickerList}>
          <TouchableOpacity
            style={[styles.pickerItem, selected === null && styles.pickerItemSelected]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onSelect(null);
            }}
          >
            <Text style={styles.pickerEmoji}>—</Text>
            <Text style={styles.pickerLabel}>None</Text>
            {selected === null && (
              <Check size={20} color="#3B82F6" strokeWidth={2.5} />
            )}
          </TouchableOpacity>
          {fundTargets.map((ft) => {
            const isSelected = selected === ft.id;
            return (
              <TouchableOpacity
                key={ft.id}
                style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  onSelect(ft.id);
                }}
              >
                <Text style={styles.pickerEmoji}>{ft.emoji}</Text>
                <Text style={styles.pickerLabel}>{ft.name}</Text>
                {isSelected && (
                  <Check size={20} color="#3B82F6" strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
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
  dateTimeSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  allDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  allDayContent: {
    gap: 2,
  },
  allDayLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#111827',
  },
  allDayHint: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  dateTimeValue: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#111827',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  metadataSection: {
    gap: 8,
    paddingHorizontal: 20,
  },
  metadataText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#EF4444',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 36,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  pickerList: {
    paddingHorizontal: 16,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  pickerItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  pickerEmoji: {
    fontSize: 20,
  },
  pickerLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#111827',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  inputContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalSaveButton: {
    marginHorizontal: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  iosPickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  iosPickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  iosPickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iosPickerDoneButton: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  iosPicker: {
    height: 200,
  },
});
