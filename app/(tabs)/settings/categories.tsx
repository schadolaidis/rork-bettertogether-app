import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, TextInput, Alert } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { CategoryMeta } from '@/types';
import * as Haptics from 'expo-haptics';
import { Pencil, Check, X, Plus, Trash2, Search } from 'lucide-react-native';

const ALL_EMOJIS = [
  '🏠', '💰', '💼', '🎮', '🚀', '❤️', '🎨', '📚', '🍕', '⚽',
  '🌟', '🎯', '📱', '🌈', '🔥', '⭐', '🎵', '🎬', '🏋️', '🧘',
  '🚗', '✈️', '🏖️', '🎄', '🎂', '🍔', '☕', '🌻', '🐶', '🐱',
  '🦁', '🐼', '🦄', '🌙', '☀️', '⛱️', '🎪', '🎭', '🎸', '🎹',
  '📷', '💻', '⌚', '🎁', '💎', '🏆', '🥇', '🏅', '🎓', '📝',
  '📖', '✏️', '🖊️', '📌', '📍', '🔖', '💡', '🔦', '🕯️', '🧲',
  '🧪', '🔬', '🩺', '💊', '💉', '🧬', '🦠', '🧠', '🫀', '🫁',
  '🦷', '🦴', '👁️', '👂', '👃', '👅', '👄', '💋', '🦵', '🦶',
  '💪', '🤝', '🙏', '✍️', '🦾', '🦿', '🤳', '👣', '🐾', '🧵',
  '🪡', '🧶', '🪢', '🔨', '🪛', '⚒️', '🛠️', '⚙️', '🔧', '🪚',
  '🔩', '⚗️', '🧯', '🪤', '🚪', '🪟', '🪞', '🔦', '💡', '🕯️',
];

const COLORS = [
  '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#14B8A6', '#F97316', '#06B6D4', '#84CC16', '#F43F5E', '#A855F7',
  '#059669', '#D97706', '#2563EB', '#7C3AED', '#DB2777', '#DC2626',
  '#0D9488', '#EA580C', '#0284C7', '#65A30D', '#E11D48', '#9333EA',
  '#6B7280', '#4B5563', '#1F2937', '#111827', '#6366F1', '#8B5CF6',
];

export default function CategoriesScreen() {
  const {
    currentList,
    updateCategory,
    addCategory,
    deleteCategory,
    canManageCategories,
    getCategoryUsageCount,
    t,
  } = useApp();

  const [editingCategory, setEditingCategory] = useState<CategoryMeta | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);


  const [editedEmoji, setEditedEmoji] = useState('');
  const [editedColor, setEditedColor] = useState('');
  const [editedLabel, setEditedLabel] = useState('');
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [emojiSearchQuery, setEmojiSearchQuery] = useState('');

  const startEdit = (category: CategoryMeta) => {
    setEditingCategory(category);

    setEditedEmoji(category.emoji);
    setEditedColor(category.color);
    setEditedLabel(category.label);
    setIsAddingNew(false);
    setShowEmojiPicker(false);
    setShowColorPicker(false);
    setEmojiSearchQuery('');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const startAddNew = () => {
    setIsAddingNew(true);
    setEditingCategory(null);

    setEditedEmoji('📁');
    setEditedColor(COLORS[0]);
    setEditedLabel('');
    setShowEmojiPicker(false);
    setShowColorPicker(false);
    setEmojiSearchQuery('');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = () => {
    if (!editedLabel.trim()) {
      Alert.alert(t.common.error, 'Please enter a category name');
      return;
    }

    if (isAddingNew) {
      const categoryId = editedLabel.toLowerCase().replace(/\s+/g, '-');
      
      if (currentList?.categories.find((c) => c.id === categoryId)) {
        Alert.alert(t.common.error, 'A category with this name already exists');
        return;
      }

      const success = addCategory({
        id: categoryId,
        emoji: editedEmoji,
        color: editedColor,
        label: editedLabel.trim(),
      });

      if (success) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setIsAddingNew(false);
      }
    } else if (editingCategory) {
      const success = updateCategory(editingCategory.id, {
        emoji: editedEmoji,
        color: editedColor,
        label: editedLabel.trim(),
      });

      if (success) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setEditingCategory(null);
      }
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setIsAddingNew(false);
    setShowEmojiPicker(false);
    setShowColorPicker(false);
    setEmojiSearchQuery('');
  };

  const handleDelete = (category: CategoryMeta) => {
    if (category.isDefault) {
      Alert.alert(t.common.error, 'Cannot delete default categories');
      return;
    }

    const usageCount = getCategoryUsageCount(category.id);
    if (usageCount > 0) {
      Alert.alert(
        t.common.confirm,
        `This category is used by ${usageCount} task(s). Delete it anyway? Tasks will be uncategorized.`,
        [
          { text: t.common.cancel, style: 'cancel' },
          {
            text: t.common.delete,
            style: 'destructive',
            onPress: () => {
              const firstCategory = currentList?.categories.find((c) => c.id !== category.id);
              if (firstCategory) {
                deleteCategory(category.id, firstCategory.id);
              }
            },
          },
        ]
      );
    } else {
      deleteCategory(category.id);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const filteredEmojis = emojiSearchQuery
    ? ALL_EMOJIS.filter((emoji) => emoji.includes(emojiSearchQuery))
    : ALL_EMOJIS;

  if (!currentList || !canManageCategories) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {!canManageCategories
              ? 'You do not have permission to manage categories'
              : 'No list selected'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Categories</Text>
          <Text style={styles.headerSubtitle}>
            Customize how you organize your tasks
          </Text>
        </View>

        {(editingCategory || isAddingNew) && (
          <View style={styles.editCard}>
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>
                {isAddingNew ? 'New Category' : 'Edit Category'}
              </Text>
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
                autoFocus={isAddingNew}
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
              <View style={styles.emojiPickerContainer}>
                <View style={styles.searchContainer}>
                  <Search size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.searchInput}
                    value={emojiSearchQuery}
                    onChangeText={setEmojiSearchQuery}
                    placeholder="Search emoji..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <ScrollView style={styles.emojiScroll} nestedScrollEnabled>
                  <View style={styles.pickerGrid}>
                    {filteredEmojis.map((emoji) => (
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
                </ScrollView>
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
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Check size={20} color="#FFFFFF" strokeWidth={3} />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!editingCategory && !isAddingNew && (
          <>
            {currentList.categories.map((category) => {
              const usageCount = getCategoryUsageCount(category.id);

              return (
                <View key={category.id} style={styles.categoryCard}>
                  <TouchableOpacity
                    style={styles.categoryContent}
                    onPress={() => startEdit(category)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryLeft}>
                      <View
                        style={[styles.categoryIcon, { backgroundColor: category.color }]}
                      >
                        <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                      </View>
                      <View style={styles.categoryText}>
                        <Text style={styles.categoryName}>{category.label}</Text>
                        <Text style={styles.categoryUsage}>
                          {usageCount} {usageCount === 1 ? 'task' : 'tasks'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.categoryRight}>
                      <Pencil size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>

                  {!category.isDefault && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(category)}
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.addButton}
              onPress={startAddNew}
              activeOpacity={0.7}
            >
              <View style={styles.addButtonIconContainer}>
                <Plus size={24} color="#3B82F6" strokeWidth={2.5} />
              </View>
              <Text style={styles.addButtonText}>Add New Category</Text>
            </TouchableOpacity>
          </>
        )}
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
    marginBottom: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden' as const,
  },
  categoryContent: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
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
  deleteButton: {
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#F3F4F6',
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
  emojiPickerContainer: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  emojiScroll: {
    maxHeight: 200,
  },
  pickerGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
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
  addButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed' as const,
    marginTop: 8,
  },
  addButtonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#3B82F6',
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
