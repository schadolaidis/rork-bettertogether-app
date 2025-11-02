import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { Task } from '@/types';

export type TimeBlock = {
  hour: number;
  timeLabel: string;
  tasks: Task[];
};

export type TimelineListProps = {
  selectedDate: Date;
  tasks: Task[];
  onTimeBlockPress: (date: Date, hour: number) => void;
  onTaskPress: (task: Task) => void;
  startHour?: number;
  endHour?: number;
};

export const TimelineList: React.FC<TimelineListProps> = ({
  selectedDate,
  tasks,
  onTimeBlockPress,
  onTaskPress,
  startHour = 8,
  endHour = 20,
}) => {
  const { theme } = useTheme();

  const generateTimeBlocks = (): TimeBlock[] => {
    const blocks: TimeBlock[] = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

      const blockStart = new Date(selectedDate);
      blockStart.setHours(hour, 0, 0, 0);
      const blockEnd = new Date(selectedDate);
      blockEnd.setHours(hour + 1, 0, 0, 0);

      const tasksInBlock = tasks.filter((task) => {
        const taskStart = new Date(task.startAt);
        const taskEnd = new Date(task.endAt);
        return (
          (taskStart >= blockStart && taskStart < blockEnd) ||
          (taskEnd > blockStart && taskEnd <= blockEnd) ||
          (taskStart <= blockStart && taskEnd >= blockEnd)
        );
      });

      blocks.push({ hour, timeLabel, tasks: tasksInBlock });
    }

    return blocks;
  };

  const timeBlocks = generateTimeBlocks();

  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      Household: '#34D399',
      Finance: '#3B82F6',
      Work: '#F59E0B',
      Leisure: '#A78BFA',
    };
    return categoryColors[category] || theme.colors.primary;
  };

  const isCurrentHour = (hour: number): boolean => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    return selected.getTime() === today.getTime() && now.getHours() === hour;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={Platform.OS === 'web'}
      testID="timeline-list"
    >
      {timeBlocks.map((block, index) => {
        const isCurrent = isCurrentHour(block.hour);

        return (
          <View key={index} style={styles.timeBlockContainer}>
            {isCurrent && (
              <View
                style={[
                  styles.stickyHeader,
                  {
                    backgroundColor: theme.colors.primary,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.xs,
                  },
                ]}
              >
                <Text
                  style={[
                    theme.typography.Caption,
                    { color: theme.colors.surface, fontWeight: '600' },
                  ]}
                >
                  Now
                </Text>
              </View>
            )}

            <Pressable
              style={[
                styles.timeBlock,
                {
                  backgroundColor: theme.colors.surface,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.border,
                  minHeight: 80,
                },
              ]}
              onPress={() => onTimeBlockPress(selectedDate, block.hour)}
              testID={`time-block-${block.hour}`}
            >
              <View
                style={[
                  styles.timeColumn,
                  {
                    paddingHorizontal: theme.spacing.sm,
                    paddingTop: theme.spacing.sm,
                  },
                ]}
              >
                <Text
                  style={[
                    theme.typography.Label,
                    {
                      color: isCurrent ? theme.colors.primary : theme.colors.textLow,
                      fontWeight: isCurrent ? '600' : '400',
                    },
                  ]}
                >
                  {block.timeLabel}
                </Text>
              </View>

              <View style={styles.tasksColumn}>
                {block.tasks.length === 0 ? (
                  <View
                    style={{
                      paddingVertical: theme.spacing.lg,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={[
                        theme.typography.Caption,
                        { color: theme.colors.textLow },
                      ]}
                    >
                      Tap to add task
                    </Text>
                  </View>
                ) : (
                  block.tasks.map((task) => {
                    const categoryColor = getCategoryColor(task.category);

                    return (
                      <Pressable
                        key={task.id}
                        style={[
                          styles.taskCard,
                          {
                            backgroundColor: theme.colors.surface,
                            borderRadius: theme.radius - 4,
                            borderLeftWidth: 4,
                            borderLeftColor: categoryColor,
                            marginBottom: theme.spacing.xs,
                            paddingVertical: theme.spacing.sm,
                            paddingHorizontal: theme.spacing.md,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.08,
                            shadowRadius: 2,
                            elevation: 2,
                          },
                        ]}
                        onPress={() => onTaskPress(task)}
                        testID={`task-${task.id}`}
                      >
                        <View style={styles.taskHeader}>
                          <Text
                            style={[
                              theme.typography.Body,
                              {
                                color: theme.colors.textHigh,
                                fontWeight: '500',
                                flex: 1,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {task.title}
                          </Text>
                          {task.stake > 0 && (
                            <View
                              style={[
                                styles.stakeBadge,
                                {
                                  backgroundColor: theme.colors.surfaceAlt,
                                  borderRadius: theme.radius - 8,
                                  paddingHorizontal: theme.spacing.xs,
                                  paddingVertical: theme.spacing.xxs,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  theme.typography.Caption,
                                  { color: theme.colors.textHigh, fontWeight: '600' },
                                ]}
                              >
                                ${(task.stake / 100).toFixed(0)}
                              </Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.taskMeta}>
                          <Text
                            style={[
                              theme.typography.Caption,
                              { color: theme.colors.textLow },
                            ]}
                          >
                            {new Date(task.startAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(task.endAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })
                )}
              </View>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timeBlockContainer: {
    position: 'relative',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  timeBlock: {
    flexDirection: 'row',
  },
  timeColumn: {
    width: 60,
    alignItems: 'flex-end',
  },
  tasksColumn: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  taskCard: {
    overflow: 'hidden',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stakeBadge: {},
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
