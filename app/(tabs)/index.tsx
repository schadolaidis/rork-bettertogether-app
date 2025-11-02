import React, { useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Users,
  X,
  ChevronDown,
  Check,
  Plus,
  CheckSquare,
  Target,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { FundHero } from '@/components/FundHero';
import { SectionHeader } from '@/components/design-system/SectionHeader';
import { StreaksFundCard } from '@/components/StreaksFundCard';
import { MOCK_FUND_TARGETS } from '@/mocks/data';

import { StatCard } from '@/components/design-system/StatCard';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    dashboardStats,
    tasks,
    allTasks,
    currentUser,
    currentList,
    currentListMembers,
    lists,
    switchList,
    ledgerEntries,
    currentListId,
  } = useApp();

  const [showListSwitcher, setShowListSwitcher] = useState(false);

  const activeFundTargets = useMemo(() => {
    return MOCK_FUND_TARGETS.filter(
      (ft) => ft.listId === currentListId && ft.isActive
    );
  }, [currentListId]);

  const currencySymbol = currentList?.currencySymbol || '$';
  const totalBalance = dashboardStats?.totalBalance ?? 0;
  const balanceColor = totalBalance >= 0 ? '#10B981' : '#EF4444';
  const balanceSign = totalBalance >= 0 ? '+' : '';

  const handleOpenTasksTap = useCallback(() => {
    router.push('/tasks?filter=open');
  }, [router]);

  const handleOverdueTap = useCallback(() => {
    router.push('/tasks?filter=overdue');
  }, [router]);

  const handleCompletedTap = useCallback(() => {
    router.push('/tasks?filter=completed');
  }, [router]);

  const handleBalanceTap = useCallback(() => {
    router.push('/balances?month=current');
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{currentUser?.name || 'User'}</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: currentUser?.color || '#3B82F6' }]}>
            <Text style={styles.avatarText}>
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.listBanner}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setShowListSwitcher(true);
          }}
          activeOpacity={0.7}
        >
          <Users size={16} color="#3B82F6" />
          <Text style={styles.listName}>{currentList?.name || 'List'}</Text>
          <Text style={styles.listMembers}>
            {currentListMembers.length} member{currentListMembers.length !== 1 ? 's' : ''}
          </Text>
          <ChevronDown size={16} color="#3B82F6" />
        </TouchableOpacity>

        <FundHero
          ledgerEntries={ledgerEntries}
          tasks={tasks}
          currentListId={currentListId}
          currencySymbol={currencySymbol}
        />

        <View style={styles.statsGrid}>
          <StatCard
            icon={<AlertCircle size={24} color={'#3B82F6'} />}
            label="Open Tasks"
            value={String(dashboardStats.openTasks)}
            color={'#3B82F6'}
            onPress={handleOpenTasksTap}
            testID="stat-open-tasks"
          />
          <StatCard
            icon={totalBalance >= 0 ? (
              <TrendingUp size={24} color={balanceColor} />
            ) : (
              <TrendingDown size={24} color={balanceColor} />
            )}
            label="Balance"
            value={`${balanceSign}${currencySymbol}${Math.abs(totalBalance).toFixed(2)}`}
            color={balanceColor}
            onPress={handleBalanceTap}
            testID="stat-balance"
          />
        </View>

        <SectionHeader 
          title="FUND GOALS" 
          subtitle={`${activeFundTargets.length} active`}
          action={{ label: 'Manage', onPress: () => router.push('/settings/funds') }}
        />

        {activeFundTargets.length > 0 && (
          <View style={styles.fundGoalsSection}>
            <View style={styles.fundGoalsHeader}>
              <Text style={styles.fundGoalsTitle}>Your Fund Goals</Text>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push('/settings/funds');
                }}
                activeOpacity={0.7}
              >
                <Target size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            {activeFundTargets.map((target) => {
              const targetAmountDollars = target.targetAmountCents ? target.targetAmountCents / 100 : undefined;
              const collectedAmountDollars = target.totalCollectedCents / 100;
              const linkedTasksCount = tasks.filter(t => t.fundTargetId === target.id).length;

              return (
                <StreaksFundCard
                  key={target.id}
                  emoji={target.emoji}
                  name={target.name}
                  description={target.description}
                  collectedAmount={collectedAmountDollars}
                  targetAmount={targetAmountDollars}
                  linkedTasksCount={linkedTasksCount}
                  currencySymbol={currencySymbol}
                  onPress={() => {
                    router.push(`/tasks?fundTargetId=${target.id}`);
                  }}
                />
              );
            })}
          </View>
        )}

        {activeFundTargets.length === 0 && (
          <View style={styles.emptyFundsState}>
            <View style={styles.emptyFundsIcon}>
              <Target size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyFundsTitle}>No Fund Goals Yet</Text>
            <Text style={styles.emptyFundsText}>
              Create fund goals to track your savings and achievements
            </Text>
            <TouchableOpacity
              style={styles.createFundButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                router.push('/settings/funds');
              }}
              activeOpacity={0.8}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.createFundButtonText}>Create Fund Goal</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showListSwitcher}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowListSwitcher(false)}
      >
        <View style={listSwitcherStyles.container}>
          <View style={listSwitcherStyles.header}>
            <Text style={listSwitcherStyles.title}>Switch List</Text>
            <TouchableOpacity
              style={listSwitcherStyles.closeButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowListSwitcher(false);
              }}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={listSwitcherStyles.scroll}
            contentContainerStyle={listSwitcherStyles.content}
          >
            {lists
              .filter((l) => !l.archived)
              .map((list) => {
                const listTasks = allTasks.filter((t) => t.listId === list.id);
                const openTasks = listTasks.filter(
                  (t) => t.status === 'pending' || t.status === 'overdue'
                ).length;
                const isActive = list.id === currentList?.id;

                return (
                  <TouchableOpacity
                    key={list.id}
                    style={[
                      listSwitcherStyles.listCard,
                      isActive && listSwitcherStyles.listCardActive,
                    ]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                      switchList(list.id);
                      setShowListSwitcher(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={listSwitcherStyles.listCardContent}>
                      <View style={listSwitcherStyles.listCardHeader}>
                        <Text
                          style={[
                            listSwitcherStyles.listCardName,
                            isActive && listSwitcherStyles.listCardNameActive,
                          ]}
                        >
                          {list.name}
                        </Text>
                        {isActive && (
                          <View style={listSwitcherStyles.activeIndicator}>
                            <Check size={16} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <View style={listSwitcherStyles.listCardMeta}>
                        <View style={listSwitcherStyles.listCardMetaItem}>
                          <Users size={14} color="#6B7280" />
                          <Text style={listSwitcherStyles.listCardMetaText}>
                            {list.memberIds.length} member{list.memberIds.length !== 1 ? 's' : ''}
                          </Text>
                        </View>
                        <View style={listSwitcherStyles.listCardMetaItem}>
                          <CheckSquare size={14} color="#6B7280" />
                          <Text style={listSwitcherStyles.listCardMetaText}>
                            {openTasks} open task{openTasks !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

            <TouchableOpacity
              style={listSwitcherStyles.createButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowListSwitcher(false);
                router.push('/settings/teams');
              }}
              activeOpacity={0.7}
            >
              <View style={listSwitcherStyles.createIcon}>
                <Plus size={20} color="#3B82F6" />
              </View>
              <Text style={listSwitcherStyles.createText}>Create New List</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600' as const,
  },
  listBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginBottom: 24,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E40AF',
    flex: 1,
  },
  listMembers: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },

  fundGoalsSection: {
    marginBottom: 24,
  },
  fundGoalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  fundGoalsTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#111827',
  },
  emptyFundsState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyFundsIcon: {
    marginBottom: 20,
    opacity: 0.3,
  },
  emptyFundsTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyFundsText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createFundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createFundButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});

const listSwitcherStyles = StyleSheet.create({
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
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  listCardContent: {
    gap: 12,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    flex: 1,
  },
  listCardNameActive: {
    color: '#1E40AF',
  },
  activeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCardMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  listCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listCardMetaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  createIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
});
