import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ListRow } from '@/components/design-system/ListRow';
import { Task } from '@/types';

type SwipeableTaskCardProps = {
  task: Task;
  onComplete: (taskId: string) => void;
  onFail: (taskId: string) => void;
  onPress: (task: Task) => void;
  currencySymbol: string;
  showStatus?: boolean;
};

const SWIPE_THRESHOLD = 100;
const ACTION_WIDTH = 80;

export const SwipeableTaskCard: React.FC<SwipeableTaskCardProps> = ({
  task,
  onComplete,
  onFail,
  onPress,
  currencySymbol,
  showStatus = true,
}) => {
  const { theme } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiping, setSwiping] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        setSwiping(true);
      },
      onPanResponderMove: (_, gestureState) => {
        const dx = gestureState.dx;
        if (dx > 0 && dx <= ACTION_WIDTH * 1.5) {
          translateX.setValue(dx);
        } else if (dx < 0 && dx >= -ACTION_WIDTH * 1.5) {
          translateX.setValue(dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const dx = gestureState.dx;
        setSwiping(false);

        if (dx > SWIPE_THRESHOLD) {
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          Animated.timing(translateX, {
            toValue: ACTION_WIDTH,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onComplete(task.id);
            translateX.setValue(0);
          });
        } else if (dx < -SWIPE_THRESHOLD) {
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          Animated.timing(translateX, {
            toValue: -ACTION_WIDTH,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onFail(task.id);
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return theme.success;
      case 'failed':
      case 'failed_stake_paid':
      case 'failed_joker_used':
        return theme.error;
      case 'overdue':
        return theme.error;
      case 'pending':
        return theme.warning;
      default:
        return theme.textLow;
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'Erledigt';
      case 'failed':
      case 'failed_stake_paid':
        return 'Fehlgeschlagen';
      case 'failed_joker_used':
        return 'Joker';
      case 'overdue':
        return 'Überfällig';
      case 'pending':
        return 'Offen';
      default:
        return '';
    }
  };

  const formatDueDateNatural = (task: Task): { natural: string; time: string; isOverdue: boolean; isToday: boolean; isTomorrow: boolean } => {
    if (!task.startAt) return { natural: 'Kein Datum', time: '', isOverdue: false, isToday: false, isTomorrow: false };
    
    const startDate = new Date(task.startAt);
    const now = new Date();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDay = new Date(startDate);
    taskDay.setHours(0, 0, 0, 0);
    const dayDiff = Math.floor((taskDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let natural = '';
    const time = task.allDay ? 'Ganztägig' : startDate.toLocaleTimeString('de-DE', { hour: 'numeric', minute: '2-digit' });
    const isOverdue = startDate < now && task.status !== 'completed';
    
    if (dayDiff === 0) {
      natural = 'Heute';
      return { natural, time, isOverdue, isToday: true, isTomorrow: false };
    } else if (dayDiff === 1) {
      natural = 'Morgen';
      return { natural, time, isOverdue, isToday: false, isTomorrow: true };
    } else if (dayDiff === -1) {
      natural = 'Gestern';
      return { natural, time, isOverdue: true, isToday: false, isTomorrow: false };
    } else if (dayDiff > 1 && dayDiff < 7) {
      natural = startDate.toLocaleDateString('de-DE', { weekday: 'long' });
      return { natural, time, isOverdue, isToday: false, isTomorrow: false };
    } else if (dayDiff < -1) {
      natural = startDate.toLocaleDateString('de-DE', { 
        day: 'numeric', 
        month: 'short'
      });
      return { natural, time, isOverdue: true, isToday: false, isTomorrow: false };
    }
    
    natural = startDate.toLocaleDateString('de-DE', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short'
    });
    
    return { natural, time, isOverdue, isToday: false, isTomorrow: false };
  };

  const canSwipe = task.status !== 'completed' && 
                   task.status !== 'failed' && 
                   task.status !== 'failed_stake_paid' && 
                   task.status !== 'failed_joker_used';

  const categoryMeta = useMemo(() => {
    return { emoji: '📌', color: theme.primary };
  }, [theme.primary]);
  
  const dueDateInfo = useMemo(() => formatDueDateNatural(task), [task]);

  return (
    <View style={styles.swipeContainer}>
      <View style={[styles.actionContainer, styles.leftAction]}>
        <View
          style={[
            styles.actionButton,
            { backgroundColor: '#4CAF50' },
          ]}
        >
          <Check size={24} color="#FFFFFF" />
        </View>
      </View>

      <View style={[styles.actionContainer, styles.rightAction]}>
        <View
          style={[
            styles.actionButton,
            { backgroundColor: '#F44336' },
          ]}
        >
          <X size={24} color="#FFFFFF" />
        </View>
      </View>

      <Animated.View
        style={[
          styles.taskItem,
          { transform: [{ translateX }] },
        ]}
        {...(canSwipe ? panResponder.panHandlers : {})}
      >
        <ListRow
          left={
            <View style={styles.taskEmoji}>
              <Text style={styles.emojiText}>{categoryMeta.emoji}</Text>
            </View>
          }
          title={task.title}
          subtitle={
            <View style={styles.dateTimeContainer}>
              <View style={[
                styles.dateChip,
                dueDateInfo.isOverdue && styles.dateChipOverdue,
                dueDateInfo.isToday && styles.dateChipToday,
                dueDateInfo.isTomorrow && styles.dateChipTomorrow,
              ]}>
                <Text style={[
                  styles.dateChipText,
                  dueDateInfo.isOverdue && styles.dateChipTextOverdue,
                  dueDateInfo.isToday && styles.dateChipTextToday,
                  dueDateInfo.isTomorrow && styles.dateChipTextTomorrow,
                ]}>
                  {dueDateInfo.natural}
                </Text>
              </View>
              {!task.allDay && (
                <Text style={styles.timeText}>
                  {dueDateInfo.time}
                </Text>
              )}
              {task.allDay && (
                <View style={styles.allDayChip}>
                  <Text style={styles.allDayText}>Ganztägig</Text>
                </View>
              )}
            </View>
          }
          right={
            <View style={styles.taskRight}>
              <Text style={[theme.typography.label, { color: theme.textHigh }]}>
                {currencySymbol}{task.stake}
              </Text>
              {showStatus && (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(task.status) },
                  ]}
                >
                  <Text style={[styles.statusText, theme.typography.caption]}>
                    {getStatusLabel(task.status)}
                  </Text>
                </View>
              )}
            </View>
          }
          onPress={() => !swiping && onPress(task)}
          testID={`task-${task.id}`}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    position: 'relative',
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: ACTION_WIDTH,
  },
  leftAction: {
    left: 0,
  },
  rightAction: {
    right: 0,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskItem: {
    backgroundColor: '#FFFFFF',
  },
  taskEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
    fontSize: 11,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  dateChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  dateChipToday: {
    backgroundColor: '#DBEAFE',
  },
  dateChipTomorrow: {
    backgroundColor: '#FEF3C7',
  },
  dateChipOverdue: {
    backgroundColor: '#FEE2E2',
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  dateChipTextToday: {
    color: '#2563EB',
  },
  dateChipTextTomorrow: {
    color: '#D97706',
  },
  dateChipTextOverdue: {
    color: '#DC2626',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  allDayChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  allDayText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: '#9CA3AF',
  },
});
