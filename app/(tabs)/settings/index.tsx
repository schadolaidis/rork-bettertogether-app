import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Bell,
  Users,
  ChevronRight,
  Share2,
  Check,
  List as ListIcon,
  Palette,
  Settings as SettingsIcon,
  LogOut,
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
    generateInviteLink,
    currentUserRole,
  } = useApp();
  const [copiedListId, setCopiedListId] = useState<string | null>(null);

  const handleGenerateInvite = async () => {
    if (!currentList) return;

    const inviteLink = generateInviteLink(currentList.id);
    if (!inviteLink) {
      Alert.alert('Error', 'Failed to generate invite link');
      return;
    }

    if (Platform.OS === 'web') {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedListId(currentList.id);
      setTimeout(() => setCopiedListId(null), 2000);
      Alert.alert('Success', 'Invite link copied to clipboard!');
    } else {
      try {
        await Share.share({
          message: `Join our list "${currentList.name}" on BetterTogether!\n\n${inviteLink}`,
          title: 'Join BetterTogether',
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    }
  };

  const handleSwitchList = (listId: string) => {
    if (listId === currentList?.id) return;
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    switchList(listId);
    Alert.alert('Success', 'Switched list successfully!');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={[styles.profileAvatar, { backgroundColor: currentUser?.color || '#3B82F6' }]}>
            <Text style={styles.profileAvatarText}>
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{currentUser?.email || 'No email set'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{currentUserRole}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current List</Text>
          <View style={styles.settingsList}>
            <SettingItem
              icon={<ListIcon size={20} color="#3B82F6" />}
              title={currentList?.name || 'No list selected'}
              subtitle={`${currentListMembers.length} members • ${currentList?.currencySymbol || '$'} ${currentList?.currency || 'USD'}`}
              onPress={() => Alert.alert('List Settings', 'Tap again to edit', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Edit', onPress: () => router.push('./list-settings' as any) },
              ])}
            />
            <SettingItem
              icon={<Share2 size={20} color="#10B981" />}
              title="Generate Invite Link"
              subtitle="Share with others to join"
              onPress={handleGenerateInvite}
              showChevron={false}
              rightContent={
                copiedListId === currentList?.id ? (
                  <Check size={20} color="#10B981" />
                ) : undefined
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Lists</Text>
          <View style={styles.settingsList}>
            {lists.filter(l => !l.archived).map((list) => {
              const isActive = list.id === currentList?.id;
              const members = list.memberIds.length;
              return (
                <SettingItem
                  key={list.id}
                  icon={<ListIcon size={20} color={isActive ? '#3B82F6' : '#6B7280'} />}
                  title={list.name}
                  subtitle={`${members} member${members !== 1 ? 's' : ''}`}
                  onPress={() => {
                    if (isActive) {
                      router.push('./list-settings' as any);
                    } else {
                      Alert.alert(
                        list.name,
                        'What would you like to do?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Switch to this list', onPress: () => handleSwitchList(list.id) },
                          { text: 'View settings', onPress: () => {
                            switchList(list.id);
                            router.push('./list-settings' as any);
                          }},
                        ]
                      );
                    }
                  }}
                  rightContent={
                    isActive ? (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Active</Text>
                      </View>
                    ) : (
                      <ChevronRight size={20} color="#9CA3AF" />
                    )
                  }
                />
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage</Text>
          <View style={styles.settingsList}>
            <SettingItem
              icon={<Palette size={20} color="#8B5CF6" />}
              title="Categories"
              subtitle="Manage task categories"
              onPress={() => {
                if (currentUserRole !== 'Owner' && !currentList?.allowMemberCategoryManage) {
                  Alert.alert(
                    'Permission Required',
                    'Only the list owner can manage categories. Ask the owner to enable member category management in List Settings.',
                    [{ text: 'OK' }]
                  );
                } else {
                  router.push('/(tabs)/settings/categories');
                }
              }}
            />
            <SettingItem
              icon={<Users size={20} color="#F59E0B" />}
              title="Team Members"
              subtitle={`${currentListMembers.length} members`}
              onPress={() => router.push('/(tabs)/settings/teams')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsList}>
            <SettingItem
              icon={<User size={20} color="#3B82F6" />}
              title="Profile"
              subtitle="Update your name and settings"
              onPress={() => router.push('./profile' as any)}
            />
            <SettingItem
              icon={<Bell size={20} color="#F59E0B" />}
              title="Notifications"
              subtitle="Manage push notifications"
              onPress={() => {
                Alert.alert('Coming Soon', 'Notification settings will be available soon!');
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingsList}>
            <SettingItem
              icon={<SettingsIcon size={20} color="#6B7280" />}
              title="App Settings"
              subtitle="Theme and preferences"
              onPress={() => {
                Alert.alert('Coming Soon', 'App settings will be available soon!');
              }}
            />
            <SettingItem
              icon={<LogOut size={20} color="#EF4444" />}
              title="Sign Out"
              subtitle="Log out of your account"
              onPress={() => {
                Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out', style: 'destructive' },
                ]);
              }}
              showChevron={false}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>BetterTogether v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for better collaboration</Text>
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
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
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
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 16,
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
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 8,
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
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
  activeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  footer: {
    alignItems: 'center' as const,
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
