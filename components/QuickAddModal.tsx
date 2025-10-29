import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { X, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TaskCategory } from '@/types';

interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: QuickTaskData) => void;
  categories: Record<TaskCategory, { emoji: string; color: string; label: string }>;
}

export interface QuickTaskData {
  title: string;
  category?: TaskCategory;
  dueDate?: Date;
  stake?: number;
}

const DATE_PATTERNS = [
  { pattern: /\b(today|heute)\b/i, fn: () => new Date() },
  { 
    pattern: /\b(tomorrow|morgen)\b/i, 
    fn: () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date;
    }
  },
  {
    pattern: /\b(monday|montag)\b/i,
    fn: () => getNextWeekday(1),
  },
  {
    pattern: /\b(tuesday|dienstag)\b/i,
    fn: () => getNextWeekday(2),
  },
  {
    pattern: /\b(wednesday|mittwoch)\b/i,
    fn: () => getNextWeekday(3),
  },
  {
    pattern: /\b(thursday|donnerstag)\b/i,
    fn: () => getNextWeekday(4),
  },
  {
    pattern: /\b(friday|freitag)\b/i,
    fn: () => getNextWeekday(5),
  },
  {
    pattern: /\b(saturday|samstag)\b/i,
    fn: () => getNextWeekday(6),
  },
  {
    pattern: /\b(sunday|sonntag)\b/i,
    fn: () => getNextWeekday(0),
  },
  {
    pattern: /\bin (\d+) days?\b/i,
    fn: (match: RegExpMatchArray) => {
      const days = parseInt(match[1], 10);
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
    },
  },
  {
    pattern: /\bnext week\b/i,
    fn: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
  },
  {
    pattern: /\b(\d{1,2})\/(\d{1,2})\b/,
    fn: (match: RegExpMatchArray) => {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const date = new Date();
      date.setMonth(month);
      date.setDate(day);
      if (date < new Date()) {
        date.setFullYear(date.getFullYear() + 1);
      }
      return date;
    },
  },
];

const TIME_PATTERNS = [
  {
    pattern: /\bat (\d{1,2}):(\d{2})\b/i,
    fn: (match: RegExpMatchArray, date: Date) => {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      date.setHours(hours, minutes, 0, 0);
      return date;
    },
  },
  {
    pattern: /\bat (\d{1,2})(am|pm)\b/i,
    fn: (match: RegExpMatchArray, date: Date) => {
      let hours = parseInt(match[1], 10);
      if (match[2].toLowerCase() === 'pm' && hours !== 12) {
        hours += 12;
      } else if (match[2].toLowerCase() === 'am' && hours === 12) {
        hours = 0;
      }
      date.setHours(hours, 0, 0, 0);
      return date;
    },
  },
];

const CATEGORY_KEYWORDS: Record<TaskCategory, string[]> = {
  Household: ['clean', 'cook', 'laundry', 'wash', 'dishes', 'vacuum', 'tidy', 'organize', 'home'],
  Finance: ['pay', 'bill', 'invoice', 'budget', 'expense', 'money', 'bank', 'transfer', 'buy'],
  Work: ['meeting', 'call', 'email', 'report', 'project', 'deadline', 'task', 'client', 'presentation'],
  Leisure: ['gym', 'exercise', 'workout', 'run', 'read', 'watch', 'play', 'hobby', 'relax'],
};

const STAKE_PATTERN = /\$(\d+(?:\.\d{2})?)/;

function getNextWeekday(targetDay: number): Date {
  const date = new Date();
  const currentDay = date.getDay();
  let daysToAdd = targetDay - currentDay;
  
  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }
  
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

function parseSmartInput(input: string): { 
  title: string; 
  dueDate?: Date; 
  category?: TaskCategory;
  stake?: number;
} {
  let title = input;
  let dueDate: Date | undefined;
  let category: TaskCategory | undefined;
  let stake: number | undefined;

  for (const { pattern, fn } of DATE_PATTERNS) {
    const match = input.match(pattern);
    if (match) {
      dueDate = fn(match);
      title = title.replace(pattern, '').trim();
      break;
    }
  }

  if (dueDate) {
    for (const { pattern, fn } of TIME_PATTERNS) {
      const match = input.match(pattern);
      if (match) {
        dueDate = fn(match, dueDate);
        title = title.replace(pattern, '').trim();
        break;
      }
    }
  }

  const stakeMatch = input.match(STAKE_PATTERN);
  if (stakeMatch) {
    stake = parseFloat(stakeMatch[1]);
    title = title.replace(STAKE_PATTERN, '').trim();
  }

  const lowerInput = input.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerInput.includes(keyword))) {
      category = cat as TaskCategory;
      break;
    }
  }

  title = title.replace(/\s+/g, ' ').trim();

  return { title, dueDate, category, stake };
}

export function QuickAddModal({ visible, onClose, onSubmit, categories }: QuickAddModalProps) {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState<{ 
    title: string; 
    dueDate?: Date; 
    category?: TaskCategory;
    stake?: number;
  }>({ title: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
      setInput('');
      setParsedData({ title: '' });
      setShowSuggestions(false);
    }
  }, [visible, fadeAnim]);

  useEffect(() => {
    if (input.trim()) {
      const parsed = parseSmartInput(input);
      setParsedData(parsed);
      setShowSuggestions(parsed.dueDate !== undefined || parsed.category !== undefined || parsed.stake !== undefined);
    } else {
      setParsedData({ title: '' });
      setShowSuggestions(false);
    }
  }, [input]);

  const handleSubmit = useCallback(() => {
    if (!parsedData.title.trim()) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    onSubmit({
      title: parsedData.title,
      category: parsedData.category,
      dueDate: parsedData.dueDate,
      stake: parsedData.stake,
    });

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setInput('');
    setParsedData({ title: '' });
    onClose();
  }, [parsedData, onSubmit, onClose]);

  const formatDueDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (date.getHours() !== 0 || date.getMinutes() !== 0) {
      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `${weekday}, ${dateStr} at ${timeStr}`;
    }
    
    return `${weekday}, ${dateStr}`;
  };

  const suggestions = useMemo(() => {
    const items = [];
    
    if (parsedData.dueDate) {
      items.push({
        label: 'Due',
        value: formatDueDate(parsedData.dueDate),
        color: '#3B82F6',
      });
    }
    
    if (parsedData.category) {
      const categoryMeta = categories[parsedData.category];
      items.push({
        label: 'Category',
        value: `${categoryMeta.emoji} ${categoryMeta.label}`,
        color: categoryMeta.color,
      });
    }
    
    if (parsedData.stake) {
      items.push({
        label: 'Stake',
        value: `$${parsedData.stake.toFixed(2)}`,
        color: '#10B981',
      });
    }
    
    return items;
  }, [parsedData, categories]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
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
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Sparkles size={20} color="#3B82F6" />
              <Text style={styles.headerTitle}>Quick Add</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="e.g., Clean kitchen tomorrow at 2pm $5"
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={setInput}
              multiline
              autoFocus
              onSubmitEditing={handleSubmit}
              blurOnSubmit={false}
            />
          </View>

          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <View style={styles.suggestionsHeader}>
                <Sparkles size={14} color="#9CA3AF" />
                <Text style={styles.suggestionsTitle}>Smart parsing detected</Text>
              </View>
              <View style={styles.suggestionsList}>
                {suggestions.map((item, index) => (
                  <View key={index} style={styles.suggestionItem}>
                    <Text style={styles.suggestionLabel}>{item.label}</Text>
                    <Text style={[styles.suggestionValue, { color: item.color }]}>
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.examples}>
            <Text style={styles.examplesTitle}>Examples:</Text>
            <Text style={styles.exampleText}>• &quot;Pay bills tomorrow&quot;</Text>
            <Text style={styles.exampleText}>• &quot;Gym workout friday at 6pm&quot;</Text>
            <Text style={styles.exampleText}>• &quot;Clean kitchen today $5&quot;</Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !parsedData.title.trim() && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!parsedData.title.trim()}
            >
              <Text style={styles.submitButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  input: {
    fontSize: 16,
    color: '#111827',
    minHeight: 80,
    maxHeight: 150,
    textAlignVertical: 'top',
  },
  suggestionsContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  suggestionValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  examples: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  examplesTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
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
});
