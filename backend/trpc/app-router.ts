import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import resolveTask from "./routes/tasks/resolveTask/route";
import forceFailTask from "./routes/tasks/forceFailTask/route";
import useJokerOnTask from "./routes/tasks/useJokerOnTask/route";
import parseTaskString from "./routes/tasks/parseTaskString/route";
import getFundTotals from "./routes/fundGoals/getTotals/route";
import getMe from "./routes/user/getMe/route";
import sendMessage from "./routes/chat/sendMessage/route";
import getMessages from "./routes/chat/getMessages/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  tasks: createTRPCRouter({
    resolveTask,
    forceFailTask,
    useJokerOnTask,
    parseTaskString,
  }),
  fundGoals: createTRPCRouter({
    getTotals: getFundTotals,
  }),
  user: createTRPCRouter({
    getMe,
  }),
  chat: createTRPCRouter({
    sendMessage,
    getMessages,
  }),
});

export type AppRouter = typeof appRouter;
