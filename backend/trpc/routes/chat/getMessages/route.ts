import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { ChatMessageStore } from "@/mocks/ChatMessageStore";
import { TRPCError } from "@trpc/server";

const inputSchema = z.object({
  goalId: z.string(),
  listId: z.string(),
});

export const getMessagesProcedure = publicProcedure
  .input(inputSchema)
  .query(async ({ input }) => {
    try {
      console.log("[Chat getMessages] Input:", JSON.stringify(input));

      const { goalId, listId } = input;

      if (!goalId || !listId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Missing required fields',
        });
      }

      const messages = ChatMessageStore.findByGoalAndList(goalId, listId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      console.log("[Chat getMessages] Success: Found", messages.length, "messages");
      return messages;
    } catch (error) {
      console.error("[Chat getMessages] Error:", error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get messages',
        cause: error,
      });
    }
  });

export default getMessagesProcedure;
