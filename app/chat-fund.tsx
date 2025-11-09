import React, { useMemo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChatTab } from '@/components/ChatTab';
import { useApp } from '@/contexts/AppContext';

export default function ChatFundScreen() {
  const insets = useSafeAreaInsets();
  const { fundId } = useLocalSearchParams<{ fundId: string }>();
  const { fundTargets } = useApp();

  const fund = useMemo(() => {
    return fundTargets.find((f) => f.id === fundId);
  }, [fundTargets, fundId]);

  const handleSendMessage = (content: string) => {
    console.log('[ChatFund] Send message:', content);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: fund?.name || 'Chat',
          headerShown: true,
        }}
      />
      <ChatTab
        goalId={fundId || ''}
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
