import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Task, LedgerEntry, User, DashboardStats, List, UndoAction, MemberRole } from '@/types';
import { Language, getTranslations, Translations } from '@/constants/translations';
import { MOCK_TASKS, MOCK_USERS, MOCK_LISTS, MOCK_LEDGER_ENTRIES } from '@/mocks/data';
import { ClockService } from '@/services/ClockService';
import { LedgerService } from '@/services/LedgerService';
import { SchedulerService } from '@/services/SchedulerService';
import { InviteService } from '@/services/InviteService';
import { ListService, ListSettingsPayload } from '@/services/ListService';


export type CalendarViewType = 'day' | 'week' | 'month';

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
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(MOCK_LEDGER_ENTRIES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [lists, setLists] = useState<List[]>(MOCK_LISTS);
  const [currentUserId, setCurrentUserId] = useState<string>('user-1');
  const [currentListId, setCurrentListId] = useState<string>('list-1');
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [language, setLanguage] = useState<Language>('en');
  const [t, setT] = useState<Translations>(getTranslations('en'));


  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      return stored ? JSON.parse(stored) : MOCK_TASKS;
    },
    staleTime: Infinity,
  });

  const ledgerQuery = useQuery({
    queryKey: ['ledger-entries'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LEDGER_ENTRIES);
      return stored ? JSON.parse(stored) : MOCK_LEDGER_ENTRIES;
    },
    staleTime: Infinity,
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return stored ? JSON.parse(stored) : MOCK_USERS;
    },
    staleTime: Infinity,
  });

  const listsQuery = useQuery({
    queryKey: ['lists'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LISTS);
      return stored ? JSON.parse(stored) : MOCK_LISTS;
    },
    staleTime: Infinity,
  });

  const currentUserQuery = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored || 'user-1';
    },
    staleTime: Infinity,
  });

  const currentListQuery = useQuery({
    queryKey: ['current-list'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_LIST);
      return stored || 'list-1';
    },
    staleTime: Infinity,
  });

  const calendarViewQuery = useQuery({
    queryKey: ['calendar-view'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_VIEW);
      return (stored as CalendarViewType) || 'month';
    },
    staleTime: Infinity,
  });

  const calendarDateQuery = useQuery({
    queryKey: ['calendar-date'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_SELECTED_DATE);
      return stored ? new Date(stored) : new Date();
    },
    staleTime: Infinity,
  });

  const languageQuery = useQuery({
    queryKey: ['language'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return (stored as Language) || 'en';
    },
    staleTime: Infinity,
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

  const updateTaskStatuses = useCallback(() => {
    const now = ClockService.getCurrentTime();
    let hasChanges = false;
    
    const updatedTasks = tasks.map((task) => {
      if (task.status === 'completed' || task.status === 'failed') {
        return task;
      }

      const migrated = ClockService.migrateTask(task);
      const isOverdue = ClockService.isOverdue(migrated.endAt);
      const isFailed = ClockService.isFailed(migrated.endAt, task.gracePeriod);

      if (isFailed) {
        console.log(`[Scheduler] Task ${task.id} (${task.title}) is now failed`);
        hasChanges = true;
        
        const ledgerEntry = LedgerService.post(task);
        setLedgerEntries((prev) => [...prev, ledgerEntry]);
        mutateLedger([...ledgerEntries, ledgerEntry]);

        return {
          ...task,
          status: 'failed' as const,
          failedAt: now.toISOString(),
          previousStatus: task.status,
        };
      } else if (isOverdue && task.status === 'pending') {
        console.log(`[Scheduler] Task ${task.id} (${task.title}) is now overdue`);
        hasChanges = true;
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

    console.log(`[Task] Completed: ${task.title}`);
  }, [tasks, ledgerEntries, mutateTasks, mutateLedger]);

  const failTask = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const now = ClockService.getCurrentTime();
    const ledgerEntry = LedgerService.post(task);

    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'failed' as const,
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

    console.log(`[Task] Failed: ${task.title}, Undo available for 10s`);
  }, [tasks, ledgerEntries, mutateTasks, mutateLedger]);

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

  const dashboardStats = useMemo((): DashboardStats => {
    const openTasks = currentListTasks.filter((t) => t.status === 'pending').length;
    const overdueTasks = currentListTasks.filter((t) => t.status === 'overdue').length;

    const now = ClockService.getCurrentTime();
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

    const nextDueTask = currentListTasks
      .filter((t) => t.status === 'pending' || t.status === 'overdue')
      .sort((a, b) => {
        const aMigrated = ClockService.migrateTask(a);
        const bMigrated = ClockService.migrateTask(b);
        return new Date(aMigrated.endAt).getTime() - new Date(bMigrated.endAt).getTime();
      })[0];

    return {
      openTasks,
      overdueTasks,
      completedThisMonth,
      totalBalance: currentUserBalance,
      nextDueTask,
      monthlyComparison: {
        tasksChange: 0,
        balanceChange: 0,
      },
    };
  }, [currentListTasks, currentListLedger, currentUserId]);

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

  const currentUser = users.find((u) => u.id === currentUserId);

  const getCategoryColor = useCallback(
    (categoryId: string): string => {
      const category = currentList?.categories.find((c) => c.id === categoryId);
      return category?.color || '#6B7280';
    },
    [currentList]
  );

  const getCategoryEmoji = useCallback(
    (categoryId: string): string => {
      const category = currentList?.categories.find((c) => c.id === categoryId);
      return category?.emoji || '📁';
    },
    [currentList]
  );

  const getCategoryLabel = useCallback(
    (categoryId: string): string => {
      const category = currentList?.categories.find((c) => c.id === categoryId);
      return category?.label || categoryId;
    },
    [currentList]
  );

  return useMemo(
    () => ({
      tasks: currentListTasks,
      allTasks: tasks,
      ledgerEntries: currentListLedger,
      allLedgerEntries: ledgerEntries,
      users,
      lists,
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
      removeMember,
      updateUserProfile,
      currentUserRole,
      language,
      t,
      changeLanguage,
      getCategoryColor,
      getCategoryEmoji,
      getCategoryLabel,
      isLoading: tasksQuery.isLoading || ledgerQuery.isLoading || usersQuery.isLoading || listsQuery.isLoading,
    }),
    [
      currentListTasks,
      tasks,
      currentListLedger,
      ledgerEntries,
      users,
      lists,
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
      removeMember,
      updateUserProfile,
      currentUserRole,
      language,
      t,
      changeLanguage,
      getCategoryColor,
      getCategoryEmoji,
      getCategoryLabel,
      tasksQuery.isLoading,
      ledgerQuery.isLoading,
      usersQuery.isLoading,
      listsQuery.isLoading,
    ]
  );
});
