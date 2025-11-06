import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Task, LedgerEntry, User, List, UndoAction, TaskCategory, CategoryMeta, ListMember, MemberRole, FundTarget } from '@/types';
import { Language, getTranslations, Translations } from '@/constants/translations';
import { MOCK_TASKS, MOCK_USERS, MOCK_LISTS, MOCK_LEDGER_ENTRIES, MOCK_FUND_TARGETS } from '@/mocks/data';
import { ClockService } from '@/services/ClockService';
import { LedgerService } from '@/services/LedgerService';
import { SchedulerService } from '@/services/SchedulerService';
import { NotificationService } from '@/services/NotificationService';
import { InviteService } from '@/services/InviteService';
import { ListService, ListSettingsPayload } from '@/services/ListService';
import { CategoryService } from '@/services/CategoryService';
import { MemberService } from '@/services/MemberService';
import { TaskLogicService } from '@/services/TaskLogicService';
import { DashboardService, EnhancedDashboardStats } from '@/services/DashboardService';

export type CalendarViewType = 'day' | 'week' | 'month' | 'list';

const STORAGE_KEYS = {
  TASKS: '@bettertogether/tasks',
  LEDGER_ENTRIES: '@bettertogether/ledger_entries',
  CURRENT_USER: '@bettertogether/current_user',
  CURRENT_LIST: '@bettertogether/current_list',
  USERS: '@bettertogether/users',
  LISTS: '@bettertogether/lists',
  CALENDAR_VIEW: '@bettertogether/calendar_view',
  CALENDAR_SELECTED_DATE: '@bettertogether/calendar_selected_date',
  MEMBERSHIPS: '@bettertogether/memberships',
  LANGUAGE: '@bettertogether/language',
  FUND_TARGETS: '@bettertogether/fund_targets',
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [fundTargets, setFundTargets] = useState<FundTarget[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('user-1');
  const [currentListId, setCurrentListId] = useState<string>('list-1');
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [language, setLanguage] = useState<Language>('en');
  const [t, setT] = useState<Translations>(getTranslations('en'));
  const [jokerModalVisible, setJokerModalVisible] = useState(false);
  const [pendingFailedTask, setPendingFailedTask] = useState<Task | null>(null);

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
        return stored ? JSON.parse(stored) : MOCK_TASKS;
      } catch (error) {
        console.error('[Storage] Error loading tasks:', error);
        return MOCK_TASKS;
      }
    },
  });

  const ledgerQuery = useQuery({
    queryKey: ['ledger-entries'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.LEDGER_ENTRIES);
        return stored ? JSON.parse(stored) : MOCK_LEDGER_ENTRIES;
      } catch (error) {
        console.error('[Storage] Error loading ledger entries:', error);
        return MOCK_LEDGER_ENTRIES;
      }
    },
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
        return stored ? JSON.parse(stored) : MOCK_USERS;
      } catch (error) {
        console.error('[Storage] Error loading users:', error);
        return MOCK_USERS;
      }
    },
  });

  const listsQuery = useQuery({
    queryKey: ['lists'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.LISTS);
        return stored ? JSON.parse(stored) : MOCK_LISTS;
      } catch (error) {
        console.error('[Storage] Error loading lists:', error);
        return MOCK_LISTS;
      }
    },
  });

  const currentUserQuery = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored || 'user-1';
    },
  });

  const currentListQuery = useQuery({
    queryKey: ['current-list'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_LIST);
      return stored || 'list-1';
    },
  });

  const calendarViewQuery = useQuery({
    queryKey: ['calendar-view'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_VIEW);
      return (stored as CalendarViewType) || 'month';
    },
  });

  const calendarDateQuery = useQuery({
    queryKey: ['calendar-date'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_SELECTED_DATE);
        return stored ? new Date(stored) : new Date();
      } catch (error) {
        console.error('[Storage] Error loading calendar date:', error);
        return new Date();
      }
    },
  });

  const languageQuery = useQuery({
    queryKey: ['language'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return (stored as Language) || 'en';
    },
  });

  const fundTargetsQuery = useQuery({
    queryKey: ['fund-targets'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.FUND_TARGETS);
        return stored ? JSON.parse(stored) : MOCK_FUND_TARGETS;
      } catch (error) {
        console.error('[Storage] Error loading fund targets:', error);
        return MOCK_FUND_TARGETS;
      }
    },
  });

  useEffect(() => {
    if (tasksQuery.data) {
      setTasks(tasksQuery.data);
    }
  }, [tasksQuery.data]);

  useEffect(() => {
    if (ledgerQuery.data) {
      setLedgerEntries(ledgerQuery.data);
    }
  }, [ledgerQuery.data]);

  useEffect(() => {
    if (usersQuery.data) {
      setUsers(usersQuery.data);
    }
  }, [usersQuery.data]);

  useEffect(() => {
    if (listsQuery.data) {
      setLists(listsQuery.data);
    }
  }, [listsQuery.data]);

  useEffect(() => {
    if (currentUserQuery.data) {
      setCurrentUserId(currentUserQuery.data);
    }
  }, [currentUserQuery.data]);

  useEffect(() => {
    if (currentListQuery.data) {
      setCurrentListId(currentListQuery.data);
    }
  }, [currentListQuery.data]);

  useEffect(() => {
    if (calendarViewQuery.data) {
      setCalendarView(calendarViewQuery.data);
    }
  }, [calendarViewQuery.data]);

  useEffect(() => {
    if (calendarDateQuery.data) {
      setSelectedDate(calendarDateQuery.data);
    }
  }, [calendarDateQuery.data]);

  useEffect(() => {
    if (languageQuery.data) {
      setLanguage(languageQuery.data);
      setT(getTranslations(languageQuery.data));
    }
  }, [languageQuery.data]);

  useEffect(() => {
    NotificationService.initialize();
  }, []);

  useEffect(() => {
    if (fundTargetsQuery.data) {
      setFundTargets(fundTargetsQuery.data);
    }
  }, [fundTargetsQuery.data]);

  const { mutate: mutateTasks } = useMutation({
    mutationFn: async (newTasks: Task[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
      return newTasks;
    },
  });

  const { mutate: mutateLedger } = useMutation({
    mutationFn: async (newEntries: LedgerEntry[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.LEDGER_ENTRIES, JSON.stringify(newEntries));
      return newEntries;
    },
  });

  const { mutate: mutateLists } = useMutation({
    mutationFn: async (newLists: List[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(newLists));
      return newLists;
    },
  });

  const { mutate: mutateCurrentList } = useMutation({
    mutationFn: async (listId: string) => {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_LIST, listId);
      return listId;
    },
  });

  const { mutate: mutateCalendarView } = useMutation({
    mutationFn: async (view: CalendarViewType) => {
      await AsyncStorage.setItem(STORAGE_KEYS.CALENDAR_VIEW, view);
      return view;
    },
  });

  const { mutate: mutateCalendarDate } = useMutation({
    mutationFn: async (date: Date) => {
      await AsyncStorage.setItem(STORAGE_KEYS.CALENDAR_SELECTED_DATE, date.toISOString());
      return date;
    },
  });

  const { mutate: mutateLanguage } = useMutation({
    mutationFn: async (lang: Language) => {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      return lang;
    },
  });

  const { mutate: mutateFundTargets } = useMutation({
    mutationFn: async (newTargets: FundTarget[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.FUND_TARGETS, JSON.stringify(newTargets));
      return newTargets;
    },
  });

  const { mutate: mutateUsers } = useMutation({
    mutationFn: async (newUsers: User[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
      return newUsers;
    },
  });

  useEffect(() => {
    if (fundTargets.length > 0 && ledgerEntries.length > 0) {
      const synced = fundTargets.map((fund) => {
        const totalFromLedger = LedgerService.getFundTargetTotal(ledgerEntries, fund.id);
        const totalCents = Math.round(totalFromLedger * 100);
        
        if (totalCents !== fund.totalCollectedCents) {
          console.log(`[FundTarget] Syncing ${fund.name}: ${fund.totalCollectedCents} -> ${totalCents}`);
          return { ...fund, totalCollectedCents: totalCents };
        }
        return fund;
      });
      
      const hasChanges = synced.some((fund, i) => fund.totalCollectedCents !== fundTargets[i].totalCollectedCents);
      if (hasChanges) {
        setFundTargets(synced);
        mutateFundTargets(synced);
      }
    }
  }, [ledgerEntries]);

  const updateTaskStatuses = useCallback(() => {
    const now = ClockService.getCurrentTime();
    let hasChanges = false;
    const newLedgerEntries: LedgerEntry[] = [];
    
    const updatedTasks = tasks.map((task) => {
      if (task.status === 'completed' || task.status === 'failed') {
        return task;
      }

      const computedStatus = TaskLogicService.computeTaskState(task);
      
      if (computedStatus === 'failed') {
        console.log(`[Scheduler] Task ${task.id} (${task.title}) is now failed`);
        hasChanges = true;
        
        const ledgerEntry = LedgerService.post(task);
        newLedgerEntries.push(ledgerEntry);

        NotificationService.sendTaskFailedNotification(task, task.stake);

        return {
          ...task,
          status: 'failed' as const,
          failedAt: now.toISOString(),
          previousStatus: task.status,
        };
      } else if (computedStatus === 'overdue' && task.status === 'pending') {
        console.log(`[Scheduler] Task ${task.id} (${task.title}) is now overdue`);
        hasChanges = true;
        NotificationService.sendTaskOverdueNotification(task);
        return {
          ...task,
          status: 'overdue' as const,
        };
      }

      return task;
    });

    if (hasChanges) {
      setTasks(updatedTasks);
      mutateTasks(updatedTasks);
      
      if (newLedgerEntries.length > 0) {
        const allEntries = [...ledgerEntries, ...newLedgerEntries];
        setLedgerEntries(allEntries);
        mutateLedger(allEntries);
      }
    }
  }, [tasks, ledgerEntries, mutateTasks, mutateLedger]);

  useEffect(() => {
    updateTaskStatuses();
    
    const unsubscribe = SchedulerService.subscribe(() => {
      console.log('[Scheduler] Running periodic check...');
      updateTaskStatuses();
    });

    SchedulerService.start();

    return () => {
      unsubscribe();
    };
  }, [updateTaskStatuses]);

  const completeTask = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const taskUserId = typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo[0];
    const user = users.find((u) => u.id === taskUserId);
    if (!user) {
      console.error(`[Task] User not found for task ${taskId}`);
      return;
    }

    const newStreakCount = user.currentStreakCount + 1;
    const earnedJoker = newStreakCount % 10 === 0;

    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          currentStreakCount: newStreakCount,
          jokerCount: earnedJoker ? u.jokerCount + 1 : u.jokerCount,
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    mutateUsers(updatedUsers);

    if (earnedJoker) {
      NotificationService.sendStreakJokerEarnedNotification(newStreakCount);
      console.log(`[Streak] User ${user.name} earned a joker! Streak: ${newStreakCount}`);
    } else {
      console.log(`[Streak] User ${user.name} streak: ${newStreakCount}`);
    }

    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'completed' as const,
          completedAt: ClockService.getCurrentTime().toISOString(),
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    mutateTasks(updatedTasks);

    const existingLedgerEntry = ledgerEntries.find((e) => e.taskId === taskId);
    if (existingLedgerEntry) {
      const updatedEntries = LedgerService.reverse(existingLedgerEntry.id, ledgerEntries);
      setLedgerEntries(updatedEntries);
      mutateLedger(updatedEntries);
    }

    NotificationService.cancelTaskNotifications(taskId);
    NotificationService.sendTaskCompletedNotification(task);

    console.log(`[Task] Completed: ${task.title}`);
  }, [tasks, users, ledgerEntries, mutateTasks, mutateUsers, mutateLedger]);

  const failTask = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const taskUserId = typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo[0];
    const user = users.find((u) => u.id === taskUserId);
    if (!user) {
      console.error(`[Task] User not found for task ${taskId}`);
      return;
    }

    if (user.jokerCount > 0) {
      setPendingFailedTask(task);
      setJokerModalVisible(true);
      console.log(`[Task] User has ${user.jokerCount} jokers, showing modal`);
      return;
    }

    const now = ClockService.getCurrentTime();
    const ledgerEntry = LedgerService.post(task);

    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          currentStreakCount: 0,
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    mutateUsers(updatedUsers);
    console.log(`[Streak] User ${user.name} streak reset to 0`);

    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'failed_stake_paid' as const,
          failedAt: now.toISOString(),
          previousStatus: t.status,
        };
      }
      return t;
    });

    const updatedEntries = [...ledgerEntries, ledgerEntry];

    setTasks(updatedTasks);
    setLedgerEntries(updatedEntries);
    mutateTasks(updatedTasks);
    mutateLedger(updatedEntries);

    setUndoAction({
      taskId,
      ledgerEntryId: ledgerEntry.id,
      expiresAt: Date.now() + 10000,
    });

    NotificationService.sendTaskFailedNotification(task, task.stake);
    console.log(`[Task] Failed (stake paid): ${task.title}`);
  }, [tasks, users, ledgerEntries, mutateTasks, mutateUsers, mutateLedger]);

  const undoFailTask = useCallback(() => {
    if (!undoAction) return;

    const task = tasks.find((t) => t.id === undoAction.taskId);
    if (!task) {
      setUndoAction(null);
      return;
    }

    const updatedTasks = tasks.map((t) => {
      if (t.id === undoAction.taskId) {
        return {
          ...t,
          status: t.previousStatus || 'overdue' as const,
          failedAt: undefined,
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    mutateTasks(updatedTasks);

    if (undoAction.ledgerEntryId) {
      const updatedEntries = LedgerService.reverse(undoAction.ledgerEntryId, ledgerEntries);
      setLedgerEntries(updatedEntries);
      mutateLedger(updatedEntries);
    }

    console.log(`[Task] Undo: ${task.title}`);
    setUndoAction(null);
  }, [undoAction, tasks, ledgerEntries, mutateTasks, mutateLedger]);

  useEffect(() => {
    if (!undoAction) return;

    const timeout = setTimeout(() => {
      console.log('[Undo] Expired');
      setUndoAction(null);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [undoAction]);

  const addTask = useCallback(
    (task: Omit<Task, 'id' | 'createdAt' | 'listId' | 'status'>) => {
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
        listId: currentListId,
        status: 'pending',
        createdAt: ClockService.getCurrentTime().toISOString(),
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      mutateTasks(updatedTasks);
      
      if (newTask.reminder && newTask.reminder !== 'none') {
        NotificationService.scheduleTaskReminder(newTask);
      }
    },
    [tasks, currentListId, mutateTasks]
  );

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'listId' | 'status'>>) => {
      const updatedTasks = tasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, ...updates };
        }
        return t;
      });
      setTasks(updatedTasks);
      mutateTasks(updatedTasks);
      
      const updatedTask = updatedTasks.find(t => t.id === taskId);
      if (updatedTask) {
        NotificationService.cancelTaskNotifications(taskId);
        if (updatedTask.reminder && updatedTask.reminder !== 'none') {
          NotificationService.scheduleTaskReminder(updatedTask);
        }
      }
      
      console.log(`[Task] Updated: ${taskId}`);
    },
    [tasks, mutateTasks]
  );

  const switchList = useCallback(
    (listId: string) => {
      setCurrentListId(listId);
      mutateCurrentList(listId);
      console.log(`[List] Switched to: ${listId}`);
    },
    [mutateCurrentList]
  );

  const generateInviteLink = useCallback(
    (listId: string) => {
      const list = lists.find((l) => l.id === listId);
      if (!list) return null;

      const token = list.inviteToken || InviteService.generateToken(listId);
      
      if (!list.inviteToken) {
        const updatedLists = lists.map((l) => {
          if (l.id === listId) {
            return { ...l, inviteToken: token };
          }
          return l;
        });
        setLists(updatedLists);
        mutateLists(updatedLists);
      }

      return InviteService.generateInviteLink(listId, token);
    },
    [lists, mutateLists]
  );

  const joinList = useCallback(
    async (listId: string, userName: string) => {
      const list = lists.find((l) => l.id === listId);
      if (!list) {
        console.error('[Join] List not found');
        return false;
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userName,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        currentStreakCount: 0,
        jokerCount: 0,
      };

      const updatedUsers = [...users, newUser];
      const updatedLists = lists.map((l) => {
        if (l.id === listId) {
          return {
            ...l,
            memberIds: [...l.memberIds, newUser.id],
          };
        }
        return l;
      });

      setUsers(updatedUsers);
      setLists(updatedLists);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      mutateLists(updatedLists);

      console.log(`[Join] User ${userName} joined list ${listId}`);
      return true;
    },
    [users, lists, mutateLists]
  );

  const currentListTasks = useMemo(() => {
    return tasks.filter((t) => t.listId === currentListId);
  }, [tasks, currentListId]);

  const currentListLedger = useMemo(() => {
    return ledgerEntries.filter((e) => e.listId === currentListId);
  }, [ledgerEntries, currentListId]);

  const currentList = useMemo(() => {
    return lists.find((l) => l.id === currentListId);
  }, [lists, currentListId]);

  const currentListMembers = useMemo(() => {
    if (!currentList) return [];
    return users.filter((u) => currentList.memberIds.includes(u.id));
  }, [users, currentList]);

  const dashboardStats = useMemo((): EnhancedDashboardStats => {
    return DashboardService.getEnhancedStats(
      tasks,
      ledgerEntries,
      fundTargets,
      currentUserId,
      currentListId
    );
  }, [tasks, ledgerEntries, fundTargets, currentUserId, currentListId]);

  const getUserBalance = useCallback(
    (userId: string): number => {
      return currentListLedger
        .filter((e) => e.userId === userId)
        .reduce((acc, entry) => acc - entry.amount, 0);
    },
    [currentListLedger]
  );

  const setCalendarViewType = useCallback(
    (view: CalendarViewType) => {
      setCalendarView(view);
      mutateCalendarView(view);
      console.log(`[Calendar] View changed to: ${view}`);
    },
    [mutateCalendarView]
  );

  const setCalendarSelectedDate = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      mutateCalendarDate(date);
      console.log(`[Calendar] Selected date: ${date.toDateString()}`);
    },
    [mutateCalendarDate]
  );

  const changeLanguage = useCallback(
    (lang: Language) => {
      setLanguage(lang);
      setT(getTranslations(lang));
      mutateLanguage(lang);
      console.log(`[Language] Changed to: ${lang}`);
    },
    [mutateLanguage]
  );

  const updateListSettings = useCallback(
    (listId: string, payload: ListSettingsPayload) => {
      const list = lists.find((l) => l.id === listId);
      if (!list) return false;

      const validation = ListService.validate(payload);
      if (!validation.valid) {
        console.error('[ListService] Validation failed:', validation.error);
        return false;
      }

      const updatedList = ListService.updateSettings(list, payload);
      const updatedLists = lists.map((l) => (l.id === listId ? updatedList : l));
      
      setLists(updatedLists);
      mutateLists(updatedLists);
      console.log(`[List] Updated settings for ${listId}`);
      return true;
    },
    [lists, mutateLists]
  );

  const createList = useCallback(
    (name: string, currency: string, currencySymbol: string) => {
      if (!currentList) return null;
      const newList = ListService.createList(
        name,
        currentUserId,
        currentList.categories,
        currency,
        currencySymbol
      );
      
      const updatedLists = [...lists, newList];
      setLists(updatedLists);
      mutateLists(updatedLists);
      return newList;
    },
    [lists, currentUserId, currentList, mutateLists]
  );

  const archiveList = useCallback(
    (listId: string) => {
      const list = lists.find((l) => l.id === listId);
      if (!list || list.ownerId !== currentUserId) {
        console.error('[List] Cannot archive: not owner');
        return false;
      }

      const archivedList = ListService.archiveList(list);
      const updatedLists = lists.map((l) => (l.id === listId ? archivedList : l));
      
      setLists(updatedLists);
      mutateLists(updatedLists);
      
      if (currentListId === listId && lists.length > 1) {
        const nextList = lists.find((l) => l.id !== listId && !l.archived);
        if (nextList) {
          switchList(nextList.id);
        }
      }
      
      return true;
    },
    [lists, currentUserId, currentListId, mutateLists, switchList]
  );

  const updateCategory = useCallback(
    (category: TaskCategory, updates: Partial<CategoryMeta>) => {
      if (!currentList) return false;

      const updatedCategories = CategoryService.updateCategory(
        currentList.categories,
        category,
        updates
      );
      
      const updatedLists = lists.map((l) => {
        if (l.id === currentListId) {
          return { ...l, categories: updatedCategories };
        }
        return l;
      });
      
      setLists(updatedLists);
      mutateLists(updatedLists);
      console.log(`[Category] Updated ${category}`);
      return true;
    },
    [currentList, currentListId, lists, mutateLists]
  );

  const reassignCategory = useCallback(
    (oldCategory: TaskCategory, newCategory: TaskCategory) => {
      const updatedTasks = CategoryService.reassign(tasks, oldCategory, newCategory);
      setTasks(updatedTasks);
      mutateTasks(updatedTasks);
      console.log(`[Category] Reassigned ${oldCategory} to ${newCategory}`);
      return true;
    },
    [tasks, mutateTasks]
  );

  const isCategoryInUse = useCallback(
    (category: TaskCategory): boolean => {
      return CategoryService.isInUse(currentListTasks, category);
    },
    [currentListTasks]
  );

  const getCategoryUsageCount = useCallback(
    (category: TaskCategory): number => {
      return CategoryService.getUsageCount(currentListTasks, category);
    },
    [currentListTasks]
  );

  const removeMember = useCallback(
    (userId: string) => {
      if (!currentList) return false;
      
      if (currentList.ownerId === userId) {
        console.error('[Member] Cannot remove owner');
        return false;
      }

      const updatedLists = lists.map((l) => {
        if (l.id === currentListId) {
          return {
            ...l,
            memberIds: l.memberIds.filter((id) => id !== userId),
          };
        }
        return l;
      });
      
      setLists(updatedLists);
      mutateLists(updatedLists);
      console.log(`[Member] Removed user ${userId}`);
      return true;
    },
    [currentList, currentListId, lists, mutateLists]
  );

  const updateUserProfile = useCallback(
    (userId: string, updates: Partial<User>) => {
      const updatedUsers = users.map((u) => {
        if (u.id === userId) {
          return { ...u, ...updates };
        }
        return u;
      });
      
      setUsers(updatedUsers);
      AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      console.log(`[User] Updated profile for ${userId}`);
      return true;
    },
    [users]
  );

  const currentUserRole = useMemo((): MemberRole => {
    if (!currentList) return 'Member';
    return currentList.ownerId === currentUserId ? 'Owner' : 'Member';
  }, [currentList, currentUserId]);

  const canManageCategories = useMemo((): boolean => {
    if (!currentList) return false;
    if (currentUserRole === 'Owner') return true;
    return currentList.allowMemberCategoryManage;
  }, [currentList, currentUserRole]);

  const currentUser = users.find((u) => u.id === currentUserId);

  const createFundTarget = useCallback(
    (name: string, emoji: string, description?: string, targetAmountCents?: number) => {
      const newFund: FundTarget = {
        id: `fund-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        listId: currentListId,
        name,
        emoji,
        description,
        targetAmountCents,
        totalCollectedCents: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      
      const updatedFunds = [...fundTargets, newFund];
      setFundTargets(updatedFunds);
      mutateFundTargets(updatedFunds);
      console.log('[FundTarget] Created:', newFund);
      return newFund;
    },
    [fundTargets, currentListId, mutateFundTargets]
  );

  const updateFundTarget = useCallback(
    (fundId: string, updates: Partial<Pick<FundTarget, 'name' | 'emoji' | 'description' | 'targetAmountCents'>>) => {
      const updatedFunds = fundTargets.map((f) => {
        if (f.id === fundId) {
          const updatedFund = { ...f, ...updates };
          if (updatedFund.targetAmountCents && updatedFund.totalCollectedCents >= updatedFund.targetAmountCents && 
              (!f.targetAmountCents || f.totalCollectedCents < f.targetAmountCents)) {
            NotificationService.sendFundGoalReachedNotification(
              updatedFund.name,
              updatedFund.emoji,
              updatedFund.targetAmountCents / 100
            );
          }
          return updatedFund;
        }
        return f;
      });
      
      setFundTargets(updatedFunds);
      mutateFundTargets(updatedFunds);
      console.log('[FundTarget] Updated:', fundId, updates);
      return true;
    },
    [fundTargets, mutateFundTargets]
  );

  const deleteFundTarget = useCallback(
    (fundId: string) => {
      const updatedFunds = fundTargets.map((f) => {
        if (f.id === fundId) {
          return { ...f, isActive: false };
        }
        return f;
      });
      
      setFundTargets(updatedFunds);
      mutateFundTargets(updatedFunds);
      console.log('[FundTarget] Deleted:', fundId);
      return true;
    },
    [fundTargets, mutateFundTargets]
  );

  const currentListFundTargets = useMemo(() => {
    return fundTargets.filter((f) => f.listId === currentListId && f.isActive);
  }, [fundTargets, currentListId]);

  const handleUseJoker = useCallback(() => {
    if (!pendingFailedTask) return;

    const taskUserId = typeof pendingFailedTask.assignedTo === 'string' 
      ? pendingFailedTask.assignedTo 
      : pendingFailedTask.assignedTo[0];
    const user = users.find((u) => u.id === taskUserId);
    if (!user) {
      console.error(`[Task] User not found for task ${pendingFailedTask.id}`);
      return;
    }

    const now = ClockService.getCurrentTime();

    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          jokerCount: u.jokerCount - 1,
          currentStreakCount: 0,
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    mutateUsers(updatedUsers);
    console.log(`[Joker] User ${user.name} used a joker. Remaining: ${user.jokerCount - 1}`);
    console.log(`[Streak] User ${user.name} streak reset to 0`);

    const updatedTasks = tasks.map((t) => {
      if (t.id === pendingFailedTask.id) {
        return {
          ...t,
          status: 'failed_joker_used' as const,
          failedAt: now.toISOString(),
          previousStatus: t.status,
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    mutateTasks(updatedTasks);

    console.log(`[Task] Failed (joker used): ${pendingFailedTask.title}`);
    setJokerModalVisible(false);
    setPendingFailedTask(null);
  }, [pendingFailedTask, tasks, users, mutateTasks, mutateUsers]);

  const handlePayStake = useCallback(() => {
    if (!pendingFailedTask) return;

    const taskUserId = typeof pendingFailedTask.assignedTo === 'string'
      ? pendingFailedTask.assignedTo
      : pendingFailedTask.assignedTo[0];
    const user = users.find((u) => u.id === taskUserId);
    if (!user) {
      console.error(`[Task] User not found for task ${pendingFailedTask.id}`);
      return;
    }

    const now = ClockService.getCurrentTime();
    const ledgerEntry = LedgerService.post(pendingFailedTask);

    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          currentStreakCount: 0,
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    mutateUsers(updatedUsers);
    console.log(`[Streak] User ${user.name} streak reset to 0`);

    const updatedTasks = tasks.map((t) => {
      if (t.id === pendingFailedTask.id) {
        return {
          ...t,
          status: 'failed_stake_paid' as const,
          failedAt: now.toISOString(),
          previousStatus: t.status,
        };
      }
      return t;
    });

    const updatedEntries = [...ledgerEntries, ledgerEntry];

    setTasks(updatedTasks);
    setLedgerEntries(updatedEntries);
    mutateTasks(updatedTasks);
    mutateLedger(updatedEntries);

    setUndoAction({
      taskId: pendingFailedTask.id,
      ledgerEntryId: ledgerEntry.id,
      expiresAt: Date.now() + 10000,
    });

    NotificationService.sendTaskFailedNotification(pendingFailedTask, pendingFailedTask.stake);
    console.log(`[Task] Failed (stake paid): ${pendingFailedTask.title}`);
    setJokerModalVisible(false);
    setPendingFailedTask(null);
  }, [pendingFailedTask, tasks, users, ledgerEntries, mutateTasks, mutateUsers, mutateLedger]);

  return useMemo(
    () => ({
      tasks: currentListTasks,
      allTasks: tasks,
      ledgerEntries: currentListLedger,
      allLedgerEntries: ledgerEntries,
      users,
      lists,
      fundTargets: currentListFundTargets,
      allFundTargets: fundTargets,
      currentUser,
      currentUserId,
      currentList,
      currentListId,
      currentListMembers,
      dashboardStats,
      undoAction,
      calendarView,
      selectedDate,
      completeTask,
      failTask,
      undoFailTask,
      addTask,
      updateTask,
      switchList,
      generateInviteLink,
      joinList,
      getUserBalance,
      setCalendarViewType,
      setCalendarSelectedDate,
      updateListSettings,
      createList,
      archiveList,
      updateCategory,
      reassignCategory,
      isCategoryInUse,
      getCategoryUsageCount,
      removeMember,
      updateUserProfile,
      currentUserRole,
      canManageCategories,
      createFundTarget,
      updateFundTarget,
      deleteFundTarget,
      language,
      t,
      changeLanguage,
      jokerModalVisible,
      pendingFailedTask,
      handleUseJoker,
      handlePayStake,
      isLoading: tasksQuery.isLoading || ledgerQuery.isLoading,
    }),
    [
      currentListTasks,
      tasks,
      currentListLedger,
      ledgerEntries,
      users,
      lists,
      currentListFundTargets,
      fundTargets,
      currentUser,
      currentUserId,
      currentList,
      currentListId,
      currentListMembers,
      dashboardStats,
      undoAction,
      calendarView,
      selectedDate,
      completeTask,
      failTask,
      undoFailTask,
      addTask,
      updateTask,
      switchList,
      generateInviteLink,
      joinList,
      getUserBalance,
      setCalendarViewType,
      setCalendarSelectedDate,
      updateListSettings,
      createList,
      archiveList,
      updateCategory,
      reassignCategory,
      isCategoryInUse,
      getCategoryUsageCount,
      removeMember,
      updateUserProfile,
      currentUserRole,
      canManageCategories,
      createFundTarget,
      updateFundTarget,
      deleteFundTarget,
      language,
      t,
      changeLanguage,
      jokerModalVisible,
      pendingFailedTask,
      handleUseJoker,
      handlePayStake,
      tasksQuery.isLoading,
      ledgerQuery.isLoading,
    ]
  );
});
