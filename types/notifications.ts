export type NotificationType = 
  | 'task_assigned'
  | 'task_completed'
  | 'task_failed'
  | 'task_overdue'
  | 'task_reminder'
  | 'member_joined'
  | 'member_removed'
  | 'balance_changed'
  | 'list_invite';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  listId: string;
  taskId?: string;
  actorId?: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  userId: string;
  taskAssignments: boolean;
  taskCompletions: boolean;
  taskFailures: boolean;
  taskOverdue: boolean;
  taskReminders: boolean;
  memberActivity: boolean;
  balanceUpdates: boolean;
  listInvites: boolean;
  enableSounds: boolean;
  enableBadges: boolean;
}

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}
