import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { Bell, CheckCircle, AlertCircle, Target } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { NotificationService } from '@/services/NotificationService';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [permissionStatus, setPermissionStatus] = useState<string>('loading');
  const [taskRemindersEnabled, setTaskRemindersEnabled] = useState(true);
  const [overdueAlertsEnabled, setOverdueAlertsEnabled] = useState(true);
  const [fundGoalsEnabled, setFundGoalsEnabled] = useState(true);
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    if (Platform.OS === 'web') {
      setPermissionStatus('not_supported');
      return;
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('[Notifications] Error checking permission:', error);
      setPermissionStatus('error');
    }
  };

  const requestPermission = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Not Available',
        'Notifications are not supported on web platform.'
      );
      return;
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        await NotificationService.initialize();
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Success', 'Notifications enabled successfully!');
      } else {
        Alert.alert(
          'Permission Denied',
          'Please enable notifications in your device settings to receive task reminders and updates.'
        );
      }
    } catch (error) {
      console.error('[Notifications] Error requesting permission:', error);
      Alert.alert('Error', 'Failed to request notification permission');
    }
  };

  const toggleDailySummary = async () => {
    const newValue = !dailySummaryEnabled;
    setDailySummaryEnabled(newValue);

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (newValue) {
      await NotificationService.scheduleDailySummary();
      Alert.alert(
        'Daily Summary Enabled',
        'You will receive a daily summary at 9:00 AM'
      );
    } else {
      await NotificationService.clearAllNotifications();
      Alert.alert('Daily Summary Disabled', 'Daily summary notifications turned off');
    }
  };

  const toggleSetting = (
    currentValue: boolean,
    setter: (value: boolean) => void
  ) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setter(!currentValue);
  };

  const renderPermissionStatus = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.statusCard}>
          <AlertCircle size={24} color="#F59E0B" />
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>Not Available on Web</Text>
            <Text style={styles.statusText}>
              Notifications are only supported on mobile devices. Please use the mobile app to enable notifications.
            </Text>
          </View>
        </View>
      );
    }

    if (permissionStatus === 'loading') {
      return (
        <View style={styles.statusCard}>
          <Text style={styles.statusText}>Checking permission...</Text>
        </View>
      );
    }

    if (permissionStatus === 'granted') {
      return (
        <View style={[styles.statusCard, styles.statusCardSuccess]}>
          <CheckCircle size={24} color="#10B981" />
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>Notifications Enabled</Text>
            <Text style={styles.statusText}>
              You will receive task reminders and important updates
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.statusCard}>
        <AlertCircle size={24} color="#EF4444" />
        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>Notifications Disabled</Text>
          <Text style={styles.statusText}>
            Enable notifications to receive task reminders and updates
          </Text>
          <TouchableOpacity
            style={styles.enableButton}
            onPress={requestPermission}
            activeOpacity={0.7}
          >
            <Text style={styles.enableButtonText}>Enable Notifications</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    disabled: boolean = false
  ) => (
    <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <View style={styles.settingIconContainer}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>
          {title}
        </Text>
        <Text style={[styles.settingDescription, disabled && styles.settingDescriptionDisabled]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || Platform.OS === 'web'}
        trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
        thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
        ios_backgroundColor="#D1D5DB"
      />
    </View>
  );

  const isDisabled = permissionStatus !== 'granted' || Platform.OS === 'web';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderPermissionStatus()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATION TYPES</Text>
          <View style={styles.settingsList}>
            {renderSettingItem(
              <Bell size={20} color={isDisabled ? '#9CA3AF' : '#3B82F6'} />,
              'Task Reminders',
              'Get notified before tasks are due',
              taskRemindersEnabled,
              () => toggleSetting(taskRemindersEnabled, setTaskRemindersEnabled),
              isDisabled
            )}
            {renderSettingItem(
              <AlertCircle size={20} color={isDisabled ? '#9CA3AF' : '#EF4444'} />,
              'Overdue Alerts',
              'Receive alerts when tasks become overdue',
              overdueAlertsEnabled,
              () => toggleSetting(overdueAlertsEnabled, setOverdueAlertsEnabled),
              isDisabled
            )}
            {renderSettingItem(
              <Target size={20} color={isDisabled ? '#9CA3AF' : '#10B981'} />,
              'Fund Goal Updates',
              'Get notified when fund goals are reached',
              fundGoalsEnabled,
              () => toggleSetting(fundGoalsEnabled, setFundGoalsEnabled),
              isDisabled
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DAILY DIGEST</Text>
          <View style={styles.settingsList}>
            {renderSettingItem(
              <CheckCircle size={20} color={isDisabled ? '#9CA3AF' : '#8B5CF6'} />,
              'Daily Summary',
              'Receive a summary of your tasks at 9:00 AM',
              dailySummaryEnabled,
              toggleDailySummary,
              isDisabled
            )}
          </View>
        </View>

        {Platform.OS === 'web' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Notifications are only available on mobile devices. Install the app on your phone to enable notifications.
            </Text>
          </View>
        )}

        {permissionStatus === 'granted' && Platform.OS !== 'web' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ These settings control which types of notifications you receive. You can also manage notifications in your device settings.
            </Text>
          </View>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusCardSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusContent: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  enableButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    alignSelf: 'flex-start' as const,
  },
  enableButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemDisabled: {
    opacity: 0.5,
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
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  settingTitleDisabled: {
    color: '#9CA3AF',
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  settingDescriptionDisabled: {
    color: '#D1D5DB',
  },
  infoBox: {
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
});
