import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Notification, NotificationPreferences } from '@/types/notifications';
import { NotificationService } from '@/services/NotificationService';

const STORAGE_KEYS = {
  NOTIFICATIONS: '@bettertogether/notifications',
  NOTIFICATION_PREFS: '@bettertogether/notification_preferences',
};

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [toastNotification, setToastNotification] = useState<Notification | null>(null);

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const preferencesQuery = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFS);
      return stored ? JSON.parse(stored) : null;
    },
  });

  useEffect(() => {
    if (notificationsQuery.data) {
      setNotifications(notificationsQuery.data);
    }
  }, [notificationsQuery.data]);

  useEffect(() => {
    if (preferencesQuery.data) {
      setPreferences(preferencesQuery.data);
    }
  }, [preferencesQuery.data]);

  const { mutate: mutateNotifications } = useMutation({
    mutationFn: async (newNotifications: Notification[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newNotifications));
      return newNotifications;
    },
  });

  const { mutate: mutatePreferences } = useMutation({
    mutationFn: async (newPrefs: NotificationPreferences) => {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFS, JSON.stringify(newPrefs));
      return newPrefs;
    },
  });

  const addNotification = useCallback(
    (notification: Notification) => {
      if (preferences && !NotificationService.shouldNotify(notification, preferences)) {
        console.log('[Notifications] Skipped (user preference):', notification.type);
        return;
      }

      const updatedNotifications = [notification, ...notifications];
      setNotifications(updatedNotifications);
      mutateNotifications(updatedNotifications);

      if (preferences?.enableSounds && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setToastNotification(notification);
      setTimeout(() => setToastNotification(null), 5000);

      console.log('[Notifications] Added:', notification.type, notification.title);
    },
    [notifications, preferences, mutateNotifications]
  );

  const markAsRead = useCallback(
    (notificationId: string) => {
      const updatedNotifications = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
      mutateNotifications(updatedNotifications);
      console.log('[Notifications] Marked as read:', notificationId);
    },
    [notifications, mutateNotifications]
  );

  const markAllAsRead = useCallback(() => {
    const updatedNotifications = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    mutateNotifications(updatedNotifications);
    console.log('[Notifications] Marked all as read');
  }, [notifications, mutateNotifications]);

  const deleteNotification = useCallback(
    (notificationId: string) => {
      const updatedNotifications = notifications.filter((n) => n.id !== notificationId);
      setNotifications(updatedNotifications);
      mutateNotifications(updatedNotifications);
      console.log('[Notifications] Deleted:', notificationId);
    },
    [notifications, mutateNotifications]
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
    mutateNotifications([]);
    console.log('[Notifications] Cleared all');
  }, [mutateNotifications]);

  const updatePreferences = useCallback(
    (updates: Partial<NotificationPreferences>) => {
      if (!preferences) return;
      
      const updatedPrefs = { ...preferences, ...updates };
      setPreferences(updatedPrefs);
      mutatePreferences(updatedPrefs);
      console.log('[Notifications] Updated preferences');
    },
    [preferences, mutatePreferences]
  );

  const initializePreferences = useCallback(
    (userId: string) => {
      if (!preferences) {
        const defaultPrefs = NotificationService.getDefaultPreferences(userId);
        setPreferences(defaultPrefs);
        mutatePreferences(defaultPrefs);
        console.log('[Notifications] Initialized preferences for user:', userId);
      }
    },
    [preferences, mutatePreferences]
  );

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const groupedNotifications = useMemo(() => {
    return NotificationService.groupByDate(notifications);
  }, [notifications]);

  const dismissToast = useCallback(() => {
    setToastNotification(null);
  }, []);

  return useMemo(
    () => ({
      notifications,
      groupedNotifications,
      unreadCount,
      preferences,
      toastNotification,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      updatePreferences,
      initializePreferences,
      dismissToast,
      isLoading: notificationsQuery.isLoading || preferencesQuery.isLoading,
    }),
    [
      notifications,
      groupedNotifications,
      unreadCount,
      preferences,
      toastNotification,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      updatePreferences,
      initializePreferences,
      dismissToast,
      notificationsQuery.isLoading,
      preferencesQuery.isLoading,
    ]
  );
});
