import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import superjson from "superjson";

const app = new Hono();

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    transformer: superjson,
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

export default app;
