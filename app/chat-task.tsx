import React, { useMemo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChatTab } from '@/components/ChatTab';
import { useApp } from '@/contexts/AppContext';

export default function ChatTaskScreen() {
  const insets = useSafeAreaInsets();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { tasks } = useApp();

  const task = useMemo(() => {
    return tasks.find((t) => t.id === taskId);
  }, [tasks, taskId]);

  const handleSendMessage = (content: string) => {
    console.log('[ChatTask] Send message:', content);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: task?.title || 'Chat',
          headerShown: true,
        }}
      />
      <ChatTab
        goalId={taskId || ''}
        onSendMessage={handleSendMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
