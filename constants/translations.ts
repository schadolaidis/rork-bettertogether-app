export type Language = 'en' | 'de';

export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    remove: string;
    confirm: string;
    yes: string;
    no: string;
    ok: string;
    close: string;
    back: string;
    next: string;
    done: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    search: string;
    filter: string;
    all: string;
    none: string;
    select: string;
    members: string;
    member: string;
  };
  tabs: {
    dashboard: string;
    tasks: string;
    balances: string;
    settings: string;
  };
  dashboard: {
    welcomeBack: string;
    openTasks: string;
    overdue: string;
    completed: string;
    balance: string;
    nextDue: string;
    upcomingTasks: string;
    noUpcomingTasks: string;
    calendar: string;
    view: string;
    thisMonth: string;
    tasks: string;
    noTasksForDay: string;
  };
  tasks: {
    title: string;
    createNewTask: string;
    createTaskDescription: string;
    taskDetails: string;
    taskTitle: string;
    description: string;
    category: string;
    dueDate: string;
    startDate: string;
    endDate: string;
    stake: string;
    status: string;
    assignedTo: string;
    gracePeriod: string;
    priority: string;
    reminder: string;
    recurrence: string;
    pending: string;
    completed: string;
    failed: string;
    overdue: string;
    noTasks: string;
    noTasksDescription: string;
    taskMarkedAsFailed: string;
    undo: string;
    today: string;
    clearFilters: string;
    allDay: string;
    minutes: string;
    low: string;
    medium: string;
    high: string;
  };
  balances: {
    title: string;
    overview: string;
    history: string;
    stats: string;
    myBalance: string;
    totalExpenses: string;
    thisMonth: string;
    groupBalance: string;
    memberBalances: string;
    noMembers: string;
    transactionHistory: string;
    noTransactions: string;
    transactionsWillAppear: string;
    categoryBreakdown: string;
    noCategoryData: string;
    completeTasks: string;
    monthlyOverview: string;
    total: string;
    avgTransaction: string;
    insights: string;
    topSpender: string;
    mostReliable: string;
    totalTransactions: string;
    activeMembers: string;
    of: string;
    transactions: string;
    receives: string;
    owes: string;
    settled: string;
    tasksCompleted: string;
  };
  settings: {
    title: string;
    currentList: string;
    generateInviteLink: string;
    shareWithOthers: string;
    allLists: string;
    manage: string;
    categories: string;
    manageCategories: string;
    teamMembers: string;
    account: string;
    profile: string;
    updateProfile: string;
    notifications: string;
    manageNotifications: string;
    about: string;
    appSettings: string;
    themeAndPreferences: string;
    signOut: string;
    logOut: string;
    active: string;
    version: string;
    madeWithLove: string;
    permissionRequired: string;
    ownerOnly: string;
    switchToList: string;
    viewSettings: string;
    whatToDo: string;
    language: string;
    changeLanguage: string;
    english: string;
    german: string;
  };
  profile: {
    title: string;
    tapToChange: string;
    removePhoto: string;
    personalInfo: string;
    displayName: string;
    enterYourName: string;
    email: string;
    yourEmail: string;
    avatarColor: string;
    saveChanges: string;
    profileUpdated: string;
    failedToUpdate: string;
    permissionNeeded: string;
    cameraPermission: string;
  };
  teams: {
    title: string;
    teamMembers: string;
    manageMembersDescription: string;
    inviteMember: string;
    shareInviteLink: string;
    inviteLinkCopied: string;
    searchMembers: string;
    owner: string;
    joined: string;
    removeMember: string;
    confirmRemove: string;
    memberRemoved: string;
    failedToRemove: string;
    noMembersFound: string;
    tryDifferentSearch: string;
    noListSelected: string;
    recentlyJoined: string;
  };
  categories: {
    title: string;
    manageCategories: string;
    categoriesDescription: string;
    categoryName: string;
    emoji: string;
    color: string;
    usageInfo: string;
    tasksInCategory: string;
    noCategories: string;
    household: string;
    finance: string;
    work: string;
    leisure: string;
  };
  listSettings: {
    title: string;
    listName: string;
    currency: string;
    defaultGrace: string;
    defaultStake: string;
    permissions: string;
    allowMemberManage: string;
    dangerZone: string;
    archiveList: string;
    archiveWarning: string;
    settingsUpdated: string;
    listArchived: string;
  };
  alerts: {
    comingSoon: string;
    featureComingSoon: string;
    error: string;
    success: string;
    confirm: string;
    areYouSure: string;
    cannotUndo: string;
    inviteLinkCopied: string;
    listSwitched: string;
    failedToGenerate: string;
  };
}

const en: Translations = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    none: 'None',
    select: 'Select',
    members: 'members',
    member: 'member',
  },
  tabs: {
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    balances: 'Balances',
    settings: 'Settings',
  },
  dashboard: {
    welcomeBack: 'Welcome back,',
    openTasks: 'Open Tasks',
    overdue: 'Overdue',
    completed: 'Completed',
    balance: 'Balance',
    nextDue: 'Next Due',
    upcomingTasks: 'Upcoming Tasks',
    noUpcomingTasks: 'No upcoming tasks',
    calendar: 'Calendar',
    view: 'View',
    thisMonth: 'This month',
    tasks: 'tasks',
    noTasksForDay: 'No tasks for this day',
  },
  tasks: {
    title: 'Tasks',
    createNewTask: 'Create New Task',
    createTaskDescription: 'Add a task with category, schedule, stake, and members',
    taskDetails: 'Task Details',
    taskTitle: 'Task Title',
    description: 'Description',
    category: 'Category',
    dueDate: 'Due Date',
    startDate: 'Start Date',
    endDate: 'End Date',
    stake: 'Stake',
    status: 'Status',
    assignedTo: 'Assigned To',
    gracePeriod: 'Grace Period',
    priority: 'Priority',
    reminder: 'Reminder',
    recurrence: 'Recurrence',
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    overdue: 'Overdue',
    noTasks: 'No tasks yet',
    noTasksDescription: 'Tap "Create New Task" to add your first one',
    taskMarkedAsFailed: 'Task marked as failed',
    undo: 'Undo',
    today: 'Today',
    clearFilters: 'Clear Filters',
    allDay: 'All Day',
    minutes: 'minutes',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  },
  balances: {
    title: 'Balances',
    overview: 'Overview',
    history: 'History',
    stats: 'Stats',
    myBalance: 'My Balance',
    totalExpenses: 'Total Expenses',
    thisMonth: 'This Month',
    groupBalance: 'Group Balance',
    memberBalances: 'Member Balances',
    noMembers: 'No members yet',
    transactionHistory: 'Transaction History',
    noTransactions: 'No transactions this month',
    transactionsWillAppear: 'Failed tasks will appear here',
    categoryBreakdown: 'Category Breakdown',
    noCategoryData: 'No category data yet',
    completeTasks: 'Complete tasks to see category breakdown',
    monthlyOverview: 'Monthly Overview',
    total: 'Total',
    avgTransaction: 'Avg/Transaction',
    insights: 'Insights',
    topSpender: 'Top Spender',
    mostReliable: 'Most Reliable',
    totalTransactions: 'Total Transactions',
    activeMembers: 'Active Members',
    of: 'of',
    transactions: 'transactions',
    receives: 'receives',
    owes: 'owes',
    settled: 'settled',
    tasksCompleted: 'tasks completed',
  },
  settings: {
    title: 'Settings',
    currentList: 'Current List',
    generateInviteLink: 'Generate Invite Link',
    shareWithOthers: 'Share with others to join',
    allLists: 'All Lists',
    manage: 'Manage',
    categories: 'Categories',
    manageCategories: 'Manage task categories',
    teamMembers: 'Team Members',
    account: 'Account',
    profile: 'Profile',
    updateProfile: 'Update your name and settings',
    notifications: 'Notifications',
    manageNotifications: 'Manage push notifications',
    about: 'About',
    appSettings: 'App Settings',
    themeAndPreferences: 'Theme and preferences',
    signOut: 'Sign Out',
    logOut: 'Log out of your account',
    active: 'Active',
    version: 'BetterTogether v1.0.0',
    madeWithLove: 'Made with ❤️ for better collaboration',
    permissionRequired: 'Permission Required',
    ownerOnly: 'Only the list owner can manage categories. Ask the owner to enable member category management in List Settings.',
    switchToList: 'Switch to this list',
    viewSettings: 'View settings',
    whatToDo: 'What would you like to do?',
    language: 'Language',
    changeLanguage: 'Change app language',
    english: 'English',
    german: 'Deutsch',
  },
  profile: {
    title: 'Profile',
    tapToChange: 'Tap to change photo',
    removePhoto: 'Remove photo',
    personalInfo: 'Personal Info',
    displayName: 'Display Name',
    enterYourName: 'Enter your name',
    email: 'Email',
    yourEmail: 'your@email.com',
    avatarColor: 'Avatar Color',
    saveChanges: 'Save Changes',
    profileUpdated: 'Profile updated!',
    failedToUpdate: 'Failed to update profile',
    permissionNeeded: 'Permission needed',
    cameraPermission: 'We need camera roll permissions to change your profile picture',
  },
  teams: {
    title: 'Team Members',
    teamMembers: 'Team Members',
    manageMembersDescription: 'Manage who has access to this list. Owners can invite new members and remove existing ones.',
    inviteMember: 'Invite Member',
    shareInviteLink: 'Share invite link with others',
    inviteLinkCopied: 'Invite Link Copied!',
    searchMembers: 'Search members...',
    owner: 'Owner',
    joined: 'Joined',
    removeMember: 'Remove Member',
    confirmRemove: 'Are you sure you want to remove',
    memberRemoved: 'has been removed from the list',
    failedToRemove: 'Failed to remove member',
    noMembersFound: 'No members found',
    tryDifferentSearch: 'Try a different search term',
    noListSelected: 'No list selected',
    recentlyJoined: 'Recently joined',
  },
  categories: {
    title: 'Categories',
    manageCategories: 'Manage Categories',
    categoriesDescription: 'Customize how your tasks are organized',
    categoryName: 'Category Name',
    emoji: 'Emoji',
    color: 'Color',
    usageInfo: 'Usage',
    tasksInCategory: 'tasks in this category',
    noCategories: 'No categories available',
    household: 'Household',
    finance: 'Finance',
    work: 'Work',
    leisure: 'Leisure',
  },
  listSettings: {
    title: 'List Settings',
    listName: 'List Name',
    currency: 'Currency',
    defaultGrace: 'Default Grace Period',
    defaultStake: 'Default Stake',
    permissions: 'Permissions',
    allowMemberManage: 'Allow members to manage categories',
    dangerZone: 'Danger Zone',
    archiveList: 'Archive List',
    archiveWarning: 'This will hide the list from active lists',
    settingsUpdated: 'Settings updated successfully!',
    listArchived: 'List has been archived',
  },
  alerts: {
    comingSoon: 'Coming Soon',
    featureComingSoon: 'This feature will be available soon!',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    areYouSure: 'Are you sure?',
    cannotUndo: 'This action cannot be undone',
    inviteLinkCopied: 'Invite link copied to clipboard!',
    listSwitched: 'Switched list successfully!',
    failedToGenerate: 'Failed to generate invite link',
  },
};

const de: Translations = {
  common: {
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    remove: 'Entfernen',
    confirm: 'Bestätigen',
    yes: 'Ja',
    no: 'Nein',
    ok: 'OK',
    close: 'Schließen',
    back: 'Zurück',
    next: 'Weiter',
    done: 'Fertig',
    loading: 'Lädt',
    error: 'Fehler',
    success: 'Erfolg',
    warning: 'Warnung',
    info: 'Info',
    search: 'Suchen',
    filter: 'Filter',
    all: 'Alle',
    none: 'Keine',
    select: 'Auswählen',
    members: 'Mitglieder',
    member: 'Mitglied',
  },
  tabs: {
    dashboard: 'Dashboard',
    tasks: 'Aufgaben',
    balances: 'Guthaben',
    settings: 'Einstellungen',
  },
  dashboard: {
    welcomeBack: 'Willkommen zurück,',
    openTasks: 'Offene Aufgaben',
    overdue: 'Überfällig',
    completed: 'Erledigt',
    balance: 'Guthaben',
    nextDue: 'Nächste Fälligkeit',
    upcomingTasks: 'Anstehende Aufgaben',
    noUpcomingTasks: 'Keine anstehenden Aufgaben',
    calendar: 'Kalender',
    view: 'Ansicht',
    thisMonth: 'Diesen Monat',
    tasks: 'Aufgaben',
    noTasksForDay: 'Keine Aufgaben für diesen Tag',
  },
  tasks: {
    title: 'Aufgaben',
    createNewTask: 'Neue Aufgabe erstellen',
    createTaskDescription: 'Fügen Sie eine Aufgabe mit Kategorie, Zeitplan, Einsatz und Mitgliedern hinzu',
    taskDetails: 'Aufgabendetails',
    taskTitle: 'Aufgabentitel',
    description: 'Beschreibung',
    category: 'Kategorie',
    dueDate: 'Fälligkeitsdatum',
    startDate: 'Startdatum',
    endDate: 'Enddatum',
    stake: 'Einsatz',
    status: 'Status',
    assignedTo: 'Zugewiesen an',
    gracePeriod: 'Kulanzfrist',
    priority: 'Priorität',
    reminder: 'Erinnerung',
    recurrence: 'Wiederholung',
    pending: 'Ausstehend',
    completed: 'Erledigt',
    failed: 'Fehlgeschlagen',
    overdue: 'Überfällig',
    noTasks: 'Noch keine Aufgaben',
    noTasksDescription: 'Tippen Sie auf "Neue Aufgabe erstellen", um die erste hinzuzufügen',
    taskMarkedAsFailed: 'Aufgabe als fehlgeschlagen markiert',
    undo: 'Rückgängig',
    today: 'Heute',
    clearFilters: 'Filter löschen',
    allDay: 'Ganztägig',
    minutes: 'Minuten',
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
  },
  balances: {
    title: 'Guthaben',
    overview: 'Übersicht',
    history: 'Verlauf',
    stats: 'Statistiken',
    myBalance: 'Mein Guthaben',
    totalExpenses: 'Gesamtausgaben',
    thisMonth: 'Diesen Monat',
    groupBalance: 'Gruppenguthaben',
    memberBalances: 'Mitgliederguthaben',
    noMembers: 'Noch keine Mitglieder',
    transactionHistory: 'Transaktionsverlauf',
    noTransactions: 'Keine Transaktionen diesen Monat',
    transactionsWillAppear: 'Fehlgeschlagene Aufgaben erscheinen hier',
    categoryBreakdown: 'Kategorieaufschlüsselung',
    noCategoryData: 'Noch keine Kategoriedaten',
    completeTasks: 'Aufgaben abschließen, um Kategorieaufschlüsselung zu sehen',
    monthlyOverview: 'Monatsübersicht',
    total: 'Gesamt',
    avgTransaction: 'Durchschn./Transaktion',
    insights: 'Einblicke',
    topSpender: 'Höchster Ausgeber',
    mostReliable: 'Zuverlässigste',
    totalTransactions: 'Gesamttransaktionen',
    activeMembers: 'Aktive Mitglieder',
    of: 'von',
    transactions: 'Transaktionen',
    receives: 'erhält',
    owes: 'schuldet',
    settled: 'ausgeglichen',
    tasksCompleted: 'Aufgaben erledigt',
  },
  settings: {
    title: 'Einstellungen',
    currentList: 'Aktuelle Liste',
    generateInviteLink: 'Einladungslink generieren',
    shareWithOthers: 'Mit anderen teilen zum Beitreten',
    allLists: 'Alle Listen',
    manage: 'Verwalten',
    categories: 'Kategorien',
    manageCategories: 'Aufgabenkategorien verwalten',
    teamMembers: 'Teammitglieder',
    account: 'Konto',
    profile: 'Profil',
    updateProfile: 'Name und Einstellungen aktualisieren',
    notifications: 'Benachrichtigungen',
    manageNotifications: 'Push-Benachrichtigungen verwalten',
    about: 'Über',
    appSettings: 'App-Einstellungen',
    themeAndPreferences: 'Design und Präferenzen',
    signOut: 'Abmelden',
    logOut: 'Von Ihrem Konto abmelden',
    active: 'Aktiv',
    version: 'BetterTogether v1.0.0',
    madeWithLove: 'Mit ❤️ für bessere Zusammenarbeit gemacht',
    permissionRequired: 'Berechtigung erforderlich',
    ownerOnly: 'Nur der Listenbesitzer kann Kategorien verwalten. Bitten Sie den Besitzer, die Kategorieverwaltung durch Mitglieder in den Listeneinstellungen zu aktivieren.',
    switchToList: 'Zu dieser Liste wechseln',
    viewSettings: 'Einstellungen anzeigen',
    whatToDo: 'Was möchten Sie tun?',
    language: 'Sprache',
    changeLanguage: 'App-Sprache ändern',
    english: 'English',
    german: 'Deutsch',
  },
  profile: {
    title: 'Profil',
    tapToChange: 'Zum Ändern tippen',
    removePhoto: 'Foto entfernen',
    personalInfo: 'Persönliche Informationen',
    displayName: 'Anzeigename',
    enterYourName: 'Geben Sie Ihren Namen ein',
    email: 'E-Mail',
    yourEmail: 'ihre@email.de',
    avatarColor: 'Avatar-Farbe',
    saveChanges: 'Änderungen speichern',
    profileUpdated: 'Profil aktualisiert!',
    failedToUpdate: 'Profil konnte nicht aktualisiert werden',
    permissionNeeded: 'Berechtigung erforderlich',
    cameraPermission: 'Wir benötigen Zugriff auf Ihre Fotos, um Ihr Profilbild zu ändern',
  },
  teams: {
    title: 'Teammitglieder',
    teamMembers: 'Teammitglieder',
    manageMembersDescription: 'Verwalten Sie, wer Zugriff auf diese Liste hat. Besitzer können neue Mitglieder einladen und bestehende entfernen.',
    inviteMember: 'Mitglied einladen',
    shareInviteLink: 'Einladungslink mit anderen teilen',
    inviteLinkCopied: 'Einladungslink kopiert!',
    searchMembers: 'Mitglieder suchen...',
    owner: 'Besitzer',
    joined: 'Beigetreten',
    removeMember: 'Mitglied entfernen',
    confirmRemove: 'Möchten Sie wirklich entfernen',
    memberRemoved: 'wurde aus der Liste entfernt',
    failedToRemove: 'Mitglied konnte nicht entfernt werden',
    noMembersFound: 'Keine Mitglieder gefunden',
    tryDifferentSearch: 'Versuchen Sie einen anderen Suchbegriff',
    noListSelected: 'Keine Liste ausgewählt',
    recentlyJoined: 'Kürzlich beigetreten',
  },
  categories: {
    title: 'Kategorien',
    manageCategories: 'Kategorien verwalten',
    categoriesDescription: 'Passen Sie an, wie Ihre Aufgaben organisiert sind',
    categoryName: 'Kategoriename',
    emoji: 'Emoji',
    color: 'Farbe',
    usageInfo: 'Verwendung',
    tasksInCategory: 'Aufgaben in dieser Kategorie',
    noCategories: 'Keine Kategorien verfügbar',
    household: 'Haushalt',
    finance: 'Finanzen',
    work: 'Arbeit',
    leisure: 'Freizeit',
  },
  listSettings: {
    title: 'Listeneinstellungen',
    listName: 'Listenname',
    currency: 'Währung',
    defaultGrace: 'Standard-Kulanzfrist',
    defaultStake: 'Standard-Einsatz',
    permissions: 'Berechtigungen',
    allowMemberManage: 'Mitgliedern erlauben, Kategorien zu verwalten',
    dangerZone: 'Gefahrenzone',
    archiveList: 'Liste archivieren',
    archiveWarning: 'Dadurch wird die Liste aus den aktiven Listen ausgeblendet',
    settingsUpdated: 'Einstellungen erfolgreich aktualisiert!',
    listArchived: 'Liste wurde archiviert',
  },
  alerts: {
    comingSoon: 'Bald verfügbar',
    featureComingSoon: 'Diese Funktion wird bald verfügbar sein!',
    error: 'Fehler',
    success: 'Erfolg',
    confirm: 'Bestätigen',
    areYouSure: 'Sind Sie sicher?',
    cannotUndo: 'Diese Aktion kann nicht rückgängig gemacht werden',
    inviteLinkCopied: 'Einladungslink in Zwischenablage kopiert!',
    listSwitched: 'Liste erfolgreich gewechselt!',
    failedToGenerate: 'Einladungslink konnte nicht generiert werden',
  },
};

export const translations: Record<Language, Translations> = {
  en,
  de,
};

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.en;
}
