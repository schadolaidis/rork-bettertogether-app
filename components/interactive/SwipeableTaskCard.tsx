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

  const formatDueDate = (task: Task): string => {
    if (!task.startAt) return 'Kein Fälligkeitsdatum';
    
    const startDate = new Date(task.startAt);
    const now = new Date();
    const diffMs = startDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Heute ${startDate.toLocaleTimeString('de-DE', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Morgen ${startDate.toLocaleTimeString('de-DE', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === -1) {
      return `Gestern ${startDate.toLocaleTimeString('de-DE', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays > 1 && diffDays < 7) {
      return `${startDate.toLocaleDateString('de-DE', { weekday: 'short' })} ${startDate.toLocaleTimeString('de-DE', { hour: 'numeric', minute: '2-digit' })}`;
    }
    
    return startDate.toLocaleDateString('de-DE', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const canSwipe = task.status !== 'completed' && 
                   task.status !== 'failed' && 
                   task.status !== 'failed_stake_paid' && 
                   task.status !== 'failed_joker_used';

  const categoryMeta = useMemo(() => {
    return { emoji: '📌', color: theme.primary };
  }, [theme.primary]);

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
          subtitle={formatDueDate(task)}
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
});
