import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Target,
  Trash2,
  Edit2,
  X,
  DollarSign,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

interface FundTarget {
  id: string;
  listId: string;
  name: string;
  emoji: string;
  description?: string;
  targetAmountCents?: number;
  totalCollectedCents: number;
  isActive: boolean;
}

export default function FundsScreen() {
  const router = useRouter();
  const { currentList, tasks, fundTargets, addFundTarget, updateFundTarget, deleteFundTarget } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFund, setEditingFund] = useState<FundTarget | null>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for the fund goal');
      return;
    }

    const targetAmountCents = targetAmount ? Math.round(parseFloat(targetAmount) * 100) : undefined;
    
    addFundTarget(name, emoji, description || undefined, targetAmountCents);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setName('');
    setEmoji('🎯');
    setDescription('');
    setTargetAmount('');
    setShowCreateModal(false);
    Alert.alert('Success', `Fund goal "${name}" created!`);
  };

  const handleEdit = () => {
    if (!name.trim() || !editingFund) {
      Alert.alert('Error', 'Please enter a name for the fund goal');
      return;
    }

    const targetAmountCents = targetAmount ? Math.round(parseFloat(targetAmount) * 100) : undefined;
    
    updateFundTarget(editingFund.id, {
      name,
      emoji,
      description: description || undefined,
      targetAmountCents,
    });
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setEditingFund(null);
    setName('');
    setEmoji('🎯');
    setDescription('');
    setTargetAmount('');
    setShowEditModal(false);
    Alert.alert('Success', `Fund goal "${name}" updated!`);
  };

  const handleDelete = (fund: FundTarget) => {
    Alert.alert(
      'Delete Fund Goal',
      `Are you sure you want to delete "${fund.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteFundTarget(fund.id);
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert('Success', 'Fund goal deleted');
          },
        },
      ]
    );
  };

  const openEditModal = (fund: FundTarget) => {
    setEditingFund(fund);
    setName(fund.name);
    setEmoji(fund.emoji);
    setDescription(fund.description || '');
    setTargetAmount(fund.targetAmountCents ? (fund.targetAmountCents / 100).toString() : '');
    setShowEditModal(true);
  };

  const getTasksLinkedToFund = (fundId: string) => {
    return tasks.filter((t) => t.fundTargetId === fundId);
  };

  const EMOJI_OPTIONS = [
    '🎯', '💰', '🏖️', '🚗', '🏠', '✈️', '💎', '🎁', '🎮', '📚',
    '🏃', '🍕', '🎸', '🖥️', '📱', '⚽', '🎨', '🎬', '🎭', '🎪'
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Fund Manager',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.back();
              }}
              style={{ marginLeft: -8 }}
            >
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[styles.container]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Fund Goals</Text>
              <Text style={styles.subtitle}>
                Create goals for failed task stakes to go towards
              </Text>
            </View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowCreateModal(true);
              }}
            >
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {fundTargets.length === 0 ? (
            <View style={styles.emptyState}>
              <Target size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No Fund Goals Yet</Text>
              <Text style={styles.emptySubtext}>
                Create a fund goal to start collecting money from failed tasks
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Create Fund Goal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fundsList}>
              {fundTargets.map((fund) => {
                const linkedTasks = getTasksLinkedToFund(fund.id);
                const totalAmount = fund.totalCollectedCents / 100;
                const targetAmountValue = fund.targetAmountCents ? fund.targetAmountCents / 100 : undefined;
                const progress = targetAmountValue ? Math.min((totalAmount / targetAmountValue) * 100, 100) : 0;
                const isCompleted = targetAmountValue && totalAmount >= targetAmountValue;

                return (
                  <TouchableOpacity 
                    key={fund.id} 
                    style={[
                      styles.fundCard,
                      isCompleted && styles.fundCardCompleted
                    ]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      router.push(`/tasks?fundTargetId=${fund.id}`);
                    }}
                  >
                    <View style={styles.fundHeader}>
                      <View style={[
                        styles.fundEmojiContainer,
                        isCompleted && styles.fundEmojiContainerCompleted
                      ]}>
                        <Text style={styles.fundEmoji}>{fund.emoji}</Text>
                      </View>
                      <View style={styles.fundInfo}>
                        <View style={styles.fundTitleRow}>
                          <Text style={styles.fundName}>{fund.name}</Text>
                          {isCompleted && (
                            <View style={styles.completeBadge}>
                              <CheckCircle2 size={20} color="#10B981" />
                            </View>
                          )}
                        </View>
                        {fund.description && (
                          <Text style={styles.fundDescription}>{fund.description}</Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.fundAmountSection}>
                      <Text style={[styles.fundAmount, isCompleted && styles.fundAmountCompleted]}>
                        {currentList?.currencySymbol || '$'}{totalAmount.toFixed(2)}
                      </Text>
                      {targetAmountValue && (
                        <Text style={styles.fundTargetAmount}>
                          {' '}/ {currentList?.currencySymbol || '$'}{targetAmountValue.toFixed(2)}
                        </Text>
                      )}
                    </View>

                    {targetAmountValue && (
                      <View style={styles.progressSection}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { 
                                width: `${progress}%`,
                                backgroundColor: isCompleted ? '#10B981' : '#3B82F6'
                              }
                            ]} 
                          />
                        </View>
                        <Text style={[styles.progressText, isCompleted && styles.progressTextCompleted]}>
                          {progress.toFixed(0)}% {isCompleted ? '🎉 Reached!' : ''}
                        </Text>
                      </View>
                    )}

                    <View style={styles.fundStats}>
                      <View style={styles.fundStat}>
                        <Target size={14} color="#6B7280" />
                        <Text style={styles.fundStatText}>
                          {linkedTasks.length} {linkedTasks.length === 1 ? 'task' : 'tasks'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.fundActions}>
                      <TouchableOpacity
                        style={styles.fundActionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                          openEditModal(fund);
                        }}
                      >
                        <Edit2 size={18} color="#3B82F6" />
                        <Text style={styles.fundActionText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.fundActionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                          handleDelete(fund);
                        }}
                      >
                        <Trash2 size={18} color="#EF4444" />
                        <Text style={[styles.fundActionText, { color: '#EF4444' }]}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>

      <Modal visible={showCreateModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Fund Goal</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowCreateModal(false);
                setName('');
                setEmoji('🎯');
                setDescription('');
                setTargetAmount('');
              }}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Emoji</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.emojiScroll}
                contentContainerStyle={styles.emojiScrollContent}
              >
                {EMOJI_OPTIONS.map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiOption, emoji === e && styles.emojiOptionSelected]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setEmoji(e);
                    }}
                  >
                    <Text style={styles.emojiOptionText}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Vacation Fund, New Car, etc."
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What is this fund for?"
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={200}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Target Amount (optional)</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencyPrefix}>{currentList?.currencySymbol || '$'}</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  value={targetAmount}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9.]/g, '');
                    const parts = cleaned.split('.');
                    if (parts.length > 2) return;
                    if (parts[1] && parts[1].length > 2) return;
                    setTargetAmount(cleaned);
                  }}
                  keyboardType="decimal-pad"
                />
              </View>
              <Text style={styles.helperText}>Set a price goal to track progress</Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowCreateModal(false);
                setName('');
                setEmoji('🎯');
                setDescription('');
                setTargetAmount('');
              }}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalSubmitButton, !name.trim() && styles.modalSubmitButtonDisabled]}
              onPress={handleCreate}
              disabled={!name.trim()}
            >
              <Text style={styles.modalSubmitButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Fund Goal</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowEditModal(false);
                setEditingFund(null);
                setName('');
                setEmoji('🎯');
                setDescription('');
                setTargetAmount('');
              }}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Emoji</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.emojiScroll}
                contentContainerStyle={styles.emojiScrollContent}
              >
                {EMOJI_OPTIONS.map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiOption, emoji === e && styles.emojiOptionSelected]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setEmoji(e);
                    }}
                  >
                    <Text style={styles.emojiOptionText}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Vacation Fund, New Car, etc."
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What is this fund for?"
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={200}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Target Amount (optional)</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencyPrefix}>{currentList?.currencySymbol || '$'}</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  value={targetAmount}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9.]/g, '');
                    const parts = cleaned.split('.');
                    if (parts.length > 2) return;
                    if (parts[1] && parts[1].length > 2) return;
                    setTargetAmount(cleaned);
                  }}
                  keyboardType="decimal-pad"
                />
              </View>
              <Text style={styles.helperText}>Set a price goal to track progress</Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowEditModal(false);
                setEditingFund(null);
                setName('');
                setEmoji('🎯');
                setDescription('');
                setTargetAmount('');
              }}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalSubmitButton, !name.trim() && styles.modalSubmitButtonDisabled]}
              onPress={handleEdit}
              disabled={!name.trim()}
            >
              <Text style={styles.modalSubmitButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  fundsList: {
    gap: 16,
  },
  fundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  fundCardCompleted: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  fundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  fundEmojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fundEmojiContainerCompleted: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  fundEmoji: {
    fontSize: 36,
  },
  fundInfo: {
    flex: 1,
  },
  fundTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  fundName: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#111827',
    flex: 1,
  },
  completeBadge: {
    padding: 2,
  },
  fundDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  fundAmountSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  fundAmount: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#3B82F6',
    letterSpacing: -1,
  },
  fundAmountCompleted: {
    color: '#10B981',
  },
  fundTargetAmount: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#3B82F6',
    textAlign: 'center',
  },
  progressTextCompleted: {
    color: '#10B981',
  },
  fundStats: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  fundStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fundStatText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  fundActions: {
    flexDirection: 'row',
    gap: 12,
  },
  fundActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  fundActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 24,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingLeft: 16,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#6B7280',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
    fontSize: 16,
    color: '#111827',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  emojiScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  emojiScrollContent: {
    gap: 8,
  },
  emojiOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  emojiOptionText: {
    fontSize: 28,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  modalSubmitButton: {
    flex: 2,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  modalSubmitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  modalSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
