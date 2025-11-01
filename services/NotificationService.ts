import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static initialized = false;
  private static scheduledNotifications = new Map<string, string>();

  static async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    if (Platform.OS === 'web') {
      console.log('[Notifications] Web platform detected - limited notification support');
      this.initialized = true;
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Notifications] Permission not granted');
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('tasks', {
          name: 'Tasks',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3B82F6',
        });
      }

      this.initialized = true;
      console.log('[Notifications] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[Notifications] Initialization error:', error);
      return false;
    }
  }

  static async scheduleTaskReminder(task: Task): Promise<string | null> {
    if (!this.initialized || Platform.OS === 'web') {
      return null;
    }

    try {
      await this.cancelTaskNotifications(task.id);

      const taskDate = new Date(task.endAt);
      const now = new Date();

      if (taskDate.getTime() <= now.getTime()) {
        console.log('[Notifications] Task date is in the past, skipping');
        return null;
      }

      let triggerDate: Date | null = null;
      let notificationBody = `Due: ${taskDate.toLocaleString()}`;

      switch (task.reminder) {
        case 'at_due':
          triggerDate = taskDate;
          notificationBody = 'This task is due now!';
          break;
        case '30_min':
          triggerDate = new Date(taskDate.getTime() - 30 * 60 * 1000);
          notificationBody = 'Due in 30 minutes';
          break;
        case 'custom':
          if (task.customReminderMinutes && task.customReminderMinutes > 0) {
            triggerDate = new Date(taskDate.getTime() - task.customReminderMinutes * 60 * 1000);
            notificationBody = `Due in ${task.customReminderMinutes} minutes`;
          }
          break;
        case 'none':
        default:
          return null;
      }

      if (!triggerDate || triggerDate.getTime() <= now.getTime()) {
        console.log('[Notifications] Trigger date is in the past, skipping');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${task.title}`,
          body: notificationBody,
          data: { taskId: task.id },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: triggerDate,
          channelId: 'tasks',
        },
      });

      this.scheduledNotifications.set(task.id, notificationId);
      console.log(`[Notifications] Scheduled for task ${task.id} at ${triggerDate.toLocaleString()}`);
      return notificationId;
    } catch (error) {
      console.error('[Notifications] Error scheduling:', error);
      return null;
    }
  }

  static async cancelTaskNotifications(taskId: string): Promise<void> {
    if (!this.initialized || Platform.OS === 'web') {
      return;
    }

    try {
      const notificationId = this.scheduledNotifications.get(taskId);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        this.scheduledNotifications.delete(taskId);
        console.log(`[Notifications] Cancelled for task ${taskId}`);
      }
    } catch (error) {
      console.error('[Notifications] Error cancelling:', error);
    }
  }

  static async sendTaskOverdueNotification(task: Task): Promise<void> {
    if (!this.initialized || Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Task Overdue',
          body: `"${task.title}" is now overdue! Complete it before grace period ends.`,
          data: { taskId: task.id },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
      console.log(`[Notifications] Sent overdue notification for ${task.id}`);
    } catch (error) {
      console.error('[Notifications] Error sending overdue notification:', error);
    }
  }

  static async sendTaskFailedNotification(task: Task, stakeAmount: number): Promise<void> {
    if (!this.initialized || Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '❌ Task Failed',
          body: `"${task.title}" has failed. Stake of $${stakeAmount} applied.`,
          data: { taskId: task.id },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
      console.log(`[Notifications] Sent failed notification for ${task.id}`);
    } catch (error) {
      console.error('[Notifications] Error sending failed notification:', error);
    }
  }

  static async sendTaskCompletedNotification(task: Task): Promise<void> {
    if (!this.initialized || Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Task Completed',
          body: `Great job! "${task.title}" has been completed.`,
          data: { taskId: task.id },
          sound: true,
        },
        trigger: null,
      });
      console.log(`[Notifications] Sent completion notification for ${task.id}`);
    } catch (error) {
      console.error('[Notifications] Error sending completion notification:', error);
    }
  }

  static async sendFundGoalReachedNotification(fundName: string, fundEmoji: string, amount: number): Promise<void> {
    if (!this.initialized || Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${fundEmoji} Fund Goal Reached!`,
          body: `Congratulations! "${fundName}" has reached its goal of $${amount.toFixed(2)}!`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
      console.log(`[Notifications] Sent fund goal reached notification for ${fundName}`);
    } catch (error) {
      console.error('[Notifications] Error sending fund goal notification:', error);
    }
  }

  static async sendDailySummaryNotification(stats: {
    openTasks: number;
    overdueTasks: number;
    totalBalance: number;
  }): Promise<void> {
    if (!this.initialized || Platform.OS === 'web') {
      return;
    }

    try {
      const balanceEmoji = stats.totalBalance < 0 ? '💰' : stats.totalBalance > 0 ? '📉' : '⚖️';
      const body = `${stats.openTasks} open tasks, ${stats.overdueTasks} overdue. Balance: ${balanceEmoji} $${Math.abs(stats.totalBalance).toFixed(2)}`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Daily Summary',
          body,
          sound: false,
        },
        trigger: null,
      });
      console.log('[Notifications] Sent daily summary');
    } catch (error) {
      console.error('[Notifications] Error sending daily summary:', error);
    }
  }

  static async scheduleDailySummary(): Promise<void> {
    if (!this.initialized || Platform.OS === 'web') {
      return;
    }

    try {
      await this.cancelDailySummary();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Daily Task Summary',
          body: 'Check your tasks and balance for today',
          sound: false,
          data: { type: 'daily_summary' },
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
          channelId: 'tasks',
        },
      });

      console.log('[Notifications] Scheduled daily summary at 9:00 AM');
    } catch (error) {
      console.error('[Notifications] Error scheduling daily summary:', error);
    }
  }

  static async cancelDailySummary(): Promise<void> {
    if (!this.initialized || Platform.OS === 'web') {
      return;
    }

    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const dailySummaryNotifications = scheduled.filter(
        (notification) => notification.content.data?.type === 'daily_summary'
      );

      for (const notification of dailySummaryNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      console.log('[Notifications] Cancelled daily summary');
    } catch (error) {
      console.error('[Notifications] Error cancelling daily summary:', error);
    }
  }

  static async clearAllNotifications(): Promise<void> {
    if (!this.initialized || Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.dismissAllNotificationsAsync();
      this.scheduledNotifications.clear();
      console.log('[Notifications] Cleared all notifications');
    } catch (error) {
      console.error('[Notifications] Error clearing notifications:', error);
    }
  }

  static addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  static addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}
