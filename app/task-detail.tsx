import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform, 
  ScrollView, 
  TextInput,
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
  Trash2, 
  CheckCircle2,
  DollarSign,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { FundTargetOption } from '@/components/TaskFormModal';
import { DateTimePickerModal } from '@/components/DateTimePicker';
import { MOCK_FUND_TARGETS } from '@/mocks/data';
import { TaskCategory, TaskPriority, ReminderType, RecurrenceType } from '@/types';
import { EUDateFormatter } from '@/utils/EULocale';

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
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showRecurrencePicker, setShowRecurrencePicker] = useState(false);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task?.title || '');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task?.description || '');

  const [pickerDate, setPickerDate] = useState<Date>(new Date());
  const [pickerAllDay, setPickerAllDay] = useState(false);

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
      setIsEditingTitle(false);
    }
  }, [editedTitle, handleUpdateField]);

  const handleSaveDescription = useCallback(() => {
    handleUpdateField('description', editedDescription.trim());
    setIsEditingDescription(false);
  }, [editedDescription, handleUpdateField]);

  const handleCompleteTask = useCallback(() => {
    if (!task) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    completeTask(task.id);
    router.back();
  }, [task, completeTask, router]);

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

  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) return 'Invalid Date';
    return EUDateFormatter.formatDate(date, 'long');
  };

  const formatTime = (date: Date) => {
    if (!date || isNaN(date.getTime())) return 'Invalid Time';
    return EUDateFormatter.formatTime(date);
  };

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
          <X size={22} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {}}
        >
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {fundTargets && fundTargets.length > 0 && task.fundTargetId && (
          <TouchableOpacity
            style={styles.focusGoalCard}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowFundTargetPicker(true);
            }}
          >
            <View style={styles.focusGoalHeader}>
              <Sparkles size={14} color="#8B5CF6" />
              <Text style={styles.focusGoalLabel}>FOCUS GOAL</Text>
            </View>
            <View style={styles.focusGoalContent}>
              <Text style={styles.focusGoalEmoji}>
                {fundTargets.find((f) => f.id === task.fundTargetId)?.emoji || '🎯'}
              </Text>
              <View style={styles.focusGoalTextContainer}>
                <Text style={styles.focusGoalName}>
                  {fundTargets.find((f) => f.id === task.fundTargetId)?.name || 'Unknown'}
                </Text>
                <Text style={styles.focusGoalStake}>
                  {currentList.currencySymbol}{task.stake} at stake
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.mainSection}>
          {isEditingTitle ? (
            <TextInput
              style={styles.titleInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
              onBlur={handleSaveTitle}
              autoFocus
              multiline
              placeholder="Task title..."
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <TouchableOpacity
              onPress={() => {
                setEditedTitle(task.title);
                setIsEditingTitle(true);
              }}
            >
              <Text style={styles.title}>{task.title}</Text>
            </TouchableOpacity>
          )}

          {isEditingDescription ? (
            <TextInput
              style={styles.descriptionInput}
              value={editedDescription}
              onChangeText={setEditedDescription}
              onBlur={handleSaveDescription}
              autoFocus
              multiline
              placeholder="Add description..."
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <TouchableOpacity
              onPress={() => {
                setEditedDescription(task.description || '');
                setIsEditingDescription(true);
              }}
            >
              {task.description ? (
                <Text style={styles.description}>{task.description}</Text>
              ) : (
                <Text style={styles.descriptionPlaceholder}>Add description...</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.propertiesGrid}>
          <PropertyCard
            icon={<Calendar size={18} color="#6B7280" />}
            label="Date"
            value={task.allDay ? formatDate(startDate) : `${formatDate(startDate)} • ${formatTime(startDate)}`}
            onPress={() => {
              const validStart = new Date(task.startAt);
              if (isNaN(validStart.getTime())) {
                console.warn('[TaskDetail] Invalid startAt, using now');
                setPickerDate(new Date());
              } else {
                setPickerDate(validStart);
              }
              setPickerAllDay(task.allDay || false);
              setShowDateTimePicker(true);
            }}
          />

          <PropertyCard
            icon={<Flag size={18} color={priorityConfig[task.priority || 'medium'].color} />}
            label="Priority"
            value={priorityConfig[task.priority || 'medium'].label}
            valueColor={priorityConfig[task.priority || 'medium'].color}
            onPress={() => setShowPriorityPicker(true)}
          />

          <PropertyCard
            icon={<Text style={styles.propertyEmoji}>{categoryMeta.emoji}</Text>}
            label="Category"
            value={categoryMeta.label}
            onPress={() => setShowCategoryPicker(true)}
          />

          <PropertyCard
            icon={<Users size={18} color="#6B7280" />}
            label="Assigned"
            value={assignedMembers.map((m) => m.name).join(', ') || 'Unassigned'}
            onPress={() => setShowAssignedToPicker(true)}
          />

          <PropertyCard
            icon={<DollarSign size={18} color="#6B7280" />}
            label="Stake"
            value={`${currentList.currencySymbol}${task.stake}`}
            onPress={() => setShowStakeInput(true)}
          />

          <PropertyCard
            icon={<Bell size={18} color="#6B7280" />}
            label="Reminder"
            value={reminderConfig[task.reminder || 'none'].label}
            onPress={() => setShowReminderPicker(true)}
          />

          <PropertyCard
            icon={<RefreshCw size={18} color="#6B7280" />}
            label="Repeat"
            value={recurrenceConfig[task.recurrence || 'none'].label}
            onPress={() => setShowRecurrencePicker(true)}
          />

          {!task.fundTargetId && fundTargets.length > 0 && (
            <PropertyCard
              icon={<Sparkles size={18} color="#8B5CF6" />}
              label="Link to Goal"
              value="None"
              onPress={() => setShowFundTargetPicker(true)}
            />
          )}
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

      <DateTimePickerModal
        visible={showDateTimePicker}
        initialDate={pickerDate}
        allDay={pickerAllDay}
        title="Set Due Date"
        onClose={() => setShowDateTimePicker(false)}
        onSave={(date, allDay) => {
          if (!task) return;
          
          const startDate = new Date(date);
          const endDate = new Date(date);
          
          if (allDay) {
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
          } else {
            endDate.setHours(startDate.getHours() + 1, startDate.getMinutes(), 0, 0);
          }
          
          console.log('[TaskDetail] Saving dates - Start:', startDate.toISOString(), 'End:', endDate.toISOString());
          
          updateTask(task.id, {
            startAt: startDate.toISOString(),
            endAt: endDate.toISOString(),
            allDay
          });
          
          setShowDateTimePicker(false);
        }}
      />
    </View>
  );
}

interface PropertyCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  onPress: () => void;
}

function PropertyCard({ icon, label, value, valueColor, onPress }: PropertyCardProps) {
  return (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
    >
      <View style={styles.propertyIconContainer}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.propertyContent}>
        <Text style={styles.propertyLabel}>{label}</Text>
        <Text style={[styles.propertyValue, valueColor && { color: valueColor }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <ArrowRight size={16} color="#D1D5DB" />
    </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  focusGoalCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  focusGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  focusGoalLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#8B5CF6',
    letterSpacing: 1,
  },
  focusGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  focusGoalEmoji: {
    fontSize: 32,
  },
  focusGoalTextContainer: {
    flex: 1,
  },
  focusGoalName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  focusGoalStake: {
    fontSize: 14,
    color: '#6B7280',
  },
  mainSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    lineHeight: 36,
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    lineHeight: 36,
    marginBottom: 12,
    padding: 0,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    padding: 0,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  descriptionPlaceholder: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  propertiesGrid: {
    gap: 8,
    marginBottom: 24,
  },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  propertyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyEmoji: {
    fontSize: 18,
  },
  propertyContent: {
    flex: 1,
    gap: 2,
  },
  propertyLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#9CA3AF',
  },
  propertyValue: {
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
    marginBottom: 24,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  metadataSection: {
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

});
