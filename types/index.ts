export type TaskCategory = 'Household' | 'Finance' | 'Work' | 'Leisure';
export type MemberRole = 'Owner' | 'Member';
export type TaskStatus = 'pending' | 'completed' | 'failed' | 'failed_joker_used' | 'failed_stake_paid' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high';
export type ReminderType = 'none' | 'at_due' | '30_min' | 'custom';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface CategoryMeta {
  emoji: string;
  color: string;
  label: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  dueDate?: string;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  gracePeriod: number;
  stake: number;
  status: TaskStatus;
  assignedTo: string | string[];
  listId: string;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  previousStatus?: TaskStatus;
  priority?: TaskPriority;
  reminder?: ReminderType;
  customReminderMinutes?: number;
  recurrence?: RecurrenceType;
  isShared?: boolean;
  fundTargetId?: string;
}

export interface FundTarget {
  id: string;
  listId: string;
  name: string;
  emoji: string;
  description?: string;
  targetAmountCents?: number;
  totalCollectedCents: number;
  isActive: boolean;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  userId: string | string[];
  taskId: string;
  taskTitle: string;
  listId: string;
  amount: number;
  date: string;
  month: string;
  fundTargetId?: string;
}

export interface BalanceEntry {
  id: string;
  userId: string;
  taskId: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
  color: string;
  currentStreakCount: number;
  jokerCount: number;
  notificationPrefs?: {
    taskReminders: boolean;
    overdueAlerts: boolean;
    balanceUpdates: boolean;
  };
}

export interface List {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  categories: Record<TaskCategory, CategoryMeta>;
  currency: string;
  currencySymbol: string;
  defaultGraceMinutes: number;
  defaultStakeCents: number;
  allowMemberCategoryManage: boolean;
  createdAt: string;
  inviteToken?: string;
  archived?: boolean;
}

export interface Group {
  id: string;
  name: string;
  memberIds: string[];
  createdAt: string;
}

export interface MonthlyBalance {
  userId: string;
  month: string;
  totalCredit: number;
  totalDebit: number;
  balance: number;
  entries: BalanceEntry[];
}

export interface DashboardStats {
  openTasks: number;
  overdueTasks: number;
  completedThisMonth: number;
  totalBalance: number;
  nextDueTask?: Task;
  monthlyComparison: {
    tasksChange: number;
    balanceChange: number;
  };
}

export interface UndoAction {
  taskId: string;
  ledgerEntryId?: string;
  expiresAt: number;
}

export interface ListMember {
  userId: string;
  listId: string;
  role: MemberRole;
  canManageCategories?: boolean;
  joinedAt: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  goalId: string;
  senderId: string;
  content: string;
  timestamp: string;
  listId: string;
}
