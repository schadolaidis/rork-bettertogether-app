import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { TaskCategory } from '@/types';
import * as Haptics from 'expo-haptics';
import { Pencil, Check, X } from 'lucide-react-native';

const EMOJIS = ['🏠', '💰', '💼', '🎮', '🚀', '❤️', '🎨', '📚', '🍕', '⚽', '🌟', '🎯', '📱', '🌈', '🔥', '⭐'];
const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#14B8A6', '#F97316', '#06B6D4', '#84CC16', '#F43F5E', '#A855F7'];

export default function CategoriesScreen() {
  const { currentList, updateCategory, canManageCategories, getCategoryUsageCount } = useApp();
  const [editingCategory, setEditingCategory] = useState<TaskCategory | null>(null);
  const [editedEmoji, setEditedEmoji] = useState('');
  const [editedColor, setEditedColor] = useState('');
  const [editedLabel, setEditedLabel] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const startEdit = (category: TaskCategory) => {
    if (!currentList) return;
    const catMeta = currentList.categories[category];
    setEditingCategory(category);
    setEditedEmoji(catMeta.emoji);
    setEditedColor(catMeta.color);
    setEditedLabel(catMeta.label);
    setShowEmojiPicker(false);
    setShowColorPicker(false);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = () => {
    if (!editingCategory) return;

    const success = updateCategory(editingCategory, {
      emoji: editedEmoji,
      color: editedColor,
      label: editedLabel,
    });

    if (success) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setEditingCategory(null);
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setShowEmojiPicker(false);
    setShowColorPicker(false);
  };



  if (!currentList || !canManageCategories) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {!canManageCategories ? 'You do not have permission to manage categories' : 'No list selected'}
          </Text>
        </View>
      </View>
    );
  }

  const categories: TaskCategory[] = ['Household', 'Finance', 'Work', 'Leisure'];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Categories</Text>
          <Text style={styles.headerSubtitle}>
            Customize how you organize your tasks
          </Text>
        </View>

        {categories.map((category) => {
          const catMeta = currentList.categories[category];
          const isEditing = editingCategory === category;
          const usageCount = getCategoryUsageCount(category);

          if (isEditing) {
            return (
              <View key={category} style={styles.editCard}>
                <View style={styles.editHeader}>
                  <Text style={styles.editTitle}>Edit Category</Text>
                  <TouchableOpacity onPress={handleCancel}>
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.previewSection}>
                  <View style={[styles.previewIcon, { backgroundColor: editedColor }]}>
                    <Text style={styles.previewEmoji}>{editedEmoji}</Text>
                  </View>
                  <TextInput
                    style={styles.labelInput}
                    value={editedLabel}
                    onChangeText={setEditedLabel}
                    placeholder="Category name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.pickerSection}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowColorPicker(false);
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                  >
                    <Text style={styles.pickerEmoji}>{editedEmoji}</Text>
                    <Text style={styles.pickerLabel}>Emoji</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      setShowColorPicker(!showColorPicker);
                      setShowEmojiPicker(false);
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                  >
                    <View style={[styles.colorPreview, { backgroundColor: editedColor }]} />
                    <Text style={styles.pickerLabel}>Color</Text>
                  </TouchableOpacity>
                </View>

                {showEmojiPicker && (
                  <View style={styles.pickerGrid}>
                    {EMOJIS.map((emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        style={[
                          styles.emojiOption,
                          editedEmoji === emoji && styles.emojiOptionActive,
                        ]}
                        onPress={() => {
                          setEditedEmoji(emoji);
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }}
                      >
                        <Text style={styles.emojiText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {showColorPicker && (
                  <View style={styles.colorPickerGrid}>
                    {COLORS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          editedColor === color && styles.colorOptionActive,
                        ]}
                        onPress={() => {
                          setEditedColor(color);
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }}
                      >
                        {editedColor === color && (
                          <Check size={20} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                  >
                    <Check size={20} color="#FFFFFF" strokeWidth={3} />
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={category}
              style={styles.categoryCard}
              onPress={() => startEdit(category)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: catMeta.color }]}>
                  <Text style={styles.categoryEmoji}>{catMeta.emoji}</Text>
                </View>
                <View style={styles.categoryText}>
                  <Text style={styles.categoryName}>{catMeta.label}</Text>
                  <Text style={styles.categoryUsage}>
                    {usageCount} {usageCount === 1 ? 'task' : 'tasks'}
                  </Text>
                </View>
              </View>
              <View style={styles.categoryRight}>
                <Pencil size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 14,
  },
  categoryEmoji: {
    fontSize: 26,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  categoryUsage: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  categoryRight: {
    marginLeft: 12,
  },
  editCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  editHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  previewSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
    gap: 12,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  previewEmoji: {
    fontSize: 28,
  },
  labelInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerSection: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 16,
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerEmoji: {
    fontSize: 24,
  },
  pickerLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  pickerGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
    marginBottom: 20,
    padding: 4,
  },
  emojiOption: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  emojiText: {
    fontSize: 26,
  },
  colorPickerGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    marginBottom: 20,
    padding: 4,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  editActions: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center' as const,
  },
});
