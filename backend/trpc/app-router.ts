import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import resolveTask from "./routes/tasks/resolveTask/route";
import getFundTotals from "./routes/fundGoals/getTotals/route";
import getMe from "./routes/user/getMe/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  tasks: createTRPCRouter({
    resolveTask,
  }),
  fundGoals: createTRPCRouter({
    getTotals: getFundTotals,
  }),
  user: createTRPCRouter({
    getMe,
  }),
});

export type AppRouter = typeof appRouter;
