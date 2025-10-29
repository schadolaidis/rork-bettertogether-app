import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Bell,
  CheckSquare,
  XCircle,
  AlertCircle,
  Users,
  DollarSign,
  Volume2,
  Hash,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface PreferenceSwitchProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  color?: string;
}

function PreferenceSwitch({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  color = '#3B82F6',
}: PreferenceSwitchProps) {
  return (
    <View style={styles.preferenceItem}>
      <View style={[styles.preferenceIcon, { backgroundColor: `${color}15` }]}>
        <>{icon}</>
      </View>
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(val) => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onValueChange(val);
        }}
        trackColor={{ false: '#E5E7EB', true: `${color}50` }}
        thumbColor={value ? color : '#FFFFFF'}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentUser, t } = useApp();
  const { preferences, updatePreferences, initializePreferences } = useNotifications();

  useEffect(() => {
    if (currentUser && !preferences) {
      initializePreferences(currentUser.id);
    }
  }, [currentUser, preferences, initializePreferences]);

  if (!preferences) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.back();
            }}
          >
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>{t.notifications.title}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t.common.loading}...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.back();
          }}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>{t.notifications.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.descriptionCard}>
          <Bell size={32} color="#3B82F6" />
          <Text style={styles.descriptionTitle}>{t.notifications.preferences}</Text>
          <Text style={styles.descriptionText}>{t.notifications.whatToNotify}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.tasks.title}</Text>
          <View style={styles.preferencesList}>
            <PreferenceSwitch
              icon={<CheckSquare size={20} color="#3B82F6" />}
              title={t.notifications.taskAssignments}
              subtitle="When someone assigns you a task"
              value={preferences.taskAssignments}
              onValueChange={(val) => updatePreferences({ taskAssignments: val })}
              color="#3B82F6"
            />
            <PreferenceSwitch
              icon={<CheckSquare size={20} color="#10B981" />}
              title={t.notifications.taskCompletions}
              subtitle="When a team member completes a task"
              value={preferences.taskCompletions}
              onValueChange={(val) => updatePreferences({ taskCompletions: val })}
              color="#10B981"
            />
            <PreferenceSwitch
              icon={<XCircle size={20} color="#EF4444" />}
              title={t.notifications.taskFailures}
              subtitle="When a task fails"
              value={preferences.taskFailures}
              onValueChange={(val) => updatePreferences({ taskFailures: val })}
              color="#EF4444"
            />
            <PreferenceSwitch
              icon={<AlertCircle size={20} color="#F59E0B" />}
              title={t.notifications.taskOverdueAlerts}
              subtitle="When your tasks become overdue"
              value={preferences.taskOverdue}
              onValueChange={(val) => updatePreferences({ taskOverdue: val })}
              color="#F59E0B"
            />
            <PreferenceSwitch
              icon={<Bell size={20} color="#8B5CF6" />}
              title={t.notifications.taskReminders}
              subtitle="Task deadline reminders"
              value={preferences.taskReminders}
              onValueChange={(val) => updatePreferences({ taskReminders: val })}
              color="#8B5CF6"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.teams.title}</Text>
          <View style={styles.preferencesList}>
            <PreferenceSwitch
              icon={<Users size={20} color="#06B6D4" />}
              title={t.notifications.memberActivity}
              subtitle="When members join or leave"
              value={preferences.memberActivity}
              onValueChange={(val) => updatePreferences({ memberActivity: val })}
              color="#06B6D4"
            />
            <PreferenceSwitch
              icon={<DollarSign size={20} color="#F59E0B" />}
              title={t.notifications.balanceUpdates}
              subtitle="When your balance changes"
              value={preferences.balanceUpdates}
              onValueChange={(val) => updatePreferences({ balanceUpdates: val })}
              color="#F59E0B"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.notifications.general}</Text>
          <View style={styles.preferencesList}>
            <PreferenceSwitch
              icon={<Volume2 size={20} color="#6B7280" />}
              title={t.notifications.enableSounds}
              subtitle="Play sounds for notifications"
              value={preferences.enableSounds}
              onValueChange={(val) => updatePreferences({ enableSounds: val })}
              color="#6B7280"
            />
            <PreferenceSwitch
              icon={<Hash size={20} color="#6B7280" />}
              title={t.notifications.enableBadges}
              subtitle="Show unread notification count"
              value={preferences.enableBadges}
              onValueChange={(val) => updatePreferences({ enableBadges: val })}
              color="#6B7280"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Changes are saved automatically
          </Text>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  descriptionText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center' as const,
    lineHeight: 22,
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
  preferencesList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  preferenceItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  preferenceSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    alignItems: 'center' as const,
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center' as const,
  },
});
