import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { MOCK_CHAT_MESSAGES } from "@/mocks/data";
import type { ChatMessage } from "@/types";

const inputSchema = z.object({
  goalId: z.string(),
  senderId: z.string(),
  content: z.string().min(1),
  listId: z.string(),
});

export default publicProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    console.log("[Chat] sendMessage called", input);

    const { goalId, senderId, content, listId } = input;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      goalId,
      senderId,
      content,
      timestamp: new Date().toISOString(),
      listId,
    };

    MOCK_CHAT_MESSAGES.push(newMessage);

    console.log("[Chat] Message saved:", newMessage);
    return newMessage;
  });
