import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { MOCK_USERS } from "@/mocks/data";

export default publicProcedure
  .input(z.void())
  .query(() => {
    const me = MOCK_USERS[0];
    if (!me) {
      return { user: null };
    }
    return {
      id: me.id,
      name: me.name,
      email: me.email,
      color: me.color,
      currentStreakCount: me.currentStreakCount,
      jokerCount: me.jokerCount,
    };
  });
