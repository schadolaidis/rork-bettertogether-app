export const EU_LOCALE = 'de-AT';

export const WEEKDAY_LABELS_SHORT_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const WEEKDAY_LABELS_LONG_DE = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
];

export const MONTH_LABELS_DE = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

export const MONTH_LABELS_SHORT_DE = [
  'Jän',
  'Feb',
  'Mär',
  'Apr',
  'Mai',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Okt',
  'Nov',
  'Dez',
];

export class EUDateFormatter {
  static formatDate(date: Date, format: 'short' | 'long' | 'full' = 'short'): string {
    if (!date || isNaN(date.getTime())) {
      console.warn('[EUDateFormatter] Invalid date passed to formatDate:', date);
      return 'Invalid Date';
    }
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    switch (format) {
      case 'short':
        return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`;
      case 'long':
        return `${day}. ${MONTH_LABELS_DE[date.getMonth()]} ${year}`;
      case 'full':
        const weekday = WEEKDAY_LABELS_LONG_DE[(date.getDay() + 6) % 7];
        return `${weekday}, ${day}. ${MONTH_LABELS_DE[date.getMonth()]} ${year}`;
      default:
        return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`;
    }
  }

  static formatTime(date: Date, includeSeconds: boolean = false): string {
    if (!date || isNaN(date.getTime())) {
      console.warn('[EUDateFormatter] Invalid date passed to formatTime:', date);
      return 'Invalid Time';
    }
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (includeSeconds) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  static formatDateTime(date: Date): string {
    return `${this.formatDate(date, 'short')} ${this.formatTime(date)}`;
  }

  static formatTimeRange(start: Date, end: Date): string {
    return `${this.formatTime(start)} – ${this.formatTime(end)}`;
  }

  static formatRelativeDate(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Morgen';
    if (diffDays === -1) return 'Gestern';
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} Tagen`;
    if (diffDays < -1 && diffDays >= -7) return `Vor ${Math.abs(diffDays)} Tagen`;

    return this.formatDate(date, 'short');
  }

  static formatRelativeDateWithWeekday(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Morgen';
    if (diffDays === -1) return 'Gestern';
    
    const weekday = WEEKDAY_LABELS_SHORT_DE[(date.getDay() + 6) % 7];
    
    if (diffDays > 1 && diffDays <= 7) return weekday;
    
    return this.formatDate(date, 'short');
  }

  static getWeekNumber(date: Date): number {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  }

  static formatWeekNumber(date: Date): string {
    return `KW ${this.getWeekNumber(date)}`;
  }

  static getMonthDaysEU(year: number, month: number): Date[] {
    const days: Date[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = (firstDay.getDay() + 6) % 7;
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    const endDay = (lastDay.getDay() + 6) % 7;
    const remainingDays = 6 - endDay;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }

  static getWeekDaysEU(date: Date): Date[] {
    const days: Date[] = [];
    const currentDay = (date.getDay() + 6) % 7;
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
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  static parseNaturalLanguage(input: string): {
    title?: string;
    date?: Date;
    startTime?: { hour: number; minute: number };
    endTime?: { hour: number; minute: number };
  } | null {
    const result: {
      title?: string;
      date?: Date;
      startTime?: { hour: number; minute: number };
      endTime?: { hour: number; minute: number };
    } = {};

    const dayPatterns = [
      { regex: /\b(heute|today)\b/i, offset: 0 },
      { regex: /\b(morgen|tomorrow)\b/i, offset: 1 },
      { regex: /\b(übermorgen)\b/i, offset: 2 },
      { regex: /\b(mo|montag|monday)\b/i, day: 0 },
      { regex: /\b(di|dienstag|tuesday)\b/i, day: 1 },
      { regex: /\b(mi|mittwoch|wednesday)\b/i, day: 2 },
      { regex: /\b(do|donnerstag|thursday)\b/i, day: 3 },
      { regex: /\b(fr|freitag|friday)\b/i, day: 4 },
      { regex: /\b(sa|samstag|saturday)\b/i, day: 5 },
      { regex: /\b(so|sonntag|sunday)\b/i, day: 6 },
    ];

    for (const pattern of dayPatterns) {
      if (pattern.regex.test(input)) {
        const now = new Date();
        if ('offset' in pattern && pattern.offset !== undefined) {
          const date = new Date(now);
          date.setDate(now.getDate() + pattern.offset);
          result.date = date;
        } else if ('day' in pattern && pattern.day !== undefined) {
          const currentDay = (now.getDay() + 6) % 7;
          const targetDay = pattern.day;
          let daysToAdd = targetDay - currentDay;
          if (daysToAdd <= 0) daysToAdd += 7;
          const date = new Date(now);
          date.setDate(now.getDate() + daysToAdd);
          result.date = date;
        }
        break;
      }
    }

    const timeRangeMatch = input.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
    if (timeRangeMatch) {
      const [, startHour, startMinute, endHour, endMinute] = timeRangeMatch;
      result.startTime = {
        hour: parseInt(startHour, 10),
        minute: parseInt(startMinute, 10),
      };
      result.endTime = {
        hour: parseInt(endHour, 10),
        minute: parseInt(endMinute, 10),
      };
    } else {
      const singleTimeMatch = input.match(/(\d{1,2}):(\d{2})/);
      if (singleTimeMatch) {
        const [, hour, minute] = singleTimeMatch;
        result.startTime = {
          hour: parseInt(hour, 10),
          minute: parseInt(minute, 10),
        };
        result.endTime = {
          hour: parseInt(hour, 10) + 1,
          minute: parseInt(minute, 10),
        };
      }
    }

    let titleText = input;
    titleText = titleText.replace(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/g, '');
    titleText = titleText.replace(/(\d{1,2}):(\d{2})/g, '');
    titleText = titleText.replace(/\b(heute|morgen|übermorgen|mo|di|mi|do|fr|sa|so|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b/gi, '');
    titleText = titleText.trim();

    if (titleText) {
      result.title = titleText;
    }

    return Object.keys(result).length > 0 ? result : null;
  }
}
