import { Task, LedgerEntry, FundTarget, DashboardStats } from '@/types';
import { ClockService } from './ClockService';
import { TaskLogicService } from './TaskLogicService';

export interface MonthlyMetrics {
  failedTasks: number;
  completedTasks: number;
  fundGrowth: number;
  tasksCreated: number;
}

export interface InsightData {
  type: 'success' | 'warning' | 'info' | 'alert';
  message: string;
  icon: 'check' | 'alert' | 'trending' | 'target';
  action?: {
    label: string;
    route: string;
  };
}

export interface EnhancedDashboardStats extends DashboardStats {
  insights: InsightData[];
  currentMonthMetrics: MonthlyMetrics;
  previousMonthMetrics: MonthlyMetrics;
  activeFundGoals: number;
  totalFundAmount: number;
}

export class DashboardService {
  static getMonthlyMetrics(
    tasks: Task[],
    ledgerEntries: LedgerEntry[],
    month: string
  ): MonthlyMetrics {
    const monthTasks = tasks.filter((t) => {
      const createdDate = new Date(t.createdAt);
      const taskMonth = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
      return taskMonth === month;
    });

    const failedTasks = tasks.filter((t) => {
      if (t.status !== 'failed' || !t.failedAt) return false;
      const failDate = new Date(t.failedAt);
      const taskMonth = `${failDate.getFullYear()}-${String(failDate.getMonth() + 1).padStart(2, '0')}`;
      return taskMonth === month;
    }).length;

    const completedTasks = tasks.filter((t) => {
      if (t.status !== 'completed' || !t.completedAt) return false;
      const compDate = new Date(t.completedAt);
      const taskMonth = `${compDate.getFullYear()}-${String(compDate.getMonth() + 1).padStart(2, '0')}`;
      return taskMonth === month;
    }).length;

    const fundGrowth = ledgerEntries
      .filter((e) => e.month === month)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      failedTasks,
      completedTasks,
      fundGrowth,
      tasksCreated: monthTasks.length,
    };
  }

  static calculateMonthComparison(
    currentMetrics: MonthlyMetrics,
    previousMetrics: MonthlyMetrics
  ): {
    tasksChange: number;
    balanceChange: number;
    completionRate: number;
  } {
    const tasksChange = currentMetrics.completedTasks - previousMetrics.completedTasks;
    const balanceChange = currentMetrics.fundGrowth - previousMetrics.fundGrowth;
    
    const currentTotal = currentMetrics.completedTasks + currentMetrics.failedTasks;
    const completionRate = currentTotal > 0 
      ? Math.round((currentMetrics.completedTasks / currentTotal) * 100) 
      : 0;

    return { tasksChange, balanceChange, completionRate };
  }

  static generateInsights(
    tasks: Task[],
    fundTargets: FundTarget[],
    stats: DashboardStats,
    currentMetrics: MonthlyMetrics,
    completionRate: number
  ): InsightData[] {
    const insights: InsightData[] = [];

    if (stats.overdueTasks > 0) {
      insights.push({
        type: 'alert',
        message: `${stats.overdueTasks} task${stats.overdueTasks > 1 ? 's' : ''} ${stats.overdueTasks > 1 ? 'are' : 'is'} overdue`,
        icon: 'alert',
        action: {
          label: 'Review Now',
          route: '/tasks?filter=overdue',
        },
      });
    }

    if (stats.openTasks === 0 && stats.overdueTasks === 0) {
      insights.push({
        type: 'success',
        message: "You're all caught up! No pending tasks",
        icon: 'check',
      });
    }

    const dueSoonTasks = tasks.filter((t) => TaskLogicService.isTaskDueSoon(t));
    if (dueSoonTasks.length > 0) {
      insights.push({
        type: 'warning',
        message: `${dueSoonTasks.length} task${dueSoonTasks.length > 1 ? 's' : ''} due in the next 2 hours`,
        icon: 'alert',
        action: {
          label: 'View Tasks',
          route: '/tasks',
        },
      });
    }

    fundTargets.forEach((fund) => {
      if (fund.targetAmountCents) {
        const progress = (fund.totalCollectedCents / fund.targetAmountCents) * 100;
        if (progress >= 100) {
          insights.push({
            type: 'success',
            message: `${fund.emoji} ${fund.name} goal reached!`,
            icon: 'target',
            action: {
              label: 'View Goals',
              route: '/settings/funds',
            },
          });
        } else if (progress >= 80) {
          insights.push({
            type: 'info',
            message: `${fund.emoji} ${fund.name} is ${Math.round(progress)}% complete`,
            icon: 'trending',
          });
        }
      }
    });

    if (completionRate >= 90 && currentMetrics.completedTasks >= 5) {
      insights.push({
        type: 'success',
        message: `Amazing! ${completionRate}% task completion rate this month`,
        icon: 'check',
      });
    } else if (completionRate < 50 && currentMetrics.failedTasks > currentMetrics.completedTasks) {
      insights.push({
        type: 'warning',
        message: `${currentMetrics.failedTasks} failed vs ${currentMetrics.completedTasks} completed this month`,
        icon: 'alert',
        action: {
          label: 'Review Progress',
          route: '/tasks',
        },
      });
    }

    if (currentMetrics.fundGrowth > 0) {
      insights.push({
        type: 'info',
        message: `Group fund grew by $${currentMetrics.fundGrowth.toFixed(2)} this month`,
        icon: 'trending',
        action: {
          label: 'View Balance',
          route: '/balances',
        },
      });
    }

    return insights;
  }

  static getEnhancedStats(
    tasks: Task[],
    ledgerEntries: LedgerEntry[],
    fundTargets: FundTarget[],
    currentUserId: string,
    currentListId: string
  ): EnhancedDashboardStats {
    const now = ClockService.getCurrentTime();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const currentListTasks = tasks.filter((t) => t.listId === currentListId);
    const currentListLedger = ledgerEntries.filter((e) => e.listId === currentListId);

    const openTasks = currentListTasks.filter((t) => t.status === 'pending').length;
    const overdueTasks = currentListTasks.filter((t) => t.status === 'overdue').length;

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const completedThisMonth = currentListTasks.filter(
      (t) =>
        t.status === 'completed' &&
        t.completedAt &&
        new Date(t.completedAt) >= firstDayOfMonth
    ).length;

    const currentUserBalance = currentListLedger
      .filter((e) => e.userId === currentUserId)
      .reduce((acc, entry) => acc - entry.amount, 0);

    const nextDueTask = TaskLogicService.getNextDueTask(currentListTasks);

    const currentMonthMetrics = this.getMonthlyMetrics(
      currentListTasks,
      currentListLedger,
      currentMonth
    );

    const previousMonthMetrics = this.getMonthlyMetrics(
      currentListTasks,
      currentListLedger,
      previousMonth
    );

    const { tasksChange, balanceChange, completionRate } = this.calculateMonthComparison(
      currentMonthMetrics,
      previousMonthMetrics
    );

    const totalFundAmount = currentListLedger.reduce((sum, e) => sum + e.amount, 0);

    const activeFundGoals = fundTargets.filter((f) => f.listId === currentListId && f.isActive).length;

    const insights = this.generateInsights(
      currentListTasks,
      fundTargets.filter((f) => f.listId === currentListId && f.isActive),
      {
        openTasks,
        overdueTasks,
        completedThisMonth,
        totalBalance: currentUserBalance,
        nextDueTask,
        monthlyComparison: { tasksChange, balanceChange },
      },
      currentMonthMetrics,
      completionRate
    );

    return {
      openTasks,
      overdueTasks,
      completedThisMonth,
      totalBalance: currentUserBalance,
      nextDueTask,
      monthlyComparison: {
        tasksChange,
        balanceChange,
      },
      insights,
      currentMonthMetrics,
      previousMonthMetrics,
      activeFundGoals,
      totalFundAmount,
    };
  }

  static getFundGoalProgress(
    fund: FundTarget,
    tasks: Task[]
  ): {
    linkedTasks: number;
    completedTasks: number;
    progress: number;
    isComplete: boolean;
  } {
    const linkedTasks = tasks.filter((t) => t.fundTargetId === fund.id).length;
    const completedTasks = tasks.filter(
      (t) => t.fundTargetId === fund.id && t.status === 'completed'
    ).length;

    let progress = 0;
    let isComplete = false;

    if (fund.targetAmountCents) {
      progress = Math.round((fund.totalCollectedCents / fund.targetAmountCents) * 100);
      isComplete = fund.totalCollectedCents >= fund.targetAmountCents;
    }

    return {
      linkedTasks,
      completedTasks,
      progress,
      isComplete,
    };
  }
}
