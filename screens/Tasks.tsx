import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { AppBar } from '@/components/design-system/AppBar';
import { SegmentedControl, SegmentedControlOption } from '@/components/interactive/basic/SegmentedControl';
import { SwipeableTaskCard } from '@/components/interactive/SwipeableTaskCard';
import { Task } from '@/types';


type TaskFilterType = 'all' | 'active' | 'completed' | 'failed' | 'upcoming';

export default function Tasks() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    tasks,
    completeTask,
    failTask,
    currentList,
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<TaskFilterType>('all');

  const filterOptions: SegmentedControlOption[] = [
    { value: 'all', label: 'Alle' },
    { value: 'active', label: 'Aktiv' },
    { value: 'completed', label: 'Erledigt' },
    { value: 'failed', label: 'Fehlgeschlagen' },
    { value: 'upcoming', label: 'Anstehend' },
  ];

  const filteredTasks = useMemo(() => {
    const now = new Date();
    
    switch (selectedFilter) {
      case 'all':
        return tasks;
      case 'active':
        return tasks.filter(t => t.status === 'pending' || t.status === 'overdue');
      case 'completed':
        return tasks.filter(t => t.status === 'completed');
      case 'failed':
        return tasks.filter(t => t.status === 'failed');
      case 'upcoming':
        return tasks.filter(t => {
          if (!t.startAt) return false;
          const startDate = new Date(t.startAt);
          return startDate > now && t.status === 'pending';
        });
      default:
        return tasks;
    }
  }, [tasks, selectedFilter]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (a.status !== 'overdue' && b.status === 'overdue') return 1;
      
      if (!a.startAt) return 1;
      if (!b.startAt) return -1;
      
      return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
    });
  }, [filteredTasks]);

  const handleComplete = useCallback((taskId: string) => {
    console.log('[Tasks] Completing task:', taskId);
    completeTask(taskId);
  }, [completeTask]);

  const handleFail = useCallback((taskId: string) => {
    console.log('[Tasks] Failing task:', taskId);
    failTask(taskId);
  }, [failTask]);

  const handleTaskPress = useCallback((task: Task) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('[Tasks] Task pressed:', task.title);
  }, []);

  const handleAddTask = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('[Tasks] Add task pressed');
  };

  const currencySymbol = currentList?.currencySymbol || '$';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppBar title="Aufgaben" testID="tasks-appbar" />

      <View style={[styles.filterContainer, { paddingHorizontal: theme.spacing.md }]}>
        <SegmentedControl
          options={filterOptions}
          selectedValue={selectedFilter}
          onChange={(value) => setSelectedFilter(value as TaskFilterType)}
        />
      </View>

      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SwipeableTaskCard
            task={item}
            onComplete={handleComplete}
            onFail={handleFail}
            onPress={handleTaskPress}
            currencySymbol={currencySymbol}
            showStatus={true}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
          sortedTasks.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[theme.typography.h2, { color: theme.textLow, marginBottom: 8 }]}>
              Keine Aufgaben gefunden
            </Text>
            <Text style={[theme.typography.body, { color: theme.textLow, textAlign: 'center' }]}>
              {selectedFilter === 'all' 
                ? 'Erstelle deine erste Aufgabe'
                : `Keine ${selectedFilter === 'active' ? 'aktiven' : selectedFilter === 'upcoming' ? 'anstehenden' : selectedFilter === 'completed' ? 'erledigten' : 'fehlgeschlagenen'} Aufgaben`}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        testID="tasks-list"
      />

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.primary,
            bottom: insets.bottom + 16,
            shadowColor: theme.primary,
          },
          pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
        ]}
        onPress={handleAddTask}
        testID="fab-add-task"
      >
        <Plus size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingVertical: 12,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyListContent: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
