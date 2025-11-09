import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { MOCK_CHAT_MESSAGES } from "@/mocks/data";

const inputSchema = z.object({
  goalId: z.string(),
  listId: z.string(),
});

export default publicProcedure
  .input(inputSchema)
  .query(async ({ input }) => {
    console.log("[Chat] getMessages called", input);

    const { goalId, listId } = input;

    const messages = MOCK_CHAT_MESSAGES.filter(
      (msg) => msg.goalId === goalId && msg.listId === listId
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    console.log("[Chat] Messages retrieved:", messages.length);
    return messages;
  });
