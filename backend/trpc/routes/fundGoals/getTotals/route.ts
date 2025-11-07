import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { MOCK_FUND_TARGETS } from "@/mocks/data";

export default publicProcedure
  .input(z.void())
  .query(() => {
    const totalCollectedCents = MOCK_FUND_TARGETS
      .filter((f) => f.isActive)
      .reduce((sum, f) => sum + (f.totalCollectedCents ?? 0), 0);

    return { totalCollectedCents };
  });
