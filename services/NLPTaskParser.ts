import { TaskCategory, TaskPriority } from '@/types';

export interface ParsedTaskData {
  title: string;
  date?: Date;
  time?: string;
  allDay?: boolean;
  category?: TaskCategory;
  priority?: TaskPriority;
  stake?: number;
  reminder?: number;
  location?: string;
  attendees?: string[];
  recurrence?: 'daily' | 'weekly' | 'monthly';
  tags?: string[];
  calendarKey?: string;
  isTodo?: boolean;
  videoCall?: 'zoom' | 'meet' | 'teams';
  matchedTokens: string[];
}

export class NLPTaskParser {
  private static readonly SHORTCUTS = {
    h: 'today',
    m: 'tomorrow',
    ü: 'overmorrow',
    f: 'friday',
    mo: 'monday',
    di: 'tuesday',
    mi: 'wednesday',
    do: 'thursday',
    fr: 'friday',
    sa: 'saturday',
    so: 'sunday',
    w: 'weekly',
  };

  private static readonly DAYS_DE = [
    'sonntag',
    'montag',
    'dienstag',
    'mittwoch',
    'donnerstag',
    'freitag',
    'samstag',
  ];

  private static readonly DAYS_EN = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  private static readonly MONTHS_DE = [
    'januar',
    'februar',
    'märz',
    'april',
    'mai',
    'juni',
    'juli',
    'august',
    'september',
    'oktober',
    'november',
    'dezember',
  ];

  private static readonly CATEGORY_KEYWORDS: Record<TaskCategory, string[]> = {
    Household: ['haushalt', 'putzen', 'waschen', 'kochen', 'einkaufen', 'clean', 'wash', 'cook'],
    Finance: ['bezahlen', 'rechnung', 'geld', 'bank', 'überweisung', 'pay', 'bill', 'money', 'transfer'],
    Work: [
      'meeting',
      'call',
      'email',
      'projekt',
      'deadline',
      'arbeit',
      'work',
      'besprechung',
      'termin',
    ],
    Leisure: ['gym', 'sport', 'joggen', 'lesen', 'entspannen', 'hobby', 'relax', 'exercise'],
  };

  static parse(input: string): ParsedTaskData {
    console.log('[NLPTaskParser] Parsing input:', input);
    
    const matchedTokens: string[] = [];
    let workingInput = input.trim();
    
    if (!workingInput) {
      console.log('[NLPTaskParser] Empty input');
      return { title: '', matchedTokens: [] };
    }
    
    let title = '';
    let date: Date | undefined;
    let time: string | undefined;
    let allDay = false;
    let category: TaskCategory | undefined;
    let priority: TaskPriority | undefined;
    let stake: number | undefined;
    let reminder: number | undefined;
    let location: string | undefined;
    let attendees: string[] = [];
    let recurrence: 'daily' | 'weekly' | 'monthly' | undefined;
    let tags: string[] = [];
    let calendarKey: string | undefined;
    let isTodo = false;
    let videoCall: 'zoom' | 'meet' | 'teams' | undefined;

    const expandedInput = this.expandShortcuts(workingInput);

    isTodo = /^(todo|√)\s+/i.test(expandedInput);
    if (isTodo) {
      workingInput = expandedInput.replace(/^(todo|√)\s+/i, '');
      matchedTokens.push('todo');
    } else {
      workingInput = expandedInput;
    }

    const todoResult = this.extractTodoKeywords(workingInput);
    if (todoResult.found) {
      isTodo = true;
      workingInput = todoResult.cleaned;
      matchedTokens.push('todo');
    }

    const videoResult = this.extractVideoCall(workingInput);
    if (videoResult.type) {
      videoCall = videoResult.type;
      workingInput = videoResult.cleaned;
      matchedTokens.push(videoResult.type);
    }

    const calendarResult = this.extractCalendar(workingInput);
    if (calendarResult.key) {
      calendarKey = calendarResult.key;
      workingInput = calendarResult.cleaned;
      matchedTokens.push(`/${calendarResult.key}`);
    }

    const attendeeResult = this.extractAttendees(workingInput);
    attendees = attendeeResult.names;
    workingInput = attendeeResult.cleaned;
    if (attendees.length > 0) {
      matchedTokens.push(...attendees.map((n) => `with ${n}`));
    }

    const locationResult = this.extractLocation(workingInput);
    if (locationResult.location) {
      location = locationResult.location;
      workingInput = locationResult.cleaned;
      matchedTokens.push(`at ${location}`);
    }

    const reminderResult = this.extractReminder(workingInput);
    if (reminderResult.minutes !== undefined) {
      reminder = reminderResult.minutes;
      workingInput = reminderResult.cleaned;
      matchedTokens.push(`reminder ${reminder}min`);
    }

    const priorityResult = this.extractPriority(workingInput);
    if (priorityResult.priority) {
      priority = priorityResult.priority;
      workingInput = priorityResult.cleaned;
      matchedTokens.push(`p${priority === 'high' ? '1' : priority === 'medium' ? '2' : '3'}`);
    }

    const tagResult = this.extractTags(workingInput);
    tags = tagResult.tags;
    workingInput = tagResult.cleaned;
    if (tags.length > 0) {
      matchedTokens.push(...tags.map((t) => `#${t}`));
    }

    const stakeResult = this.extractStake(workingInput);
    if (stakeResult.amount !== undefined) {
      stake = stakeResult.amount;
      workingInput = stakeResult.cleaned;
      matchedTokens.push(`€${stake}`);
    }

    const recurrenceResult = this.extractRecurrence(workingInput);
    if (recurrenceResult.type) {
      recurrence = recurrenceResult.type;
      workingInput = recurrenceResult.cleaned;
      matchedTokens.push(recurrenceResult.type);
    }

    const allDayResult = this.extractAllDay(workingInput);
    if (allDayResult.found) {
      allDay = true;
      workingInput = allDayResult.cleaned;
      matchedTokens.push('ganztags');
    }

    const dateResult = this.extractDate(workingInput);
    if (dateResult.date) {
      date = dateResult.date;
      workingInput = dateResult.cleaned;
      matchedTokens.push(dateResult.matched || '');
    }

    const timeResult = this.extractTime(workingInput);
    if (timeResult.time) {
      time = timeResult.time;
      if (date) {
        const [hours, minutes] = time.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
      } else {
        date = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
      }
      workingInput = timeResult.cleaned;
      matchedTokens.push(time);
    }

    const categoryResult = this.extractCategory(workingInput);
    if (categoryResult.category) {
      category = categoryResult.category;
    }

    title = workingInput.replace(/\s+/g, ' ').trim();
    
    if (!title) {
      title = input.trim();
    }
    
    console.log('[NLPTaskParser] Parsed result:', {
      title,
      date: date?.toISOString(),
      time,
      allDay,
      category,
      priority,
      stake,
      reminder,
      location,
      attendees,
      recurrence,
      tags,
      calendarKey,
      isTodo,
      videoCall,
    });

    return {
      title,
      date,
      time,
      allDay,
      category,
      priority,
      stake,
      reminder,
      location,
      attendees,
      recurrence,
      tags,
      calendarKey,
      isTodo,
      videoCall,
      matchedTokens: matchedTokens.filter(Boolean),
    };
  }

  private static expandShortcuts(input: string): string {
    let expanded = input;
    
    const shortcutPattern = /\b([hmüfwmodifrsaso]{1,2})\b/gi;
    expanded = expanded.replace(shortcutPattern, (match) => {
      const lower = match.toLowerCase();
      return this.SHORTCUTS[lower as keyof typeof this.SHORTCUTS] || match;
    });

    return expanded;
  }

  private static extractDate(input: string): { date?: Date; cleaned: string; matched?: string } {
    const patterns = [
      {
        pattern: /\b(heute|today)\b/i,
        fn: () => new Date(),
      },
      {
        pattern: /\b(morgen|tomorrow)\b/i,
        fn: () => {
          const d = new Date();
          d.setDate(d.getDate() + 1);
          return d;
        },
      },
      {
        pattern: /\b(übermorgen|overmorrow)\b/i,
        fn: () => {
          const d = new Date();
          d.setDate(d.getDate() + 2);
          return d;
        },
      },
      {
        pattern: /\b(monday|montag)\b/i,
        fn: () => this.getNextWeekday(1),
      },
      {
        pattern: /\b(tuesday|dienstag)\b/i,
        fn: () => this.getNextWeekday(2),
      },
      {
        pattern: /\b(wednesday|mittwoch)\b/i,
        fn: () => this.getNextWeekday(3),
      },
      {
        pattern: /\b(thursday|donnerstag)\b/i,
        fn: () => this.getNextWeekday(4),
      },
      {
        pattern: /\b(friday|freitag)\b/i,
        fn: () => this.getNextWeekday(5),
      },
      {
        pattern: /\b(saturday|samstag)\b/i,
        fn: () => this.getNextWeekday(6),
      },
      {
        pattern: /\b(sunday|sonntag)\b/i,
        fn: () => this.getNextWeekday(0),
      },
      {
        pattern: /\bin\s+(\d+)\s+(min|minuten|minutes?)\b/i,
        fn: (match: RegExpMatchArray) => {
          const minutes = parseInt(match[1], 10);
          const d = new Date();
          d.setMinutes(d.getMinutes() + minutes);
          return d;
        },
      },
      {
        pattern: /\+(\d+)\b/,
        fn: (match: RegExpMatchArray) => {
          const minutes = parseInt(match[1], 10);
          const d = new Date();
          d.setMinutes(d.getMinutes() + minutes);
          return d;
        },
      },
      {
        pattern: /\b(\d{1,2})\.(\d{1,2})\.?(\d{2,4})?\b/,
        fn: (match: RegExpMatchArray) => {
          const day = parseInt(match[1], 10);
          const month = parseInt(match[2], 10) - 1;
          const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
          const fullYear = year < 100 ? 2000 + year : year;
          const date = new Date(fullYear, month, day);
          if (date < new Date() && !match[3]) {
            date.setFullYear(date.getFullYear() + 1);
          }
          return date;
        },
      },
      {
        pattern: /\b(\d{1,2})\/(\d{1,2})\/?(\d{2,4})?\b/,
        fn: (match: RegExpMatchArray) => {
          const month = parseInt(match[1], 10) - 1;
          const day = parseInt(match[2], 10);
          const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
          const fullYear = year < 100 ? 2000 + year : year;
          const date = new Date(fullYear, month, day);
          if (date < new Date() && !match[3]) {
            date.setFullYear(date.getFullYear() + 1);
          }
          return date;
        },
      },
    ];

    for (const { pattern, fn } of patterns) {
      const match = input.match(pattern);
      if (match) {
        const date = fn(match);
        const cleaned = input.replace(pattern, ' ').trim();
        return { date, cleaned, matched: match[0] };
      }
    }

    return { cleaned: input };
  }

  private static extractTime(input: string): { time?: string; cleaned: string } {
    const patterns = [
      {
        pattern: /\b(\d{1,2}):(\d{2})\s*(uhr)?\b/i,
        fn: (match: RegExpMatchArray) => {
          const hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          }
          return undefined;
        },
      },
      {
        pattern: /\b(\d{1,2})\s*uhr\b/i,
        fn: (match: RegExpMatchArray) => {
          const hours = parseInt(match[1], 10);
          if (hours >= 0 && hours < 24) {
            return `${hours.toString().padStart(2, '0')}:00`;
          }
          return undefined;
        },
      },
      {
        pattern: /\b(\d{1,2})(am|pm)\b/i,
        fn: (match: RegExpMatchArray) => {
          let hours = parseInt(match[1], 10);
          const ampm = match[2].toLowerCase();
          if (ampm === 'pm' && hours !== 12) {
            hours += 12;
          } else if (ampm === 'am' && hours === 12) {
            hours = 0;
          }
          if (hours >= 0 && hours < 24) {
            return `${hours.toString().padStart(2, '0')}:00`;
          }
          return undefined;
        },
      },
    ];

    for (const { pattern, fn } of patterns) {
      const match = input.match(pattern);
      if (match) {
        const time = fn(match);
        if (time) {
          const cleaned = input.replace(pattern, ' ').trim();
          return { time, cleaned };
        }
      }
    }

    return { cleaned: input };
  }

  private static extractAllDay(input: string): { found: boolean; cleaned: string } {
    const pattern = /\b(ganztags|ganztägig|all day|allday)\b/i;
    const match = input.match(pattern);
    if (match) {
      return { found: true, cleaned: input.replace(pattern, ' ').trim() };
    }
    return { found: false, cleaned: input };
  }

  private static extractCategory(input: string): { category?: TaskCategory; cleaned: string } {
    const lowerInput = input.toLowerCase();
    for (const [cat, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          return { category: cat as TaskCategory, cleaned: input };
        }
      }
    }
    return { cleaned: input };
  }

  private static extractPriority(input: string): {
    priority?: TaskPriority;
    cleaned: string;
  } {
    const pattern = /\bp([123])\b/i;
    const match = input.match(pattern);
    if (match) {
      const level = match[1];
      const priority: TaskPriority = level === '1' ? 'high' : level === '2' ? 'medium' : 'low';
      return { priority, cleaned: input.replace(pattern, ' ').trim() };
    }
    return { cleaned: input };
  }

  private static extractStake(input: string): { amount?: number; cleaned: string } {
    const patterns = [
      /\b€(\d+(?:[.,]\d{1,2})?)\b/,
      /\b(\d+(?:[.,]\d{1,2})?)\s*€\b/,
      /\b(\d+(?:[.,]\d{1,2})?)\s*(euro|eur)\b/i,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        const amountStr = match[1].replace(',', '.');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount >= 0) {
          return { amount, cleaned: input.replace(pattern, ' ').trim() };
        }
      }
    }

    return { cleaned: input };
  }

  private static extractReminder(input: string): { minutes?: number; cleaned: string } {
    const patterns = [
      {
        pattern: /\breminder\s+(\d+)\s*(min|minuten|minutes?)?\b/i,
        fn: (match: RegExpMatchArray) => parseInt(match[1], 10),
      },
      {
        pattern: /\berinnerung\s+(\d+)\s*(min|minuten)?\b/i,
        fn: (match: RegExpMatchArray) => parseInt(match[1], 10),
      },
    ];

    for (const { pattern, fn } of patterns) {
      const match = input.match(pattern);
      if (match) {
        const minutes = fn(match);
        if (!isNaN(minutes) && minutes > 0) {
          return { minutes, cleaned: input.replace(pattern, ' ').trim() };
        }
      }
    }

    return { cleaned: input };
  }

  private static extractLocation(input: string): { location?: string; cleaned: string } {
    const pattern = /\b(at|bei)\s+([A-ZÄÖÜa-zäöü0-9\s]+?)(?=\s+(with|reminder|p[123]|#|\d{1,2}[:.]|\b(heute|morgen|monday|freitag|ganztags)|$))/i;
    const match = input.match(pattern);
    if (match) {
      const location = match[2].trim();
      return { location, cleaned: input.replace(match[0], ' ').trim() };
    }
    return { cleaned: input };
  }

  private static extractAttendees(input: string): { names: string[]; cleaned: string } {
    const pattern = /\b(with|mit)\s+([A-ZÄÖÜa-zäöü\s,&]+?)(?=\s+(at|reminder|p[123]|#|\d{1,2}[:.]|\b(heute|morgen|monday|freitag|ganztags)|$))/i;
    const match = input.match(pattern);
    if (match) {
      const namesStr = match[2].trim();
      const names = namesStr
        .split(/\s*(,|&|und|and)\s*/)
        .map((n) => n.trim())
        .filter((n) => n.length > 0 && !/^(,|&|und|and)$/.test(n));
      return { names, cleaned: input.replace(match[0], ' ').trim() };
    }
    return { names: [], cleaned: input };
  }

  private static extractRecurrence(input: string): {
    type?: 'daily' | 'weekly' | 'monthly';
    cleaned: string;
  } {
    const patterns = [
      { pattern: /\b(täglich|daily|jeden tag|every day)\b/i, type: 'daily' as const },
      { pattern: /\b(wöchentlich|weekly|jede woche|every week)\b/i, type: 'weekly' as const },
      { pattern: /\b(monatlich|monthly|jeden monat|every month)\b/i, type: 'monthly' as const },
    ];

    for (const { pattern, type } of patterns) {
      const match = input.match(pattern);
      if (match) {
        return { type, cleaned: input.replace(pattern, ' ').trim() };
      }
    }

    return { cleaned: input };
  }

  private static extractTags(input: string): { tags: string[]; cleaned: string } {
    const pattern = /#([a-zäöüß0-9]+)/gi;
    const matches = [...input.matchAll(pattern)];
    const tags = matches.map((m) => m[1]);
    let cleaned = input;
    for (const match of matches) {
      cleaned = cleaned.replace(match[0], ' ');
    }
    return { tags, cleaned: cleaned.trim() };
  }

  private static extractCalendar(input: string): { key?: string; cleaned: string } {
    const pattern = /\/([a-z]+)/i;
    const match = input.match(pattern);
    if (match) {
      return { key: match[1].toLowerCase(), cleaned: input.replace(pattern, ' ').trim() };
    }
    return { cleaned: input };
  }

  private static extractTodoKeywords(input: string): { found: boolean; cleaned: string } {
    const pattern = /\b(todo|task|aufgabe)\b/i;
    const match = input.match(pattern);
    if (match) {
      return { found: true, cleaned: input.replace(pattern, ' ').trim() };
    }
    return { found: false, cleaned: input };
  }

  private static extractVideoCall(input: string): {
    type?: 'zoom' | 'meet' | 'teams';
    cleaned: string;
  } {
    const patterns = [
      { pattern: /\bzoom\b/i, type: 'zoom' as const },
      { pattern: /\b(google\s*meet|meet)\b/i, type: 'meet' as const },
      { pattern: /\b(teams|microsoft\s*teams)\b/i, type: 'teams' as const },
    ];

    for (const { pattern, type } of patterns) {
      const match = input.match(pattern);
      if (match) {
        return { type, cleaned: input.replace(pattern, ' ').trim() };
      }
    }

    return { cleaned: input };
  }

  private static getNextWeekday(targetDay: number): Date {
    const date = new Date();
    const currentDay = date.getDay();
    let daysToAdd = targetDay - currentDay;

    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }

    date.setDate(date.getDate() + daysToAdd);
    return date;
  }

  static getCheatSheet(): string[] {
    return [
      'h = heute, m = morgen, ü = übermorgen',
      'mo di mi do f sa so = Wochentage',
      '+30 = in 30 Minuten',
      '10:30 oder 10 uhr',
      '25.12 oder 25.12.24',
      'ganztags = All-Day Event',
      '/work /privat = Kalender',
      'with Max, at Café = Teilnehmer, Ort',
      'reminder 10 = Erinnerung 10 Min vorher',
      'p1 p2 p3 = Priorität',
      'todo oder √ = Task statt Event',
      '#privat = Tag',
      '€10 = Einsatz',
      'zoom/meet/teams = Video-Link',
      'täglich/wöchentlich = Wiederholung',
    ];
  }
}
