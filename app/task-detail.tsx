import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, ScrollView, TextInput, Switch } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  Flag, 
  Bell, 
  RefreshCw, 
  Trash2, 
  CheckCircle2,
  ChevronRight,
  Tag,
  DollarSign,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { FundTargetOption } from '@/components/TaskFormModal';
import { MOCK_FUND_TARGETS } from '@/mocks/data';
import { TaskCategory, TaskPriority, ReminderType, RecurrenceType } from '@/types';
import { EUDateFormatter } from '@/utils/EULocale';

interface EditableFieldProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  onPress: () => void;
  multiline?: boolean;
}

function EditableField({ label, value, icon, onPress, multiline }: EditableFieldProps) {
  return (
    <TouchableOpacity
      style={styles.editableField}
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
    >
      <View style={styles.fieldIcon}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={[styles.fieldValue, multiline && styles.fieldValueMultiline]} numberOfLines={multiline ? 3 : 1}>
          {value}
        </Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

interface InlineTextEditorProps {
  visible: boolean;
  title: string;
  value: string;
  onClose: () => void;
  onSave: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
}

function InlineTextEditor({ visible, title, value, onClose, onSave, multiline, placeholder }: InlineTextEditorProps) {
  const [text, setText] = useState(value);

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.inlineEditorContainer}>
        <View style={styles.inlineEditorHeader}>
          <Text style={styles.inlineEditorTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.inlineEditorInput, multiline && styles.inlineEditorInputMultiline]}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline={multiline}
          autoFocus
        />
        <TouchableOpacity
          style={styles.inlineEditorButton}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            onSave(text);
            onClose();
          }}
        >
          <Text style={styles.inlineEditorButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: { label: string; value: string; color?: string }[];
  selected: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}

function PickerModal({ visible, title, options, selected, onClose, onSelect }: PickerModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.pickerScroll}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.pickerOption,
                selected === option.value && styles.pickerOptionSelected,
              ]}
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
                  styles.pickerOptionText,
                  option.color && { color: option.color },
                ]}
              >
                {option.label}
              </Text>
              {selected === option.value && (
                <CheckCircle2 size={20} color="#3B82F6" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

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
      .filter(ft => ft.listId === currentList.id)
      .map(ft => ({
        id: ft.id,
        name: ft.name,
        emoji: ft.emoji,
      }));
  }, [currentList]);

  const [showTitleEditor, setShowTitleEditor] = useState(false);
  const [showDescriptionEditor, setShowDescriptionEditor] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showRecurrencePicker, setShowRecurrencePicker] = useState(false);
  const [showAssignedToPicker, setShowAssignedToPicker] = useState(false);
  const [showStakeEditor, setShowStakeEditor] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [editingDateTime, setEditingDateTime] = useState<{ startDate: Date; endDate: Date; allDay: boolean }>(() => {
    const now = new Date();
    const later = new Date(now.getTime() + 3600000);
    return {
      startDate: now,
      endDate: later,
      allDay: false,
    };
  });

  const formatDate = useCallback((date: Date) => {
    return EUDateFormatter.formatDate(date, 'long');
  }, []);

  const formatTime = useCallback((date: Date) => {
    return EUDateFormatter.formatTime(date);
  }, []);

  const handleUpdateField = useCallback((field: string, value: any) => {
    if (!task) return;
    console.log('[TaskDetail] Updating field:', field, value);
    updateTask(task.id, { [field]: value });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [task, updateTask]);

  const handleCompleteTask = useCallback(() => {
    if (!task) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    completeTask(task.id);
    router.back();
  }, [task, completeTask, router]);

  const statusColor = useMemo(() => {
    if (!task) return '#6B7280';
    switch (task.status) {
      case 'completed':
        return '#10B981';
      case 'overdue':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  }, [task]);

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

  const categoryMeta = currentList.categories[task.category];
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
  const endDate = new Date(task.endAt);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.back();
          }}
        >
          <X size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {}}
        >
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </Text>
          </View>
          {task.status !== 'completed' && task.status !== 'failed' && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteTask}
            >
              <CheckCircle2 size={20} color="#10B981" />
              <Text style={styles.completeButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.titleContainer}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowTitleEditor(true);
            }}
          >
            <Text style={styles.taskTitle}>{task.title}</Text>
          </TouchableOpacity>
          {task.description && (
            <TouchableOpacity
              style={styles.descriptionContainer}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowDescriptionEditor(true);
              }}
            >
              <Text style={styles.taskDescription}>{task.description}</Text>
            </TouchableOpacity>
          )}
          {!task.description && (
            <TouchableOpacity
              style={styles.addDescriptionButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowDescriptionEditor(true);
              }}
            >
              <Text style={styles.addDescriptionText}>+ Add description</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <EditableField
            label="Category"
            value={`${categoryMeta.emoji} ${categoryMeta.label}`}
            icon={<Tag size={20} color={categoryMeta.color} />}
            onPress={() => setShowCategoryPicker(true)}
          />

          <TouchableOpacity
            style={styles.dateTimeField}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setEditingDateTime({
                startDate: new Date(task.startAt),
                endDate: new Date(task.endAt),
                allDay: task.allDay || false,
              });
              setShowDateTimePicker(true);
            }}
          >
            <View style={styles.fieldRowLeft}>
              <View style={styles.fieldIcon}>
                <Calendar size={20} color="#6B7280" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Date & Time</Text>
                <Text style={styles.dateTimePreview}>
                  {task.allDay ? 'All Day' : formatTime(startDate)}
                </Text>
                <Text style={styles.dateValue}>
                  {formatDate(startDate)}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <EditableField
            label="Assigned To"
            value={assignedMembers.map((m) => m.name).join(', ') || 'Unassigned'}
            icon={<Users size={20} color="#6B7280" />}
            onPress={() => setShowAssignedToPicker(true)}
          />

          <EditableField
            label="Stake"
            value={`${currentList.currencySymbol}${task.stake}`}
            icon={<DollarSign size={20} color="#6B7280" />}
            onPress={() => setShowStakeEditor(true)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <EditableField
            label="Priority"
            value={priorityConfig[task.priority || 'medium'].label}
            icon={<Flag size={20} color={priorityConfig[task.priority || 'medium'].color} />}
            onPress={() => setShowPriorityPicker(true)}
          />

          <EditableField
            label="Reminder"
            value={reminderConfig[task.reminder || 'none'].label}
            icon={<Bell size={20} color="#6B7280" />}
            onPress={() => setShowReminderPicker(true)}
          />

          <EditableField
            label="Recurrence"
            value={recurrenceConfig[task.recurrence || 'none'].label}
            icon={<RefreshCw size={20} color="#6B7280" />}
            onPress={() => setShowRecurrencePicker(true)}
          />
        </View>

        {task.fundTargetId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fund Target</Text>
            <View style={styles.fundTargetCard}>
              <Text style={styles.fundTargetEmoji}>
                {fundTargets.find((f) => f.id === task.fundTargetId)?.emoji || '🎯'}
              </Text>
              <Text style={styles.fundTargetName}>
                {fundTargets.find((f) => f.id === task.fundTargetId)?.name || 'Unknown'}
              </Text>
            </View>
          </View>
        )}

        {task.createdAt && (
          <View style={styles.metadataSection}>
            <Text style={styles.metadataText}>
              Created: {EUDateFormatter.formatDate(new Date(task.createdAt), 'long')}
            </Text>
            {task.completedAt && (
              <Text style={styles.metadataText}>
                Completed: {EUDateFormatter.formatDate(new Date(task.completedAt), 'long')}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <InlineTextEditor
        visible={showTitleEditor}
        title="Edit Title"
        value={task.title}
        onClose={() => setShowTitleEditor(false)}
        onSave={(value) => handleUpdateField('title', value)}
        placeholder="Task title"
      />

      <InlineTextEditor
        visible={showDescriptionEditor}
        title="Edit Description"
        value={task.description || ''}
        onClose={() => setShowDescriptionEditor(false)}
        onSave={(value) => handleUpdateField('description', value)}
        placeholder="Add description..."
        multiline
      />

      <PickerModal
        visible={showCategoryPicker}
        title="Select Category"
        options={Object.keys(currentList.categories).map((key) => ({
          label: `${currentList.categories[key as TaskCategory].emoji} ${currentList.categories[key as TaskCategory].label}`,
          value: key,
        }))}
        selected={task.category}
        onClose={() => setShowCategoryPicker(false)}
        onSelect={(value) => handleUpdateField('category', value)}
      />

      <PickerModal
        visible={showPriorityPicker}
        title="Select Priority"
        options={Object.keys(priorityConfig).map((key) => ({
          label: priorityConfig[key as TaskPriority].label,
          value: key,
          color: priorityConfig[key as TaskPriority].color,
        }))}
        selected={task.priority || 'medium'}
        onClose={() => setShowPriorityPicker(false)}
        onSelect={(value) => handleUpdateField('priority', value)}
      />

      <PickerModal
        visible={showReminderPicker}
        title="Select Reminder"
        options={Object.keys(reminderConfig).map((key) => ({
          label: reminderConfig[key as ReminderType].label,
          value: key,
        }))}
        selected={task.reminder || 'none'}
        onClose={() => setShowReminderPicker(false)}
        onSelect={(value) => handleUpdateField('reminder', value)}
      />

      <PickerModal
        visible={showRecurrencePicker}
        title="Select Recurrence"
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

      <InlineTextEditor
        visible={showStakeEditor}
        title="Edit Stake"
        value={task.stake.toString()}
        onClose={() => setShowStakeEditor(false)}
        onSave={(value) => {
          const numValue = parseFloat(value);
          if (!isNaN(numValue) && numValue >= 0) {
            handleUpdateField('stake', numValue);
          }
        }}
        placeholder="0.00"
      />

      <DateTimePickerModal
        visible={showDateTimePicker}
        startDate={editingDateTime.startDate}
        endDate={editingDateTime.endDate}
        allDay={editingDateTime.allDay}
        onClose={() => setShowDateTimePicker(false)}
        onSave={(start, end, allDay) => {
          if (!task) return;
          console.log('[TaskDetail] Updating date/time:', {
            startAt: start.toISOString(),
            endAt: end.toISOString(),
            allDay
          });
          updateTask(task.id, {
            startAt: start.toISOString(),
            endAt: end.toISOString(),
            allDay
          });
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          setShowDateTimePicker(false);
        }}
      />

      {Platform.OS === 'ios' && showStartDatePicker && (
        <View style={styles.iosPickerOverlay}>
          <TouchableOpacity 
            style={styles.iosPickerBackdrop}
            activeOpacity={1}
            onPress={() => setShowStartDatePicker(false)}
          />
          <View style={styles.iosPickerContainer}>
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                <Text style={styles.iosPickerDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={editingDateTime.startDate}
              mode="date"
              display="spinner"
              onChange={(_event: DateTimePickerEvent, date?: Date) => {
                if (date) {
                  const newStart = new Date(date);
                  newStart.setHours(editingDateTime.startDate.getHours(), editingDateTime.startDate.getMinutes(), 0, 0);
                  setEditingDateTime(prev => ({ ...prev, startDate: newStart }));
                }
              }}
              style={styles.iosPicker}
            />
          </View>
        </View>
      )}

      {Platform.OS === 'android' && showStartDatePicker && (
        <DateTimePicker
          value={editingDateTime.startDate}
          mode="date"
          display="default"
          onChange={(_event: DateTimePickerEvent, date?: Date) => {
            setShowStartDatePicker(false);
            if (date) {
              const newStart = new Date(date);
              newStart.setHours(editingDateTime.startDate.getHours(), editingDateTime.startDate.getMinutes(), 0, 0);
              setEditingDateTime(prev => ({ ...prev, startDate: newStart }));
            }
          }}
        />
      )}

      {Platform.OS === 'ios' && showStartTimePicker && (
        <View style={styles.iosPickerOverlay}>
          <TouchableOpacity 
            style={styles.iosPickerBackdrop}
            activeOpacity={1}
            onPress={() => setShowStartTimePicker(false)}
          />
          <View style={styles.iosPickerContainer}>
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                <Text style={styles.iosPickerDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={editingDateTime.startDate}
              mode="time"
              display="spinner"
              onChange={(_event: DateTimePickerEvent, date?: Date) => {
                if (date) {
                  const newStart = new Date(editingDateTime.startDate);
                  newStart.setHours(date.getHours(), date.getMinutes(), 0, 0);
                  setEditingDateTime(prev => ({ ...prev, startDate: newStart }));
                }
              }}
              is24Hour={true}
              style={styles.iosPicker}
            />
          </View>
        </View>
      )}

      {Platform.OS === 'android' && showStartTimePicker && (
        <DateTimePicker
          value={editingDateTime.startDate}
          mode="time"
          display="default"
          onChange={(_event: DateTimePickerEvent, date?: Date) => {
            setShowStartTimePicker(false);
            if (date) {
              const newStart = new Date(editingDateTime.startDate);
              newStart.setHours(date.getHours(), date.getMinutes(), 0, 0);
              setEditingDateTime(prev => ({ ...prev, startDate: newStart }));
            }
          }}
          is24Hour={true}
        />
      )}
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
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>Assign To</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.pickerScroll}>
          {members.map((member) => {
            const isSelected = selectedIds.includes(member.id);
            return (
              <TouchableOpacity
                key={member.id}
                style={[styles.pickerOption, isSelected && styles.pickerOptionSelected]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  toggleMember(member.id);
                }}
              >
                <View style={styles.memberRow}>
                  <View style={[styles.memberBadge, { backgroundColor: member.color }]} />
                  <Text style={styles.pickerOptionText}>{member.name}</Text>
                </View>
                {isSelected && <CheckCircle2 size={20} color="#3B82F6" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.pickerFooter}>
          <TouchableOpacity
            style={styles.pickerSaveButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              onSave(selectedIds);
            }}
          >
            <Text style={styles.pickerSaveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface DateTimePickerModalProps {
  visible: boolean;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  onClose: () => void;
  onSave: (start: Date, end: Date, allDay: boolean) => void;
}

function DateTimePickerModal({ visible, startDate, endDate, allDay, onClose, onSave }: DateTimePickerModalProps) {
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);
  const [isAllDay, setIsAllDay] = useState(allDay);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [showPickerType, setShowPickerType] = useState<'start-date' | 'start-time' | null>(null);

  useEffect(() => {
    if (visible) {
      setStart(startDate);
      setEnd(endDate);
      setIsAllDay(allDay);
      setTempStartDate(startDate);
    }
  }, [visible, startDate, endDate, allDay]);

  if (!visible) return null;

  const formatDate = (date: Date) => {
    return EUDateFormatter.formatDate(date, 'long');
  };

  const formatTime = (date: Date) => {
    return EUDateFormatter.formatTime(date);
  };

  const handleStartDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPickerType(null);
      if (selectedDate) {
        const newStart = new Date(selectedDate);
        newStart.setHours(start.getHours(), start.getMinutes(), 0, 0);
        setStart(newStart);
        
        const duration = end.getTime() - start.getTime();
        if (duration > 0) {
          const newEnd = new Date(newStart.getTime() + duration);
          setEnd(newEnd);
        }
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleStartTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPickerType(null);
      if (selectedDate) {
        const newStart = new Date(start);
        newStart.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
        setStart(newStart);
        
        const newEnd = new Date(newStart);
        newEnd.setHours(newStart.getHours() + 1, newStart.getMinutes(), 0, 0);
        setEnd(newEnd);
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const setShowDatePickerIOS = (type: 'start-date' | 'start-time') => {
    setShowPickerType(type);
  };

  const setShowDatePickerAndroid = (type: 'start-date' | 'start-time') => {
    setShowPickerType(type);
  };

  const isValidDateRange = end > start;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.dateTimeContainer}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>Edit Date & Time</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.dateTimeScrollView} 
          contentContainerStyle={styles.dateTimeContent}
        >
          <View style={styles.allDayRow}>
            <View style={styles.allDayContent}>
              <Text style={styles.dateTimeLabel}>Ganztägig</Text>
              <Text style={styles.allDayHint}>Keine bestimmte Zeit</Text>
            </View>
            <Switch
              value={isAllDay}
              onValueChange={(value) => {
                setIsAllDay(value);
                if (value) {
                  const newStart = new Date(start);
                  newStart.setHours(0, 0, 0, 0);
                  const newEnd = new Date(start);
                  newEnd.setHours(23, 59, 59, 999);
                  setStart(newStart);
                  setEnd(newEnd);
                }
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={isAllDay ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setTempStartDate(start);
                if (Platform.OS === 'ios') {
                  setShowDatePickerIOS('start-date');
                } else {
                  setShowDatePickerAndroid('start-date');
                }
              }}
            >
              <Calendar size={18} color="#6B7280" />
              <Text style={styles.dateTimeValue}>{formatDate(start)}</Text>
            </TouchableOpacity>

            {!isAllDay && (
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setTempStartDate(start);
                  if (Platform.OS === 'ios') {
                    setShowDatePickerIOS('start-time');
                  } else {
                    setShowDatePickerAndroid('start-time');
                  }
                }}
              >
                <Clock size={18} color="#6B7280" />
                <Text style={styles.dateTimeValue}>{formatTime(start)}</Text>
              </TouchableOpacity>
            )}
          </View>

          {!isValidDateRange && (
            <View style={styles.errorMessage}>
              <Text style={styles.errorMessageText}>End time must be after start time</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.pickerFooter}>
          <TouchableOpacity
            style={[styles.pickerSaveButton, !isValidDateRange && styles.pickerSaveButtonDisabled]}
            onPress={() => {
              if (!isValidDateRange) return;
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              onSave(start, end, isAllDay);
            }}
            disabled={!isValidDateRange}
          >
            <Text style={styles.pickerSaveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {Platform.OS === 'ios' && showPickerType === 'start-date' && (
        <View style={styles.iosPickerOverlay}>
          <TouchableOpacity 
            style={styles.iosPickerBackdrop}
            activeOpacity={1}
            onPress={() => {
              const newStart = new Date(tempStartDate);
              newStart.setHours(start.getHours(), start.getMinutes(), 0, 0);
              setStart(newStart);
              
              const duration = end.getTime() - start.getTime();
              if (duration > 0) {
                const newEnd = new Date(newStart.getTime() + duration);
                setEnd(newEnd);
              }
              setShowPickerType(null);
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          />
          <View style={styles.iosPickerContainer}>
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity onPress={() => {
                const newStart = new Date(tempStartDate);
                newStart.setHours(start.getHours(), start.getMinutes(), 0, 0);
                setStart(newStart);
                
                const duration = end.getTime() - start.getTime();
                if (duration > 0) {
                  const newEnd = new Date(newStart.getTime() + duration);
                  setEnd(newEnd);
                }
                setShowPickerType(null);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}>
                <Text style={styles.iosPickerDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempStartDate}
              mode="date"
              display="spinner"
              onChange={(_event: DateTimePickerEvent, date?: Date) => {
                if (date) {
                  setTempStartDate(date);
                }
              }}
              style={styles.iosPicker}
            />
          </View>
        </View>
      )}

      {Platform.OS === 'android' && showPickerType === 'start-date' && (
        <DateTimePicker
          value={start}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {Platform.OS === 'ios' && showPickerType === 'start-time' && (
        <View style={styles.iosPickerOverlay}>
          <TouchableOpacity 
            style={styles.iosPickerBackdrop}
            activeOpacity={1}
            onPress={() => {
              const newStart = new Date(start);
              newStart.setHours(tempStartDate.getHours(), tempStartDate.getMinutes(), 0, 0);
              setStart(newStart);
              
              const newEnd = new Date(newStart);
              newEnd.setHours(newStart.getHours() + 1, newStart.getMinutes(), 0, 0);
              setEnd(newEnd);
              
              setShowPickerType(null);
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          />
          <View style={styles.iosPickerContainer}>
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity onPress={() => {
                const newStart = new Date(start);
                newStart.setHours(tempStartDate.getHours(), tempStartDate.getMinutes(), 0, 0);
                setStart(newStart);
                
                const newEnd = new Date(newStart);
                newEnd.setHours(newStart.getHours() + 1, newStart.getMinutes(), 0, 0);
                setEnd(newEnd);
                
                setShowPickerType(null);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}>
                <Text style={styles.iosPickerDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempStartDate}
              mode="time"
              display="spinner"
              onChange={(_event: DateTimePickerEvent, date?: Date) => {
                if (date) {
                  setTempStartDate(date);
                }
              }}
              is24Hour={true}
              style={styles.iosPicker}
            />
          </View>
        </View>
      )}

      {Platform.OS === 'android' && showPickerType === 'start-time' && (
        <DateTimePicker
          value={start}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
          is24Hour={true}
        />
      )}


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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    lineHeight: 32,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  taskDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  addDescriptionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  addDescriptionText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  editableField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  fieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldContent: {
    flex: 1,
    gap: 4,
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
  fieldValueMultiline: {
    lineHeight: 22,
  },
  fieldRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  fundTargetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  fundTargetEmoji: {
    fontSize: 32,
  },
  fundTargetName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
  },
  metadataSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inlineEditorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  inlineEditorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inlineEditorTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  inlineEditorInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  inlineEditorInputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inlineEditorButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  inlineEditorButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  pickerScroll: {
    maxHeight: 400,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#111827',
  },
  pickerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pickerSaveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pickerSaveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  pickerSaveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dateTimeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  dateTimeScrollView: {
    maxHeight: 500,
  },
  dateTimeContent: {
    padding: 20,
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
  dateTimeLabel: {
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
  dateTimeField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dateTimePreview: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#111827',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: '#6B7280',
    marginTop: 2,
  },
  errorMessage: {
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginTop: 8,
  },
  errorMessageText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
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
