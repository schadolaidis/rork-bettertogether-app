import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  Users,
  ChevronRight,
  Palette,
  LogOut,
  Languages,
  Target,
  Briefcase,
  Info,
  Menu,
  User,
  Code2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { DesignTokens } from '@/constants/design-tokens';
import { SectionHeader } from '@/components/design-system/SectionHeader';
import { GroupCard } from '@/components/design-system/GroupCard';
import { DisclosureRow } from '@/components/design-system/DisclosureRow';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    currentUser,
    currentList,
    currentListMembers,
    lists,
    switchList,
    currentUserRole,
    language,
    t,
    changeLanguage,
  } = useApp();

  const [expandedWorkspace, setExpandedWorkspace] = useState(false);

  const handleSwitchList = (listId: string) => {
    if (listId === currentList?.id) {
      setExpandedWorkspace(false);
      return;
    }
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    switchList(listId);
    setExpandedWorkspace(false);
    Alert.alert(t.alerts.success, t.alerts.listSwitched);
  };

  const activeLists = lists.filter(l => !l.archived);
  const hasMultipleLists = activeLists.length > 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.settings.title}</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={styles.profileCard}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.push('./profile' as any);
          }}
          activeOpacity={0.8}
        >
          {currentUser?.avatar || currentUser?.avatarUrl ? (
            <Image 
              source={{ uri: currentUser.avatar || currentUser.avatarUrl }} 
              style={styles.profileAvatar}
            />
          ) : (
            <View style={[styles.profileAvatar, { backgroundColor: currentUser?.color || DesignTokens.colors.primary[500] }]}>
              <Text style={styles.profileAvatarText}>
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{currentUser?.email || 'Tap to set up profile'}</Text>
          </View>
          <ChevronRight size={20} color={DesignTokens.colors.neutral[400]} />
        </TouchableOpacity>

        <SectionHeader 
          title="ACCOUNT" 
          testID="section-account"
        />
        <GroupCard style={{ marginHorizontal: DesignTokens.spacing.xl, marginBottom: DesignTokens.spacing.xl }}>
          <DisclosureRow
            icon={<User size={20} color={DesignTokens.colors.primary[500]} />}
            label="Profile"
            subtitle="Name, email, and avatar"
            onPress={() => router.push('./profile' as any)}
            isFirst
            testID="row-profile"
          />
          <DisclosureRow
            icon={<Languages size={20} color={DesignTokens.colors.success[500]} />}
            label={t.settings.language}
            value={language === 'en' ? 'English' : 'Deutsch'}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              Alert.alert(
                t.settings.language,
                t.settings.changeLanguage,
                [
                  { text: t.common.cancel, style: 'cancel' },
                  { text: t.settings.english, onPress: () => changeLanguage('en') },
                  { text: t.settings.german, onPress: () => changeLanguage('de') },
                ]
              );
            }}
            testID="row-language"
          />
          <DisclosureRow
            icon={<Bell size={20} color={DesignTokens.colors.warning[500]} />}
            label={t.settings.notifications}
            subtitle={t.settings.manageNotifications}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/(tabs)/settings/notifications');
            }}
            isLast
            testID="row-notifications"
          />
        </GroupCard>

        <SectionHeader 
          title="WORKSPACE" 
          subtitle={currentList?.name || 'No workspace'}
          action={hasMultipleLists ? {
            label: expandedWorkspace ? 'Collapse' : 'Switch',
            onPress: () => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setExpandedWorkspace(!expandedWorkspace);
            }
          } : undefined}
          testID="section-workspace"
        />

        {expandedWorkspace && hasMultipleLists && (
          <View style={styles.workspacePicker}>
            {activeLists.map((list, index) => {
              const isActive = list.id === currentList?.id;
              const isFirst = index === 0;
              const isLast = index === activeLists.length - 1;
              
              return (
                <TouchableOpacity
                  key={list.id}
                  style={[
                    styles.workspaceOption,
                    isActive && styles.workspaceOptionActive,
                    isFirst && styles.workspaceOptionFirst,
                    isLast && styles.workspaceOptionLast,
                  ]}
                  onPress={() => handleSwitchList(list.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.workspaceOptionIcon}>
                    <Briefcase size={20} color={isActive ? DesignTokens.colors.primary[500] : DesignTokens.colors.neutral[500]} />
                  </View>
                  <View style={styles.workspaceOptionContent}>
                    <Text style={[styles.workspaceOptionName, isActive && styles.workspaceOptionNameActive]}>
                      {list.name}
                    </Text>
                    <Text style={styles.workspaceOptionMeta}>
                      {list.memberIds.length} {list.memberIds.length === 1 ? 'member' : 'members'} • {list.currencySymbol}{list.currency}
                    </Text>
                  </View>
                  {isActive && (
                    <View style={styles.workspaceActiveIndicator}>
                      <Text style={styles.workspaceActiveText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <GroupCard style={{ marginHorizontal: DesignTokens.spacing.xl, marginBottom: DesignTokens.spacing.xl }}>
          <DisclosureRow
            icon={<Menu size={20} color={DesignTokens.colors.primary[500]} />}
            label="Workspace Settings"
            subtitle="Currency, defaults, and permissions"
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/(tabs)/settings/list-settings');
            }}
            isFirst
            testID="row-workspace-settings"
          />
          <DisclosureRow
            icon={<Palette size={20} color={DesignTokens.colors.purple[500]} />}
            label={t.settings.categories}
            subtitle={t.settings.manageCategories}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              if (currentUserRole !== 'Owner' && !currentList?.allowMemberCategoryManage) {
                Alert.alert(
                  t.settings.permissionRequired,
                  t.settings.ownerOnly,
                  [{ text: t.common.ok }]
                );
              } else {
                router.push('/(tabs)/settings/categories');
              }
            }}
            testID="row-categories"
          />
          <DisclosureRow
            icon={<Users size={20} color={DesignTokens.colors.warning[500]} />}
            label={t.settings.teamMembers}
            value={`${currentListMembers.length}`}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/(tabs)/settings/teams');
            }}
            testID="row-team-members"
          />
          <DisclosureRow
            icon={<Target size={20} color={DesignTokens.colors.success[500]} />}
            label="Fund Manager"
            subtitle="Manage fund goals"
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/(tabs)/settings/funds');
            }}
            isLast
            testID="row-fund-manager"
          />
        </GroupCard>

        <SectionHeader 
          title="DEVELOPMENT" 
          testID="section-development"
        />
        <GroupCard style={{ marginHorizontal: DesignTokens.spacing.xl, marginBottom: DesignTokens.spacing.xl }}>
          <DisclosureRow
            icon={<Code2 size={20} color={DesignTokens.colors.primary[500]} />}
            label="Modal Input Demo"
            subtitle="Test new centered modal system"
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/modal-demo' as any);
            }}
            isFirst
            isLast
            testID="row-modal-demo"
          />
        </GroupCard>

        <SectionHeader 
          title="ABOUT" 
          testID="section-about"
        />
        <GroupCard style={{ marginHorizontal: DesignTokens.spacing.xl, marginBottom: DesignTokens.spacing.xl }}>
          <DisclosureRow
            icon={<Info size={20} color={DesignTokens.colors.neutral[500]} />}
            label="App Info"
            value="Version 1.0.0"
            onPress={() => {}}
            showChevron={false}
            isFirst
            testID="row-app-info"
          />
          <DisclosureRow
            icon={<LogOut size={20} color={DesignTokens.colors.error[500]} />}
            label={t.settings.signOut}
            subtitle="Sign out of your account"
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              Alert.alert(t.settings.signOut, t.alerts.areYouSure, [
                { text: t.common.cancel, style: 'cancel' },
                { text: t.settings.signOut, style: 'destructive' },
              ]);
            }}
            showChevron={false}
            isLast
            testID="row-sign-out"
          />
        </GroupCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.neutral[50],
  },
  header: {
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingTop: DesignTokens.spacing.sm,
    paddingBottom: DesignTokens.spacing.lg,
    backgroundColor: DesignTokens.colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[200],
  },
  title: {
    ...DesignTokens.typography.displayMedium,
    color: DesignTokens.colors.neutral[900],
    marginBottom: DesignTokens.spacing.xs,
  },
  subtitle: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[500],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: DesignTokens.spacing.xl,
    paddingBottom: DesignTokens.spacing.xxxl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing.lg,
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    marginHorizontal: DesignTokens.spacing.xl,
    marginBottom: DesignTokens.spacing.xl,
    ...DesignTokens.shadow.sm,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.md,
  },
  profileAvatarText: {
    color: DesignTokens.colors.neutral[0],
    fontSize: 26,
    fontWeight: '700' as const,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...DesignTokens.typography.headingSmall,
    color: DesignTokens.colors.neutral[900],
    marginBottom: 2,
  },
  profileEmail: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[500],
  },
  workspacePicker: {
    marginHorizontal: DesignTokens.spacing.xl,
    marginBottom: DesignTokens.spacing.xl,
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.sm,
  },
  workspaceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing.md,
    paddingHorizontal: DesignTokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[100],
  },
  workspaceOptionFirst: {
    borderTopLeftRadius: DesignTokens.radius.lg,
    borderTopRightRadius: DesignTokens.radius.lg,
  },
  workspaceOptionLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: DesignTokens.radius.lg,
    borderBottomRightRadius: DesignTokens.radius.lg,
  },
  workspaceOptionActive: {
    backgroundColor: DesignTokens.colors.primary[50],
  },
  workspaceOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.md,
  },
  workspaceOptionContent: {
    flex: 1,
  },
  workspaceOptionName: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[900],
    fontWeight: '600',
    marginBottom: 2,
  },
  workspaceOptionNameActive: {
    color: DesignTokens.colors.primary[600],
  },
  workspaceOptionMeta: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[500],
  },
  workspaceActiveIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DesignTokens.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  workspaceActiveText: {
    color: DesignTokens.colors.neutral[0],
    fontSize: 14,
    fontWeight: '700' as const,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing.xxxl,
  },
  footerText: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[400],
  },
});
