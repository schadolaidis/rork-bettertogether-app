import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import {
  Plus,
  Target,
  Edit2,
  TrendingUp,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { DesignTokens } from '@/constants/design-tokens';
import Svg, { Circle } from 'react-native-svg';
import { ModalInputWrapper } from '@/components/ModalInputWrapper';

type TabType = 'overview' | 'history' | 'stats';

export default function FundsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    currentList,
    tasks,
    fundTargets,
    createFundTarget,
    updateFundTarget,
    deleteFundTarget,
    ledgerEntries,
    currentListMembers,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFund, setEditingFund] = useState<any>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const currencySymbol = currentList?.currencySymbol || '$';

  const totalSaved = useMemo(() => {
    return fundTargets.reduce((sum, fund) => sum + fund.totalCollectedCents, 0) / 100;
  }, [fundTargets]);

  const totalTargets = useMemo(() => {
    return fundTargets.reduce((sum, fund) => {
      return sum + (fund.targetAmountCents || 0);
    }, 0) / 100;
  }, [fundTargets]);

  const overallProgress = useMemo(() => {
    if (totalTargets === 0) return 0;
    return Math.min((totalSaved / totalTargets) * 100, 100);
  }, [totalSaved, totalTargets]);

  const completedGoalsCount = useMemo(() => {
    return fundTargets.filter(fund => {
      if (!fund.targetAmountCents) return false;
      return fund.totalCollectedCents >= fund.targetAmountCents;
    }).length;
  }, [fundTargets]);

  const EMOJI_OPTIONS = [
    '🎯', '💰', '🏖️', '🚗', '🏠', '✈️', '💎', '🎁', '🎮', '📚',
    '🏃', '🍕', '🎸', '🖥️', '📱', '⚽', '🎨', '🎬', '🎭', '🎪',
  ];

  const handleCreate = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for the fund goal');
      return;
    }

    const targetAmountCents = targetAmount
      ? Math.round(parseFloat(targetAmount) * 100)
      : undefined;
    createFundTarget(name, emoji, description || undefined, targetAmountCents);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setName('');
    setEmoji('🎯');
    setDescription('');
    setTargetAmount('');
    setShowCreateModal(false);
  }, [name, emoji, description, targetAmount, createFundTarget]);

  const handleEdit = useCallback(() => {
    if (!name.trim() || !editingFund) {
      Alert.alert('Error', 'Please enter a name for the fund goal');
      return;
    }

    console.log('[FundEdit] Saving changes for fund:', editingFund.id);
    console.log('[FundEdit] New values:', { name, emoji, description, targetAmount });

    const targetAmountCents = targetAmount && targetAmount.trim() !== ''
      ? Math.round(parseFloat(targetAmount) * 100)
      : undefined;
    
    const result = updateFundTarget(editingFund.id, {
      name,
      emoji,
      description: description || undefined,
      targetAmountCents,
    });

    console.log('[FundEdit] Update result:', result);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setEditingFund(null);
    setName('');
    setEmoji('🎯');
    setDescription('');
    setTargetAmount('');
  }, [name, emoji, description, targetAmount, editingFund, updateFundTarget]);

  const handleDelete = useCallback(
    (fund: any) => {
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
            },
          },
        ]
      );
    },
    [deleteFundTarget]
  );

  const openEditModal = useCallback((fund: any) => {
    console.log('[FundEdit] Opening edit modal for fund:', fund.id, fund.name);
    setEditingFund(fund);
    setName(fund.name);
    setEmoji(fund.emoji);
    setDescription(fund.description || '');
    setTargetAmount(
      fund.targetAmountCents ? (fund.targetAmountCents / 100).toString() : ''
    );
  }, []);

  const getTasksLinkedToFund = useCallback(
    (fundId: string) => {
      return tasks.filter((t) => t.fundTargetId === fundId);
    },
    [tasks]
  );

  const getContributors = useCallback(
    (fundId: string) => {
      const linkedTasks = getTasksLinkedToFund(fundId);
      const userIds = new Set(
        linkedTasks
          .filter((t) => t.status === 'failed')
          .map((t) => (Array.isArray(t.assignedTo) ? t.assignedTo : [t.assignedTo]))
          .flat()
      );
      return currentListMembers.filter((m) => userIds.has(m.id));
    },
    [getTasksLinkedToFund, currentListMembers]
  );

  const getSuggestion = useCallback((fund: any) => {
    const linkedTasks = getTasksLinkedToFund(fund.id);
    const activeTasks = linkedTasks.filter(
      (t) => t.status === 'pending' || t.status === 'overdue'
    );
    const failedTasks = linkedTasks.filter((t) => t.status === 'failed');
    console.log('[FundSuggestion]', failedTasks.length, 'failed tasks');

    if (!fund.targetAmountCents) {
      return null;
    }

    const remaining = fund.targetAmountCents - fund.totalCollectedCents;
    if (remaining <= 0) {
      return {
        type: 'success' as const,
        message: 'Goal reached! 🎉',
      };
    }

    if (activeTasks.length === 0) {
      return {
        type: 'info' as const,
        message: 'Add tasks to reach this goal faster',
      };
    }

    const totalStaked = activeTasks.reduce((sum, t) => sum + t.stake * 100, 0);
    if (totalStaked >= remaining) {
      return {
        type: 'warning' as const,
        message: `Complete ${activeTasks.length} tasks to reach goal`,
      };
    }

    const tasksNeeded = Math.ceil(remaining / (currentList?.defaultStakeCents || 500));
    return {
      type: 'info' as const,
      message: `~${tasksNeeded} more tasks needed`,
    };
  }, [getTasksLinkedToFund, currentList]);

  const renderProgressRing = (progress: number, size: number, color: string) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <Svg width={size} height={size}>
        <Circle
          stroke={DesignTokens.colors.neutral[200]}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    );
  };

  const renderOverviewTab = () => (
    <View>
      {fundTargets.map((fund) => {
        const linkedTasks = getTasksLinkedToFund(fund.id);
        const totalAmount = fund.totalCollectedCents / 100;
        const targetAmountValue = fund.targetAmountCents
          ? fund.targetAmountCents / 100
          : undefined;
        const progress = targetAmountValue
          ? Math.min((totalAmount / targetAmountValue) * 100, 100)
          : 0;
        const isCompleted = targetAmountValue && totalAmount >= targetAmountValue;
        const contributors = getContributors(fund.id);
        const suggestion = getSuggestion(fund);

        return (
          <TouchableOpacity
            key={fund.id}
            style={[styles.fundCard, isCompleted && styles.fundCardCompleted]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push(`/tasks?fundTargetId=${fund.id}`);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.fundCardHeader}>
              <View style={styles.fundCardLeft}>
                <View
                  style={[
                    styles.fundEmojiContainer,
                    isCompleted && styles.fundEmojiContainerCompleted,
                  ]}
                >
                  <Text style={styles.fundEmoji}>{fund.emoji}</Text>
                </View>
              </View>
              <View style={styles.fundCardRight}>
                <View style={styles.fundTitleRow}>
                  <Text style={styles.fundName} numberOfLines={1}>
                    {fund.name}
                  </Text>
                  {isCompleted && (
                    <CheckCircle2 size={20} color={DesignTokens.colors.success[500]} />
                  )}
                </View>
                {fund.description && (
                  <Text style={styles.fundDescription} numberOfLines={2}>
                    {fund.description}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.fundAmountSection}>
              <Text
                style={[
                  styles.fundAmount,
                  { color: isCompleted ? DesignTokens.colors.success[500] : DesignTokens.colors.primary[500] },
                ]}
              >
                {currencySymbol}
                {totalAmount.toFixed(2)}
              </Text>
              {targetAmountValue && (
                <Text style={styles.fundTargetAmount}>
                  {' '}
                  / {currencySymbol}
                  {targetAmountValue.toFixed(2)}
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
                        backgroundColor: isCompleted
                          ? DesignTokens.colors.success[500]
                          : DesignTokens.colors.primary[500],
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.progressText,
                    {
                      color: isCompleted
                        ? DesignTokens.colors.success[500]
                        : DesignTokens.colors.primary[500],
                    },
                  ]}
                >
                  {progress.toFixed(0)}%{isCompleted ? ' 🎉 Reached!' : ''}
                </Text>
              </View>
            )}

            <View style={styles.fundMetaRow}>
              <View style={styles.fundMetaItem}>
                <Target size={16} color={DesignTokens.colors.neutral[600]} />
                <Text style={styles.fundMetaText}>
                  {linkedTasks.length} {linkedTasks.length === 1 ? 'task' : 'tasks'}
                </Text>
              </View>
              {contributors.length > 0 && (
                <>
                  <View style={styles.metaDivider} />
                  <View style={styles.fundMetaItem}>
                    <Users size={16} color={DesignTokens.colors.neutral[600]} />
                    <Text style={styles.fundMetaText}>
                      {contributors.length} {contributors.length === 1 ? 'contributor' : 'contributors'}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {suggestion && (
              <View
                style={[
                  styles.suggestionBanner,
                  {
                    backgroundColor:
                      suggestion.type === 'success'
                        ? DesignTokens.colors.success[50]
                        : suggestion.type === 'warning'
                        ? DesignTokens.colors.warning[50]
                        : DesignTokens.colors.primary[50],
                  },
                ]}
              >
                <Sparkles
                  size={14}
                  color={
                    suggestion.type === 'success'
                      ? DesignTokens.colors.success[500]
                      : suggestion.type === 'warning'
                      ? DesignTokens.colors.warning[500]
                      : DesignTokens.colors.primary[500]
                  }
                />
                <Text
                  style={[
                    styles.suggestionText,
                    {
                      color:
                        suggestion.type === 'success'
                          ? DesignTokens.colors.success[600]
                          : suggestion.type === 'warning'
                          ? DesignTokens.colors.warning[600]
                          : DesignTokens.colors.primary[600],
                    },
                  ]}
                >
                  {suggestion.message}
                </Text>
              </View>
            )}

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
                <Edit2 size={18} color={DesignTokens.colors.primary[500]} />
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
                <Trash2 size={18} color={DesignTokens.colors.error[500]} />
                <Text style={[styles.fundActionText, { color: DesignTokens.colors.error[500] }]}>
                  Delete
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fundActionButton, styles.fundActionButtonPrimary]}
                onPress={(e) => {
                  e.stopPropagation();
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push(`/tasks?fundTargetId=${fund.id}`);
                }}
              >
                <Text style={styles.fundActionTextPrimary}>View Tasks</Text>
                <ChevronRight size={18} color={DesignTokens.colors.neutral[0]} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderHistoryTab = () => {
    const history = ledgerEntries
      .filter((entry) => {
        const task = tasks.find((t) => t.id === entry.taskId);
        return task?.fundTargetId && fundTargets.some((f) => f.id === task.fundTargetId);
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50);

    if (history.length === 0) {
      return (
        <View style={styles.emptyHistory}>
          <Clock size={48} color={DesignTokens.colors.neutral[300]} />
          <Text style={styles.emptyHistoryText}>No transactions yet</Text>
          <Text style={styles.emptyHistorySubtext}>
            Failed tasks will appear here
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.historyList}>
        {history.map((entry) => {
          const task = tasks.find((t) => t.id === entry.taskId);
          const fund = fundTargets.find((f) => f.id === task?.fundTargetId);
          const amount = entry.amount;
          const date = new Date(entry.date);

          return (
            <View key={entry.id} style={styles.historyItem}>
              <View style={styles.historyIconContainer}>
                <Text style={styles.historyEmoji}>{fund?.emoji || '💰'}</Text>
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle} numberOfLines={1}>
                  {task?.title || 'Unknown Task'}
                </Text>
                <Text style={styles.historySubtitle}>
                  {fund?.name || 'Unknown Fund'} • {date.toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.historyAmount}>
                +{currencySymbol}
                {amount.toFixed(2)}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderStatsTab = () => {
    const topFund = [...fundTargets].sort(
      (a, b) => b.totalCollectedCents - a.totalCollectedCents
    )[0];
    const totalFailedTasks = tasks.filter((t) => t.status === 'failed').length;
    console.log('[FundStats]', totalFailedTasks, 'total failed tasks');
    const thisMonthFailed = tasks.filter((t) => {
      if (t.status !== 'failed' || !t.failedAt) return false;
      const date = new Date(t.failedAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconBg}>
            <TrendingUp size={24} color={DesignTokens.colors.primary[500]} />
          </View>
          <Text style={styles.statValue}>
            {currencySymbol}
            {totalSaved.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Total Saved</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: DesignTokens.colors.success[50] }]}>
            <CheckCircle2 size={24} color={DesignTokens.colors.success[500]} />
          </View>
          <Text style={styles.statValue}>{completedGoalsCount}</Text>
          <Text style={styles.statLabel}>Goals Reached</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: DesignTokens.colors.error[50] }]}>
            <AlertCircle size={24} color={DesignTokens.colors.error[500]} />
          </View>
          <Text style={styles.statValue}>{thisMonthFailed}</Text>
          <Text style={styles.statLabel}>Failed This Month</Text>
        </View>

        {topFund && (
          <View style={[styles.statCard, styles.statCardWide]}>
            <View style={styles.topFundHeader}>
              <Text style={styles.topFundEmoji}>{topFund.emoji}</Text>
              <View style={styles.topFundInfo}>
                <Text style={styles.topFundLabel}>Top Goal</Text>
                <Text style={styles.topFundName}>{topFund.name}</Text>
              </View>
            </View>
            <Text style={styles.topFundAmount}>
              {currencySymbol}
              {(topFund.totalCollectedCents / 100).toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Fund Goals</Text>
            <Text style={styles.subtitle}>
              {currentList?.name || 'Your List'} • {new Date().toLocaleDateString('en-US', { month: 'long' })}
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
            <Plus size={24} color={DesignTokens.colors.neutral[0]} />
          </TouchableOpacity>
        </View>

        {totalTargets > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <View style={styles.progressRing}>
                {renderProgressRing(overallProgress, 72, DesignTokens.colors.primary[500])}
                <View style={styles.progressRingCenter}>
                  <Text style={styles.progressRingText}>{overallProgress.toFixed(0)}%</Text>
                </View>
              </View>
            </View>
            <View style={styles.summaryRight}>
              <Text style={styles.summaryLabel}>Total Progress</Text>
              <View style={styles.summaryAmounts}>
                <Text style={styles.summarySaved}>
                  {currencySymbol}
                  {totalSaved.toFixed(2)}
                </Text>
                <Text style={styles.summaryTarget}>
                  {' '}
                  / {currencySymbol}
                  {totalTargets.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.summarySubtext}>
                {fundTargets.length} {fundTargets.length === 1 ? 'goal' : 'goals'} • {completedGoalsCount} completed
              </Text>
            </View>
          </View>
        )}

        <View style={styles.tabs}>
          {(['overview', 'history', 'stats'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setActiveTab(tab);
              }}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {fundTargets.length === 0 ? (
            <View style={styles.emptyState}>
              <Target size={64} color={DesignTokens.colors.neutral[300]} />
              <Text style={styles.emptyText}>No Fund Goals Yet</Text>
              <Text style={styles.emptySubtext}>
                Create fund goals to track savings from failed task stakes
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Plus size={20} color={DesignTokens.colors.neutral[0]} />
                <Text style={styles.emptyButtonText}>Create Fund Goal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'history' && renderHistoryTab()}
              {activeTab === 'stats' && renderStatsTab()}
            </>
          )}
        </ScrollView>

        <ModalInputWrapper
          open={showCreateModal || !!editingFund}
          title={editingFund ? `Edit Fund Goal: ${editingFund.name}` : 'Create Fund Goal'}
          onClose={() => {
            console.log('[FundModal] Closing modal');
            setShowCreateModal(false);
            setEditingFund(null);
            setName('');
            setEmoji('🎯');
            setDescription('');
            setTargetAmount('');
          }}
          onConfirm={editingFund ? handleEdit : handleCreate}
          confirmLabel={editingFund ? 'Save Changes' : 'Create'}
          testID="fund-modal"
        >
          <View style={styles.modalFormGroup}>
            <Text style={styles.modalLabel}>Emoji</Text>
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

          <View style={styles.modalFormGroup}>
            <Text style={styles.modalLabel}>Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Vacation Fund, New Car, etc."
              placeholderTextColor={DesignTokens.colors.neutral[400]}
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          <View style={styles.modalFormGroup}>
            <Text style={styles.modalLabel}>Description (optional)</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="What is this fund for?"
              placeholderTextColor={DesignTokens.colors.neutral[400]}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={200}
            />
          </View>

          <View style={styles.modalFormGroup}>
            <Text style={styles.modalLabel}>Target Amount (optional)</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencyPrefix}>{currencySymbol}</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={DesignTokens.colors.neutral[400]}
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
            <Text style={styles.helperText}>Set a goal to track progress</Text>
          </View>
        </ModalInputWrapper>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingVertical: DesignTokens.spacing.lg,
    backgroundColor: DesignTokens.colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[200],
  },
  title: {
    ...DesignTokens.typography.displayMedium,
    color: DesignTokens.colors.neutral[900],
  },
  subtitle: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[600],
    marginTop: DesignTokens.spacing.xs,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DesignTokens.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadow.md,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.lg,
    padding: DesignTokens.spacing.xl,
    marginHorizontal: DesignTokens.spacing.xl,
    marginVertical: DesignTokens.spacing.lg,
    backgroundColor: DesignTokens.colors.primary[50],
    borderRadius: DesignTokens.radius.xl,
    ...DesignTokens.shadow.sm,
  },
  summaryLeft: {
    position: 'relative',
  },
  progressRing: {
    position: 'relative',
    width: 72,
    height: 72,
  },
  progressRingCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: DesignTokens.colors.primary[600],
  },
  summaryRight: {
    flex: 1,
  },
  summaryLabel: {
    ...DesignTokens.typography.labelSmall,
    color: DesignTokens.colors.neutral[600],
    marginBottom: DesignTokens.spacing.xs,
  },
  summaryAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: DesignTokens.spacing.xs,
  },
  summarySaved: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: DesignTokens.colors.neutral[900],
    letterSpacing: -0.5,
  },
  summaryTarget: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: DesignTokens.colors.neutral[500],
  },
  summarySubtext: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[600],
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[200],
  },
  tab: {
    flex: 1,
    paddingVertical: DesignTokens.spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {},
  tabText: {
    ...DesignTokens.typography.bodyMedium,
    fontWeight: '600',
    color: DesignTokens.colors.neutral[500],
  },
  tabTextActive: {
    color: DesignTokens.colors.primary[600],
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: DesignTokens.colors.primary[500],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: DesignTokens.spacing.xl,
    paddingBottom: DesignTokens.spacing.xxxl * 1.5,
  },
  fundCard: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.xl,
    padding: DesignTokens.spacing.xl,
    marginBottom: DesignTokens.spacing.lg,
    ...DesignTokens.shadow.lg,
  },
  fundCardCompleted: {
    backgroundColor: DesignTokens.colors.success[50],
    borderWidth: 2,
    borderColor: DesignTokens.colors.success[500],
  },
  fundCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.lg,
  },
  fundCardLeft: {},
  fundEmojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DesignTokens.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  fundEmojiContainerCompleted: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderWidth: 2,
    borderColor: DesignTokens.colors.success[500],
  },
  fundEmoji: {
    fontSize: 32,
  },
  fundCardRight: {
    flex: 1,
  },
  fundTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
    marginBottom: DesignTokens.spacing.xs,
  },
  fundName: {
    ...DesignTokens.typography.headingMedium,
    color: DesignTokens.colors.neutral[900],
    flex: 1,
  },
  fundDescription: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[600],
    lineHeight: 18,
  },
  fundAmountSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: DesignTokens.spacing.md,
  },
  fundAmount: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -1,
  },
  fundTargetAmount: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: DesignTokens.colors.neutral[400],
  },
  progressSection: {
    marginBottom: DesignTokens.spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: DesignTokens.colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...DesignTokens.typography.labelLarge,
    textAlign: 'center',
  },
  fundMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[200],
    marginBottom: DesignTokens.spacing.md,
    gap: DesignTokens.spacing.md,
  },
  fundMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  fundMetaText: {
    ...DesignTokens.typography.bodySmall,
    fontWeight: '600',
    color: DesignTokens.colors.neutral[600],
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: DesignTokens.colors.neutral[300],
  },
  suggestionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.radius.md,
    marginBottom: DesignTokens.spacing.md,
  },
  suggestionText: {
    ...DesignTokens.typography.bodySmall,
    fontWeight: '600',
    flex: 1,
  },
  fundActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.sm,
  },
  fundActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing.xs,
    paddingVertical: DesignTokens.spacing.md,
    borderRadius: DesignTokens.radius.md,
    backgroundColor: DesignTokens.colors.neutral[50],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[200],
  },
  fundActionButtonPrimary: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderColor: DesignTokens.colors.primary[500],
  },
  fundActionText: {
    ...DesignTokens.typography.bodyMedium,
    fontWeight: '600',
    color: DesignTokens.colors.primary[500],
  },
  fundActionTextPrimary: {
    ...DesignTokens.typography.bodyMedium,
    fontWeight: '600',
    color: DesignTokens.colors.neutral[0],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing.xxxl * 2.5,
  },
  emptyText: {
    ...DesignTokens.typography.headingMedium,
    color: DesignTokens.colors.neutral[900],
    marginTop: DesignTokens.spacing.lg,
  },
  emptySubtext: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[600],
    marginTop: DesignTokens.spacing.sm,
    textAlign: 'center',
    paddingHorizontal: DesignTokens.spacing.xxxl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
    marginTop: DesignTokens.spacing.xxl,
    paddingHorizontal: DesignTokens.spacing.xxl,
    paddingVertical: DesignTokens.spacing.md,
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: DesignTokens.radius.md,
  },
  emptyButtonText: {
    ...DesignTokens.typography.bodyLarge,
    fontWeight: '700',
    color: DesignTokens.colors.neutral[0],
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing.xxxl * 2,
  },
  emptyHistoryText: {
    ...DesignTokens.typography.headingMedium,
    color: DesignTokens.colors.neutral[900],
    marginTop: DesignTokens.spacing.lg,
  },
  emptyHistorySubtext: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[600],
    marginTop: DesignTokens.spacing.sm,
  },
  historyList: {
    gap: DesignTokens.spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
    padding: DesignTokens.spacing.lg,
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    ...DesignTokens.shadow.sm,
  },
  historyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DesignTokens.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyEmoji: {
    fontSize: 24,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    ...DesignTokens.typography.bodyLarge,
    fontWeight: '600',
    color: DesignTokens.colors.neutral[900],
    marginBottom: 2,
  },
  historySubtitle: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[600],
  },
  historyAmount: {
    ...DesignTokens.typography.bodyLarge,
    fontWeight: '700',
    color: DesignTokens.colors.success[500],
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    gap: DesignTokens.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    padding: DesignTokens.spacing.xl,
    alignItems: 'center',
    ...DesignTokens.shadow.md,
  },
  statCardWide: {
    width: '100%',
    minWidth: '100%',
  },
  statIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DesignTokens.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.md,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: DesignTokens.colors.neutral[900],
    letterSpacing: -1,
    marginBottom: DesignTokens.spacing.xs,
  },
  statLabel: {
    ...DesignTokens.typography.bodyMedium,
    fontWeight: '600',
    color: DesignTokens.colors.neutral[600],
    textAlign: 'center',
  },
  topFundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.md,
    width: '100%',
  },
  topFundEmoji: {
    fontSize: 48,
  },
  topFundInfo: {
    flex: 1,
  },
  topFundLabel: {
    ...DesignTokens.typography.labelSmall,
    color: DesignTokens.colors.neutral[600],
    marginBottom: 2,
  },
  topFundName: {
    ...DesignTokens.typography.headingSmall,
    color: DesignTokens.colors.neutral[900],
  },
  topFundAmount: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: DesignTokens.colors.primary[500],
    letterSpacing: -0.5,
  },
  modalFormGroup: {
    marginBottom: DesignTokens.spacing.xl,
  },
  modalLabel: {
    ...DesignTokens.typography.labelLarge,
    color: DesignTokens.colors.neutral[700],
    marginBottom: DesignTokens.spacing.sm,
  },
  modalInput: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.md,
    padding: DesignTokens.spacing.lg,
    fontSize: 16,
    color: DesignTokens.colors.neutral[900],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[200],
  },
  modalTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  emojiScroll: {
    marginHorizontal: -DesignTokens.spacing.xl,
    paddingHorizontal: DesignTokens.spacing.xl,
  },
  emojiScrollContent: {
    gap: DesignTokens.spacing.sm,
  },
  emojiOption: {
    width: 56,
    height: 56,
    borderRadius: DesignTokens.radius.md,
    backgroundColor: DesignTokens.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    backgroundColor: DesignTokens.colors.primary[50],
    borderColor: DesignTokens.colors.primary[500],
  },
  emojiOptionText: {
    fontSize: 28,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[200],
    paddingLeft: DesignTokens.spacing.lg,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: DesignTokens.colors.neutral[500],
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    padding: DesignTokens.spacing.lg,
    paddingLeft: 0,
    fontSize: 16,
    color: DesignTokens.colors.neutral[900],
  },
  helperText: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[500],
    marginTop: DesignTokens.spacing.xs,
  },
});
