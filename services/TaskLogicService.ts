import { Task, TaskStatus } from '@/types';
import { ClockService } from './ClockService';

export type TaskGroup = 'overdue' | 'today' | 'tomorrow' | 'thisWeek' | 'later' | 'completed';

export interface GroupedTasks {
  overdue: Task[];
  today: Task[];
  tomorrow: Task[];
  thisWeek: Task[];
  later: Task[];
  completed: Task[];
}

export interface TimeDisplay {
  text: string;
  color: string;
  isUrgent: boolean;
}

export class TaskLogicService {
  static getHumanReadableTime(task: Task): TimeDisplay {
    const now = ClockService.getCurrentTime();
    const endDate = new Date(task.endAt);
    const minutesUntil = Math.floor((endDate.getTime() - now.getTime()) / (60 * 1000));
    const hoursUntil = Math.floor(minutesUntil / 60);
    const daysUntil = Math.floor(hoursUntil / 24);

    if (task.status === 'completed') {
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const minutesAgo = Math.floor((now.getTime() - completedDate.getTime()) / (60 * 1000));
        const hoursAgo = Math.floor(minutesAgo / 60);
        const daysAgo = Math.floor(hoursAgo / 24);

        if (minutesAgo < 1) {
          return { text: 'Just now', color: '#10B981', isUrgent: false };
        } else if (minutesAgo < 60) {
          return { text: `${minutesAgo}m ago`, color: '#10B981', isUrgent: false };
        } else if (hoursAgo < 24) {
          return { text: `${hoursAgo}h ago`, color: '#10B981', isUrgent: false };
        } else if (daysAgo === 1) {
          return { text: 'Yesterday', color: '#10B981', isUrgent: false };
        } else if (daysAgo < 7) {
          return { text: `${daysAgo}d ago`, color: '#10B981', isUrgent: false };
        } else {
          return { text: completedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: '#10B981', isUrgent: false };
        }
      }
      return { text: 'Completed', color: '#10B981', isUrgent: false };
    }

    if (task.status === 'failed') {
      return { text: 'Failed', color: '#EF4444', isUrgent: false };
    }

    if (task.status === 'overdue') {
      const minutesOverdue = Math.abs(minutesUntil);
      const hoursOverdue = Math.floor(minutesOverdue / 60);
      const daysOverdue = Math.floor(hoursOverdue / 24);

      if (minutesOverdue < 60) {
        return { text: `Overdue ${minutesOverdue}m`, color: '#EF4444', isUrgent: true };
      } else if (hoursOverdue < 24) {
        return { text: `Overdue ${hoursOverdue}h`, color: '#EF4444', isUrgent: true };
      } else if (daysOverdue === 1) {
        return { text: 'Overdue 1d', color: '#EF4444', isUrgent: true };
      } else {
        return { text: `Overdue ${daysOverdue}d`, color: '#EF4444', isUrgent: true };
      }
    }

    if (minutesUntil < 0) {
      const minutesOverdue = Math.abs(minutesUntil);
      const hoursOverdue = Math.floor(minutesOverdue / 60);
      return { 
        text: hoursOverdue < 1 ? `Overdue ${minutesOverdue}m` : `Overdue ${hoursOverdue}h`, 
        color: '#EF4444', 
        isUrgent: true 
      };
    }

    if (minutesUntil < 30) {
      return { text: `${minutesUntil}m`, color: '#F59E0B', isUrgent: true };
    } else if (minutesUntil < 120) {
      return { text: `${Math.floor(minutesUntil / 60)}h ${minutesUntil % 60}m`, color: '#F59E0B', isUrgent: true };
    } else if (hoursUntil < 24) {
      return { text: `${hoursUntil}h`, color: '#3B82F6', isUrgent: false };
    } else if (daysUntil === 0) {
      return { 
        text: endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), 
        color: '#3B82F6', 
        isUrgent: false 
      };
    } else if (daysUntil === 1) {
      return { 
        text: `Tomorrow ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`, 
        color: '#6B7280', 
        isUrgent: false 
      };
    } else if (daysUntil < 7) {
      const dayName = endDate.toLocaleDateString('en-US', { weekday: 'short' });
      const time = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return { text: `${dayName} ${time}`, color: '#6B7280', isUrgent: false };
    } else {
      const dateStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { text: dateStr, color: '#9CA3AF', isUrgent: false };
    }
  }

  static groupTasks(tasks: Task[]): GroupedTasks {
    const now = ClockService.getCurrentTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const groups: GroupedTasks = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
      completed: [],
    };

    tasks.forEach(task => {
      if (task.status === 'completed') {
        groups.completed.push(task);
        return;
      }

      if (task.status === 'failed') {
        return;
      }

      const taskDate = new Date(task.endAt);

      if (task.status === 'overdue') {
        groups.overdue.push(task);
      } else if (taskDate < tomorrow) {
        groups.today.push(task);
      } else if (taskDate < dayAfterTomorrow) {
        groups.tomorrow.push(task);
      } else if (taskDate < weekEnd) {
        groups.thisWeek.push(task);
      } else {
        groups.later.push(task);
      }
    });

    Object.keys(groups).forEach(key => {
      const groupKey = key as keyof GroupedTasks;
      groups[groupKey] = this.sortTasksInGroup(groups[groupKey], groupKey);
    });

    return groups;
  }

  private static sortTasksInGroup(tasks: Task[], group: TaskGroup): Task[] {
    if (group === 'completed') {
      return tasks.sort((a, b) => {
        const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return bTime - aTime;
      });
    }

    return tasks.sort((a, b) => {
      if (a.priority && b.priority) {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
      }

      const aTime = new Date(a.endAt).getTime();
      const bTime = new Date(b.endAt).getTime();
      return aTime - bTime;
    });
  }

  static getGroupTitle(group: TaskGroup): string {
    switch (group) {
      case 'overdue':
        return 'OVERDUE';
      case 'today':
        return 'TODAY';
      case 'tomorrow':
        return 'TOMORROW';
      case 'thisWeek':
        return 'THIS WEEK';
      case 'later':
        return 'LATER';
      case 'completed':
        return 'COMPLETED';
    }
  }

  static getGroupColor(group: TaskGroup): string {
    switch (group) {
      case 'overdue':
        return '#EF4444';
      case 'today':
        return '#3B82F6';
      case 'tomorrow':
        return '#6B7280';
      case 'thisWeek':
        return '#6B7280';
      case 'later':
        return '#9CA3AF';
      case 'completed':
        return '#10B981';
    }
  }

  static computeTaskState(task: Task): TaskStatus {
    if (task.status === 'completed' || task.status === 'failed') {
      return task.status;
    }

    const now = ClockService.getCurrentTime();
    const endDate = new Date(task.endAt);
    const graceEnd = new Date(endDate.getTime() + task.gracePeriod * 60 * 1000);

    if (now >= graceEnd) {
      return 'failed';
    } else if (now >= endDate) {
      return 'overdue';
    } else {
      return 'pending';
    }
  }

  static isTaskDueSoon(task: Task, thresholdMinutes: number = 120): boolean {
    if (task.status !== 'pending') return false;
    
    const minutesUntil = ClockService.getMinutesUntilEnd(task.endAt);
    return minutesUntil > 0 && minutesUntil <= thresholdMinutes;
  }

  static getNextDueTask(tasks: Task[]): Task | undefined {
    const activeTasks = tasks.filter(
      t => t.status === 'pending' || t.status === 'overdue'
    );

    if (activeTasks.length === 0) return undefined;

    return activeTasks.sort((a, b) => {
      const aTime = new Date(a.endAt).getTime();
      const bTime = new Date(b.endAt).getTime();
      return aTime - bTime;
    })[0];
  }

  static getTasksByFundGoal(tasks: Task[], fundTargetId: string): Task[] {
    return tasks.filter(t => t.fundTargetId === fundTargetId);
  }

  static getActiveTasks(tasks: Task[]): Task[] {
    return tasks.filter(t => t.status === 'pending' || t.status === 'overdue');
  }

  static getCompletedTasks(tasks: Task[]): Task[] {
    return tasks.filter(t => t.status === 'completed');
  }

  static getFailedTasks(tasks: Task[]): Task[] {
    return tasks.filter(t => t.status === 'failed');
  }

  static getTotalStakeForTasks(tasks: Task[]): number {
    return tasks.reduce((sum, t) => sum + t.stake, 0);
  }

  static getProgressForFundGoal(tasks: Task[], fundTargetId: string, totalCollectedCents: number): {
    completedTasks: number;
    totalTasks: number;
    amountCollected: number;
    percentComplete: number;
  } {
    const fundTasks = this.getTasksByFundGoal(tasks, fundTargetId);
    const completedTasks = this.getCompletedTasks(fundTasks).length;
    const totalTasks = fundTasks.length;
    const amountCollected = totalCollectedCents / 100;
    const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      completedTasks,
      totalTasks,
      amountCollected,
      percentComplete,
    };
  }
}
