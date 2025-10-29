import { Notification, NotificationType, NotificationPriority, NotificationPreferences } from '@/types/notifications';
import { Task, User } from '@/types';
import { Translations } from '@/constants/translations';

export class NotificationService {
  static create(
    type: NotificationType,
    userId: string,
    listId: string,
    priority: NotificationPriority,
    title: string,
    message: string,
    taskId?: string,
    actorId?: string,
    metadata?: Record<string, any>
  ): Notification {
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      userId,
      listId,
      taskId,
      actorId,
      priority,
      read: false,
      createdAt: new Date().toISOString(),
      metadata,
    };
  }

  static createTaskAssignedNotification(
    task: Task,
    assignedUserId: string,
    actorId: string,
    actor: User,
    t: Translations
  ): Notification {
    return this.create(
      'task_assigned',
      assignedUserId,
      task.listId,
      'high',
      t.notifications.taskAssigned,
      `${actor.name} assigned you: "${task.title}"`,
      task.id,
      actorId,
      { taskTitle: task.title, actorName: actor.name }
    );
  }

  static createTaskCompletedNotification(
    task: Task,
    recipientUserId: string,
    actorId: string,
    actor: User,
    t: Translations
  ): Notification {
    return this.create(
      'task_completed',
      recipientUserId,
      task.listId,
      'medium',
      t.notifications.taskCompleted,
      `${actor.name} completed: "${task.title}"`,
      task.id,
      actorId,
      { taskTitle: task.title, actorName: actor.name }
    );
  }

  static createTaskFailedNotification(
    task: Task,
    recipientUserId: string,
    t: Translations
  ): Notification {
    return this.create(
      'task_failed',
      recipientUserId,
      task.listId,
      'high',
      t.notifications.taskFailed,
      `Task failed: "${task.title}"`,
      task.id,
      undefined,
      { taskTitle: task.title, stake: task.stake }
    );
  }

  static createTaskOverdueNotification(
    task: Task,
    recipientUserId: string,
    t: Translations
  ): Notification {
    return this.create(
      'task_overdue',
      recipientUserId,
      task.listId,
      'high',
      t.notifications.taskOverdue,
      `Task is overdue: "${task.title}"`,
      task.id,
      undefined,
      { taskTitle: task.title }
    );
  }

  static createMemberJoinedNotification(
    listId: string,
    recipientUserId: string,
    newMember: User,
    t: Translations
  ): Notification {
    return this.create(
      'member_joined',
      recipientUserId,
      listId,
      'low',
      t.notifications.memberJoined,
      `${newMember.name} joined your team`,
      undefined,
      newMember.id,
      { memberName: newMember.name }
    );
  }

  static createBalanceChangedNotification(
    userId: string,
    listId: string,
    amount: number,
    taskTitle: string,
    currencySymbol: string,
    t: Translations
  ): Notification {
    const isNegative = amount < 0;
    return this.create(
      'balance_changed',
      userId,
      listId,
      'medium',
      t.notifications.balanceChanged,
      `Your balance changed by ${currencySymbol}${Math.abs(amount / 100).toFixed(2)} from "${taskTitle}"`,
      undefined,
      undefined,
      { amount, taskTitle, isNegative }
    );
  }

  static shouldNotify(
    notification: Notification,
    preferences: NotificationPreferences
  ): boolean {
    if (!preferences) return true;

    switch (notification.type) {
      case 'task_assigned':
        return preferences.taskAssignments;
      case 'task_completed':
        return preferences.taskCompletions;
      case 'task_failed':
        return preferences.taskFailures;
      case 'task_overdue':
        return preferences.taskOverdue;
      case 'task_reminder':
        return preferences.taskReminders;
      case 'member_joined':
      case 'member_removed':
        return preferences.memberActivity;
      case 'balance_changed':
        return preferences.balanceUpdates;
      case 'list_invite':
        return preferences.listInvites;
      default:
        return true;
    }
  }

  static getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      taskAssignments: true,
      taskCompletions: true,
      taskFailures: true,
      taskOverdue: true,
      taskReminders: true,
      memberActivity: true,
      balanceUpdates: true,
      listInvites: true,
      enableSounds: true,
      enableBadges: true,
    };
  }

  static groupByDate(notifications: Notification[]): { date: string; notifications: Notification[] }[] {
    const grouped = notifications.reduce((acc, notif) => {
      const date = new Date(notif.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey: string;
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(notif);
      return acc;
    }, {} as Record<string, Notification[]>);

    return Object.entries(grouped).map(([date, notifications]) => ({
      date,
      notifications: notifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }));
  }

  static getIconForType(type: NotificationType): string {
    switch (type) {
      case 'task_assigned':
        return 'user-plus';
      case 'task_completed':
        return 'check-circle';
      case 'task_failed':
        return 'x-circle';
      case 'task_overdue':
        return 'alert-circle';
      case 'task_reminder':
        return 'bell';
      case 'member_joined':
        return 'user-check';
      case 'member_removed':
        return 'user-minus';
      case 'balance_changed':
        return 'dollar-sign';
      case 'list_invite':
        return 'mail';
      default:
        return 'bell';
    }
  }

  static getColorForPriority(priority: NotificationPriority): string {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  }
}
