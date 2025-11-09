import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { trpc } from '@/lib/trpc';
import type { ChatMessage } from '@/types';

interface ChatTabProps {
  goalId: string;
  onSendMessage?: (content: string) => void;
}

export function ChatTab({ goalId, onSendMessage }: ChatTabProps) {
  const { currentListMembers, currentListId, currentUserId } = useApp();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const previousMessagesRef = useRef<ChatMessage[]>([]);

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  const { data: messagesFromServer = [], refetch } = trpc.chat.getMessages.useQuery(
    { goalId, listId: currentListId || '' },
    { refetchInterval: 5000, enabled: !!goalId && !!currentListId }
  );

  useEffect(() => {
    const sortedServerMessages = [...messagesFromServer].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const serverIds = sortedServerMessages.map(m => m.id).join(',');
    const prevIds = previousMessagesRef.current.map(m => m.id).join(',');
    
    if (serverIds !== prevIds) {
      previousMessagesRef.current = sortedServerMessages;
      
      setLocalMessages(prevMessages => {
        const tempMessages = prevMessages.filter(m => m.id.startsWith('temp-'));
        return [...sortedServerMessages, ...tempMessages];
      });
    }
  }, [messagesFromServer]);

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  const handleSend = useCallback(() => {
    if (!inputText.trim() || !currentUserId || !currentListId) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const messageContent = inputText.trim();
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      goalId,
      senderId: currentUserId,
      content: messageContent,
      timestamp: new Date().toISOString(),
      listId: currentListId,
    };

    setLocalMessages((prev) => [...prev, optimisticMessage]);
    setInputText('');

    sendMessageMutation.mutate(
      {
        goalId,
        senderId: currentUserId,
        content: messageContent,
        listId: currentListId,
      },
      {
        onSuccess: () => {
          refetch();
        },
        onError: () => {
          setLocalMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        },
      }
    );

    if (onSendMessage) {
      onSendMessage(messageContent);
    }
  }, [inputText, currentUserId, currentListId, goalId, sendMessageMutation, refetch, onSendMessage]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isCurrentUser = item.senderId === currentUserId;
    const sender = currentListMembers.find((m) => m.id === item.senderId);
    const senderName = sender?.name || 'Unknown';
    const senderColor = sender?.color || '#6B7280';
    const timestamp = new Date(item.timestamp);

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser && styles.messageContainerRight,
        ]}
      >
        {!isCurrentUser && (
          <View style={[styles.avatar, { backgroundColor: senderColor }]}>
            <Text style={styles.avatarText}>
              {senderName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={[styles.messageContent, isCurrentUser && styles.messageContentRight]}>
          <View style={styles.messageHeader}>
            <Text style={styles.senderName}>
              {isCurrentUser ? 'You' : senderName}
            </Text>
            <Text style={styles.timestamp}>
              {timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View
            style={[
              styles.messageBubble,
              isCurrentUser && styles.messageBubbleRight,
            ]}
          >
            <Text style={[styles.messageText, isCurrentUser && styles.messageTextRight]}>
              {item.content}
            </Text>
          </View>
        </View>
        {isCurrentUser && (
          <View style={[styles.avatar, { backgroundColor: senderColor }]}>
            <Text style={styles.avatarText}>
              {senderName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  useEffect(() => {
    if (localMessages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [localMessages.length]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {localMessages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtext}>
            Start the conversation with your team
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={localMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Send
            size={20}
            color={inputText.trim() ? '#FFFFFF' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  messageContainerRight: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  messageContent: {
    flex: 1,
  },
  messageContentRight: {
    alignItems: 'flex-end',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageBubbleRight: {
    backgroundColor: '#3B82F6',
  },
  messageText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
  },
  messageTextRight: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
});
