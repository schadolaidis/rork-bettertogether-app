export class ClockService {
  static getCurrentTime(): Date {
    return new Date();
  }

  static isOverdue(endAt: string): boolean {
    return new Date(endAt) < this.getCurrentTime();
  }

  static isFailed(endAt: string, gracePeriodMinutes: number): boolean {
    const end = new Date(endAt);
    const graceEnd = new Date(end.getTime() + gracePeriodMinutes * 60 * 1000);
    return graceEnd < this.getCurrentTime();
  }

  static getMinutesUntilEnd(endAt: string): number {
    const now = this.getCurrentTime();
    const end = new Date(endAt);
    return Math.floor((end.getTime() - now.getTime()) / (60 * 1000));
  }

  static migrateTask(task: { dueDate?: string; startAt?: string; endAt?: string }): { startAt: string; endAt: string } {
    if (task.startAt && task.endAt) {
      return { startAt: task.startAt, endAt: task.endAt };
    }
    
    if (task.dueDate) {
      const dueTime = new Date(task.dueDate);
      const startTime = new Date(dueTime.getTime() - 60 * 60 * 1000);
      return {
        startAt: startTime.toISOString(),
        endAt: dueTime.toISOString(),
      };
    }
    
    return {
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }

  static getCurrentMonth(): string {
    const now = this.getCurrentTime();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  static formatMonth(month: string): string {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}
