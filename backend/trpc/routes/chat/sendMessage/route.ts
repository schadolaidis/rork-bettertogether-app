import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { ChatMessageStore } from "@/mocks/ChatMessageStore";
import type { ChatMessage } from "@/types";
import { TRPCError } from "@trpc/server";

const inputSchema = z.object({
  goalId: z.string(),
  senderId: z.string(),
  content: z.string().min(1),
  listId: z.string(),
});

export const sendMessageProcedure = publicProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    try {
      console.log("[Chat sendMessage] Input:", JSON.stringify(input));

      const { goalId, senderId, content, listId } = input;

      if (!goalId || !senderId || !content || !listId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Missing required fields',
        });
      }

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        goalId,
        senderId,
        content,
        timestamp: new Date().toISOString(),
        listId,
      };

      ChatMessageStore.add(newMessage);

      console.log("[Chat sendMessage] Success:", newMessage.id);
      return newMessage;
    } catch (error) {
      console.error("[Chat sendMessage] Error:", error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to send message',
        cause: error,
      });
    }
  });

export default sendMessageProcedure;
