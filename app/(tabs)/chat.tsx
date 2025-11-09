import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { MessageCircle, Target } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { DesignTokens } from '@/constants/design-tokens';
import { ChatTab } from '@/components/ChatTab';

type ViewMode = 'list' | 'chat';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { fundTargets, currentList } = useApp();
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  React.useEffect(() => {
    console.log('--- CHAT SCREEN: MOUNTED ---');
    return () => {
      console.log('!!! CHAT SCREEN: UNMOUNTED !!!');
    };
  }, []);

  const activeFunds = useMemo(() => {
    return fundTargets.filter(fund => fund.totalCollectedCents > 0 || fund.targetAmountCents);
  }, [fundTargets]);

  const handleSelectFund = (fundId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedFundId(fundId);
    setViewMode('chat');
  };

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setViewMode('list');
    setSelectedFundId(null);
  };

  const selectedFund = useMemo(() => {
    return fundTargets.find(f => f.id === selectedFundId);
  }, [fundTargets, selectedFundId]);

  if (viewMode === 'chat' && selectedFundId && selectedFund) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.chatHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatHeaderEmoji}>{selectedFund.emoji}</Text>
              <View>
                <Text style={styles.chatHeaderTitle}>{selectedFund.name}</Text>
                <Text style={styles.chatHeaderSubtitle}>Team Chat</Text>
              </View>
            </View>
          </View>
          <ChatTab goalId={selectedFundId} />
        </View>
      </>
    );
  }

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
            <Text style={styles.title}>Chat</Text>
            <Text style={styles.subtitle}>
              {currentList?.name || 'Your List'} • Team Communication
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeFunds.length === 0 ? (
            <View style={styles.emptyState}>
              <MessageCircle size={64} color={DesignTokens.colors.neutral[300]} />
              <Text style={styles.emptyText}>No Active Chats Yet</Text>
              <Text style={styles.emptySubtext}>
                Create fund goals to enable team chat for each goal
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push('/funds');
                }}
              >
                <Target size={20} color={DesignTokens.colors.neutral[0]} />
                <Text style={styles.emptyButtonText}>Go to Fund Goals</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fundsList}>
              <Text style={styles.sectionTitle}>Active Fund Goals</Text>
              <Text style={styles.sectionSubtitle}>
                Select a fund goal to chat with your team
              </Text>
              {activeFunds.map((fund) => {
                const totalAmount = fund.totalCollectedCents / 100;
                const targetAmountValue = fund.targetAmountCents
                  ? fund.targetAmountCents / 100
                  : undefined;
                const currencySymbol = currentList?.currencySymbol || '$';

                return (
                  <TouchableOpacity
                    key={fund.id}
                    style={styles.fundCard}
                    onPress={() => handleSelectFund(fund.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.fundCardContent}>
                      <View style={styles.fundEmojiContainer}>
                        <Text style={styles.fundEmoji}>{fund.emoji}</Text>
                      </View>
                      <View style={styles.fundInfo}>
                        <Text style={styles.fundName} numberOfLines={1}>
                          {fund.name}
                        </Text>
                        <View style={styles.fundMeta}>
                          <Text style={styles.fundAmount}>
                            {currencySymbol}{totalAmount.toFixed(2)}
                            {targetAmountValue && (
                              <Text style={styles.fundTarget}>
                                {' / '}{currencySymbol}{targetAmountValue.toFixed(2)}
                              </Text>
                            )}
                          </Text>
                        </View>
                      </View>
                      <MessageCircle
                        size={24}
                        color={DesignTokens.colors.primary[500]}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
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
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingVertical: DesignTokens.spacing.lg,
    backgroundColor: DesignTokens.colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[200],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.neutral[100],
  },
  backButtonText: {
    fontSize: 24,
    color: DesignTokens.colors.neutral[900],
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
  },
  chatHeaderEmoji: {
    fontSize: 32,
  },
  chatHeaderTitle: {
    ...DesignTokens.typography.headingMedium,
    color: DesignTokens.colors.neutral[900],
  },
  chatHeaderSubtitle: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[600],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: DesignTokens.spacing.xl,
    paddingBottom: DesignTokens.spacing.xxxl * 1.5,
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
    fontWeight: '700' as const,
    color: DesignTokens.colors.neutral[0],
  },
  fundsList: {
    gap: DesignTokens.spacing.md,
  },
  sectionTitle: {
    ...DesignTokens.typography.headingMedium,
    color: DesignTokens.colors.neutral[900],
    marginBottom: DesignTokens.spacing.xs,
  },
  sectionSubtitle: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[600],
    marginBottom: DesignTokens.spacing.lg,
  },
  fundCard: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.xl,
    padding: DesignTokens.spacing.xl,
    marginBottom: DesignTokens.spacing.md,
    ...DesignTokens.shadow.md,
  },
  fundCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
  },
  fundEmojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DesignTokens.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  fundEmoji: {
    fontSize: 28,
  },
  fundInfo: {
    flex: 1,
  },
  fundName: {
    ...DesignTokens.typography.headingSmall,
    color: DesignTokens.colors.neutral[900],
    marginBottom: DesignTokens.spacing.xs,
  },
  fundMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
  },
  fundAmount: {
    ...DesignTokens.typography.bodyMedium,
    fontWeight: '700' as const,
    color: DesignTokens.colors.primary[500],
  },
  fundTarget: {
    fontWeight: '600' as const,
    color: DesignTokens.colors.neutral[500],
  },
});
