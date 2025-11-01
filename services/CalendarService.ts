import { Task, TaskCategory } from '@/types';

export interface DateMarker {
  color: string;
  count: number;
}

export interface DayMarkers {
  date: string;
  markers: DateMarker[];
  hasOverdue: boolean;
  hasFailed: boolean;
  totalTasks: number;
}

export class CalendarService {
  static getRange(
    start: Date,
    end: Date,
    tasks: Task[],
    options?: { categoryColors?: Record<TaskCategory, string> }
  ): DayMarkers[] {
    const dayMap = new Map<string, DayMarkers>();

    const startTime = new Date(start).setHours(0, 0, 0, 0);
    const endTime = new Date(end).setHours(23, 59, 59, 999);

    tasks.forEach((task) => {
      const taskDate = new Date(task.endAt);
      const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
      const taskTime = taskDateOnly.getTime();
      const dateKey = this.getDateKey(taskDateOnly);

      if (taskTime >= startTime && taskTime <= endTime) {
        if (!dayMap.has(dateKey)) {
          dayMap.set(dateKey, {
            date: dateKey,
            markers: [],
            hasOverdue: false,
            hasFailed: false,
            totalTasks: 0,
          });
        }

        const dayData = dayMap.get(dateKey)!;
        dayData.totalTasks++;

        if (task.status === 'overdue') {
          dayData.hasOverdue = true;
        }
        if (task.status === 'failed') {
          dayData.hasFailed = true;
        }

        const categoryColor = options?.categoryColors?.[task.category as TaskCategory] || '#6B7280';
        const existingMarker = dayData.markers.find((m) => m.color === categoryColor);

        if (existingMarker) {
          existingMarker.count++;
        } else {
          dayData.markers.push({
            color: categoryColor,
            count: 1,
          });
        }
      }
    });

    return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  static getTasksForDate(date: Date, tasks: Task[]): Task[] {
    const dateKey = this.getDateKey(date);
    return tasks
      .filter((task) => {
        const taskDate = new Date(task.endAt);
        const taskDateKey = this.getDateKey(taskDate);
        return taskDateKey === dateKey;
      })
      .sort((a, b) => {
        return new Date(a.endAt).getTime() - new Date(b.endAt).getTime();
      });
  }

  static getDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static getMonthDays(year: number, month: number): Date[] {
    const days: Date[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(new Date(year, month, -startDay + i + 1));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    const endDay = lastDay.getDay();
    const remainingDays = 6 - endDay;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }

  static getWeekDays(date: Date): Date[] {
    const days: Date[] = [];
    const currentDay = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - currentDay);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return this.getDateKey(date1) === this.getDateKey(date2);
  }

  static formatMonthYear(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  static formatWeekRange(startDate: Date): string {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });

    if (startMonth === endMonth) {
      return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}, ${startDate.getFullYear()}`;
    }

    return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${startDate.getFullYear()}`;
  }

  static formatDayDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
