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
  ScrollView,
} from 'react-native';
import { X, Sparkles, Calendar, MapPin, Users, Bell, Tag, Video, Repeat } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TaskCategory } from '@/types';
import { NLPTaskParser, ParsedTaskData } from '@/services/NLPTaskParser';

interface SmartQuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ParsedTaskData) => void;
  categories: Record<TaskCategory, { emoji: string; color: string; label: string }>;
}

export function SmartQuickAddModal({
  visible,
  onClose,
  onSubmit,
  categories,
}: SmartQuickAddModalProps) {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState<ParsedTaskData>({
    title: '',
    matchedTokens: [],
  });
  const [showCheatSheet, setShowCheatSheet] = useState(false);

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
      setParsedData({ title: '', matchedTokens: [] });
      setShowCheatSheet(false);
    }
  }, [visible, fadeAnim]);

  useEffect(() => {
    if (input.trim()) {
      const parsed = NLPTaskParser.parse(input);
      console.log('[NLP] Parsed:', parsed);
      setParsedData(parsed);
    } else {
      setParsedData({ title: '', matchedTokens: [] });
    }
  }, [input]);

  const handleSubmit = useCallback(() => {
    if (!parsedData.title.trim()) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    onSubmit(parsedData);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setInput('');
    setParsedData({ title: '', matchedTokens: [] });
    onClose();
  }, [parsedData, onSubmit, onClose]);

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) {
      return 'Heute';
    }
    if (isTomorrow) {
      return 'Morgen';
    }

    const weekday = date.toLocaleDateString('de-DE', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });

    if (parsedData.time && !parsedData.allDay) {
      return `${weekday}, ${dateStr} · ${parsedData.time}`;
    }

    return `${weekday}, ${dateStr}`;
  };

  const formatDateMemo = useCallback(formatDate, [parsedData.time, parsedData.allDay]);

  const previewItems = useMemo(() => {
    const items = [];

    if (parsedData.isTodo) {
      items.push({
        icon: 'check',
        label: 'Task',
        value: 'Aufgabe',
        color: '#8B5CF6',
      });
    }

    if (parsedData.date) {
      items.push({
        icon: 'calendar',
        label: parsedData.allDay ? 'Ganztags' : 'Termin',
        value: formatDateMemo(parsedData.date),
        color: '#3B82F6',
      });
    }

    if (parsedData.calendarKey) {
      items.push({
        icon: 'folder',
        label: 'Kalender',
        value: parsedData.calendarKey,
        color: '#F59E0B',
      });
    }

    if (parsedData.attendees && parsedData.attendees.length > 0) {
      items.push({
        icon: 'users',
        label: 'Mit',
        value: parsedData.attendees.join(', '),
        color: '#10B981',
      });
    }

    if (parsedData.location) {
      items.push({
        icon: 'map-pin',
        label: 'Ort',
        value: parsedData.location,
        color: '#EF4444',
      });
    }

    if (parsedData.videoCall) {
      const callLabels = { zoom: 'Zoom', meet: 'Google Meet', teams: 'Microsoft Teams' };
      items.push({
        icon: 'video',
        label: 'Video',
        value: callLabels[parsedData.videoCall],
        color: '#6366F1',
      });
    }

    if (parsedData.reminder !== undefined) {
      items.push({
        icon: 'bell',
        label: 'Erinnerung',
        value: `${parsedData.reminder} Min vorher`,
        color: '#EC4899',
      });
    }

    if (parsedData.priority) {
      const priorityLabels = { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' };
      const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#6B7280' };
      items.push({
        icon: 'flag',
        label: 'Priorität',
        value: priorityLabels[parsedData.priority],
        color: priorityColors[parsedData.priority],
      });
    }

    if (parsedData.stake !== undefined) {
      items.push({
        icon: 'euro',
        label: 'Einsatz',
        value: `€${parsedData.stake.toFixed(2)}`,
        color: '#10B981',
      });
    }

    if (parsedData.recurrence) {
      const recurrenceLabels = { daily: 'Täglich', weekly: 'Wöchentlich', monthly: 'Monatlich' };
      items.push({
        icon: 'repeat',
        label: 'Wiederholen',
        value: recurrenceLabels[parsedData.recurrence],
        color: '#8B5CF6',
      });
    }

    if (parsedData.tags && parsedData.tags.length > 0) {
      items.push({
        icon: 'tag',
        label: 'Tags',
        value: parsedData.tags.map((t) => `#${t}`).join(' '),
        color: '#14B8A6',
      });
    }

    if (parsedData.category) {
      const categoryMeta = categories[parsedData.category];
      items.push({
        icon: 'category',
        label: 'Kategorie',
        value: `${categoryMeta.emoji} ${categoryMeta.label}`,
        color: categoryMeta.color,
      });
    }

    return items;
  }, [parsedData, categories, formatDateMemo]);

  const renderIcon = (iconName: string, color: string) => {
    const size = 16;
    switch (iconName) {
      case 'calendar':
        return <Calendar size={size} color={color} />;
      case 'map-pin':
        return <MapPin size={size} color={color} />;
      case 'users':
        return <Users size={size} color={color} />;
      case 'bell':
        return <Bell size={size} color={color} />;
      case 'tag':
        return <Tag size={size} color={color} />;
      case 'video':
        return <Video size={size} color={color} />;
      case 'repeat':
        return <Repeat size={size} color={color} />;
      default:
        return <Text style={{ fontSize: 16, color }}>{iconName === 'check' ? '✓' : iconName === 'flag' ? '🚩' : iconName === 'euro' ? '💶' : iconName === 'folder' ? '📁' : '📦'}</Text>;
    }
  };

  const cheatSheet = NLPTaskParser.getCheatSheet();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

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
              <Sparkles size={22} color="#3B82F6" strokeWidth={2.5} />
              <Text style={styles.headerTitle}>1-Zeile Magie</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.helpButton}
                onPress={() => setShowCheatSheet(!showCheatSheet)}
              >
                <Text style={styles.helpButtonText}>?</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {showCheatSheet && (
            <ScrollView style={styles.cheatSheet} contentContainerStyle={styles.cheatSheetContent}>
              <Text style={styles.cheatSheetTitle}>Shortcuts & Befehle</Text>
              {cheatSheet.map((line, i) => (
                <Text key={i} style={styles.cheatSheetLine}>
                  • {line}
                </Text>
              ))}
            </ScrollView>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="z.B.: morgen 10 uhr /work with Max reminder 10 min zoom"
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={setInput}
              multiline
              autoFocus
              onSubmitEditing={handleSubmit}
              blurOnSubmit={false}
            />
          </View>

          {previewItems.length > 0 && (
            <View style={styles.previewContainer}>
              <View style={styles.previewHeader}>
                <Sparkles size={14} color="#3B82F6" />
                <Text style={styles.previewTitle}>Live-Vorschau</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.previewScrollContent}
              >
                {previewItems.map((item, index) => (
                  <View key={index} style={[styles.previewBadge, { borderColor: item.color }]}>
                    {renderIcon(item.icon, item.color)}
                    <View style={styles.previewBadgeContent}>
                      <Text style={styles.previewBadgeLabel}>{item.label}</Text>
                      <Text style={[styles.previewBadgeValue, { color: item.color }]}>
                        {item.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {parsedData.title && (
            <View style={styles.titlePreview}>
              <Text style={styles.titlePreviewLabel}>Titel:</Text>
              <Text style={styles.titlePreviewText}>{parsedData.title}</Text>
            </View>
          )}

          <View style={styles.examples}>
            <Text style={styles.examplesTitle}>Beispiele:</Text>
            <Text style={styles.exampleText}>• morgen 10 uhr Meeting with Max at Office</Text>
            <Text style={styles.exampleText}>• freitag 14:30 Arzt reminder 15 #privat</Text>
            <Text style={styles.exampleText}>• todo Einkaufen heute 18 p1 €10</Text>
            <Text style={styles.exampleText}>• +30 Call zoom</Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, !parsedData.title.trim() && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!parsedData.title.trim()}
            >
              <Text style={styles.submitButtonText}>
                {parsedData.isTodo ? 'Task erstellen' : 'Termin erstellen'}
              </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    width: '92%',
    maxWidth: 550,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#6B7280',
  },
  closeButton: {
    padding: 4,
  },
  cheatSheet: {
    maxHeight: 180,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cheatSheetContent: {
    padding: 16,
  },
  cheatSheetTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#374151',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cheatSheetLine: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 18,
  },
  inputContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  input: {
    fontSize: 17,
    color: '#111827',
    minHeight: 90,
    maxHeight: 150,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  previewContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewScrollContent: {
    gap: 8,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
  },
  previewBadgeContent: {
    gap: 2,
  },
  previewBadgeLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  previewBadgeValue: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  titlePreview: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  titlePreviewLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  titlePreviewText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#111827',
  },
  examples: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  examplesTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 5,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#6B7280',
  },
  submitButton: {
    flex: 2,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
