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
  List as ListIcon,
  Palette,
  Settings as SettingsIcon,
  LogOut,
  Languages,
  Target,
  Briefcase,
  Info,
  Menu,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  rightContent?: React.ReactNode;
}

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  rightContent,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      activeOpacity={0.7}
    >
      <View style={styles.settingIconContainer}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightContent || (showChevron && <ChevronRight size={20} color="#9CA3AF" />)}
    </TouchableOpacity>
  );
}

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
  const [showListPicker, setShowListPicker] = useState(false);

  const handleSwitchList = (listId: string) => {
    if (listId === currentList?.id) {
      setShowListPicker(false);
      return;
    }
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    switchList(listId);
    setShowListPicker(false);
    Alert.alert(t.alerts.success, t.alerts.listSwitched);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t.settings.title}</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={styles.profileCard}
          onPress={() => router.push('./profile' as any)}
          activeOpacity={0.8}
        >
          {currentUser?.avatar || currentUser?.avatarUrl ? (
            <Image 
              source={{ uri: currentUser.avatar || currentUser.avatarUrl }} 
              style={styles.profileAvatar}
            />
          ) : (
            <View style={[styles.profileAvatar, { backgroundColor: currentUser?.color || '#3B82F6' }]}>
              <Text style={styles.profileAvatarText}>
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{currentUser?.email || 'Tap to set up profile'}</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.settingsList}>
            <SettingItem
              icon={<Languages size={20} color="#10B981" />}
              title={t.settings.language}
              subtitle={language === 'en' ? 'English' : 'Deutsch'}
              onPress={() => {
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
            />
            <SettingItem
              icon={<Bell size={20} color="#F59E0B" />}
              title={t.settings.notifications}
              subtitle={t.settings.manageNotifications}
              onPress={() => router.push('/(tabs)/settings/notifications')}
            />
            <SettingItem
              icon={<SettingsIcon size={20} color="#6B7280" />}
              title="Preferences"
              subtitle="Theme and app settings"
              onPress={() => Alert.alert(t.alerts.comingSoon, t.alerts.featureComingSoon)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CURRENT WORKSPACE</Text>
            <TouchableOpacity onPress={() => setShowListPicker(!showListPicker)}>
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.workspaceCard}>
            <View style={styles.workspaceIconContainer}>
              <Briefcase size={24} color="#3B82F6" />
            </View>
            <View style={styles.workspaceInfo}>
              <Text style={styles.workspaceName}>{currentList?.name || 'No workspace'}</Text>
              <Text style={styles.workspaceDetails}>
                {currentListMembers.length} {currentListMembers.length === 1 ? 'member' : 'members'} • {currentList?.currencySymbol}{currentList?.currency}
              </Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{currentUserRole}</Text>
              </View>
            </View>
          </View>

          {showListPicker && lists.filter(l => !l.archived).length > 1 && (
            <View style={styles.listPicker}>
              {lists.filter(l => !l.archived).map((list) => {
                const isActive = list.id === currentList?.id;
                return (
                  <TouchableOpacity
                    key={list.id}
                    style={[styles.listOption, isActive && styles.listOptionActive]}
                    onPress={() => handleSwitchList(list.id)}
                  >
                    <ListIcon size={18} color={isActive ? '#3B82F6' : '#6B7280'} />
                    <Text style={[styles.listOptionText, isActive && styles.listOptionTextActive]}>
                      {list.name}
                    </Text>
                    {isActive && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.settingsList}>
            <SettingItem
              icon={<Menu size={20} color="#3B82F6" />}
              title="Workspace Settings"
              subtitle="Currency, defaults, and permissions"
              onPress={() => router.push('/(tabs)/settings/list-settings')}
            />
            <SettingItem
              icon={<Palette size={20} color="#8B5CF6" />}
              title={t.settings.categories}
              subtitle={t.settings.manageCategories}
              onPress={() => {
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
            />
            <SettingItem
              icon={<Users size={20} color="#F59E0B" />}
              title={t.settings.teamMembers}
              subtitle={`${currentListMembers.length} ${currentListMembers.length === 1 ? 'member' : 'members'}`}
              onPress={() => router.push('/(tabs)/settings/teams')}
            />
            <SettingItem
              icon={<Target size={20} color="#10B981" />}
              title="Fund Manager"
              subtitle="Manage fund goals"
              onPress={() => router.push('/(tabs)/settings/funds')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.settingsList}>
            <SettingItem
              icon={<Info size={20} color="#6B7280" />}
              title="App Info"
              subtitle="Version 1.0.0"
              onPress={() => {}}
              showChevron={false}
            />
            <SettingItem
              icon={<LogOut size={20} color="#EF4444" />}
              title={t.settings.signOut}
              subtitle="Sign out of your account"
              onPress={() => {
                Alert.alert(t.settings.signOut, t.alerts.areYouSure, [
                  { text: t.common.cancel, style: 'cancel' },
                  { text: t.settings.signOut, style: 'destructive' },
                ]);
              }}
              showChevron={false}
            />
          </View>
        </View>

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
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700' as const,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  roleBadge: {
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#9CA3AF',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2,
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  settingsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  workspaceCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  workspaceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  workspaceInfo: {
    flex: 1,
  },
  workspaceName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  workspaceDetails: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  listPicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  listOptionActive: {
    backgroundColor: '#EFF6FF',
  },
  listOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  listOptionTextActive: {
    color: '#3B82F6',
    fontWeight: '600' as const,
  },
  checkmark: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '700' as const,
  },
  footer: {
    alignItems: 'center' as const,
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});
