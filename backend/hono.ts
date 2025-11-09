import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use('*', async (c, next) => {
  console.log('[Hono] Incoming request:', c.req.method, c.req.url);
  console.log('[Hono] Headers:', Object.fromEntries(c.req.raw.headers.entries()));
  await next();
  console.log('[Hono] Response status:', c.res.status);
});

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error(`[tRPC Error] path: ${path}, error:`, error);
    },
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.get("/api", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.notFound((c) => {
  console.log('[Hono] 404 Not Found:', c.req.url);
  return c.json({ error: "Not found", url: c.req.url }, 404);
});

app.onError((err, c) => {
  console.error('[Hono] Server Error:', err);
  return c.json({ error: err.message }, 500);
});

export default app;
