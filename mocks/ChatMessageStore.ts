import { ChatMessage } from '@/types';

let messageStore: ChatMessage[] = [];

export const ChatMessageStore = {
  getAll(): ChatMessage[] {
    return [...messageStore];
  },

  add(message: ChatMessage): void {
    messageStore.push(message);
  },

  clear(): void {
    messageStore = [];
  },

  findByGoalAndList(goalId: string, listId: string): ChatMessage[] {
    return messageStore.filter(
      (msg) => msg.goalId === goalId && msg.listId === listId
    );
  },
};
