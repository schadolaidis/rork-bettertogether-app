import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { MOCK_TASKS, MOCK_FUND_TARGETS } from "@/mocks/data";
import type { Task } from "@/types";
import { TRPCError } from "@trpc/server";

const inputSchema = z.object({
  task_id: z.string(),
  resolution_status: z.enum(["completed", "failed"]),
});

export default publicProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    console.log("resolveTask called", input);

    const { task_id, resolution_status } = input;

    const taskIndex = MOCK_TASKS.findIndex((t) => t.id === task_id);
    if (taskIndex === -1) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
    }

    const task: Task = MOCK_TASKS[taskIndex];
    const now = new Date().toISOString();

    if (resolution_status === "failed") {
      const fundId = task.fundTargetId;
      const stake = typeof task.stake === "number" ? task.stake : 0;

      if (fundId && stake > 0) {
        const fundIndex = MOCK_FUND_TARGETS.findIndex((f) => f.id === fundId);
        if (fundIndex !== -1) {
          const addCents = Math.round(stake * 100);
          const current = MOCK_FUND_TARGETS[fundIndex].totalCollectedCents ?? 0;
          const newAmount = current + addCents;
          MOCK_FUND_TARGETS[fundIndex] = {
            ...MOCK_FUND_TARGETS[fundIndex],
            totalCollectedCents: newAmount,
          };
        }
      }

      MOCK_TASKS[taskIndex] = {
        ...task,
        status: "failed",
        failedAt: now,
      };

      return MOCK_TASKS[taskIndex];
    }

    if (resolution_status === "completed") {
      MOCK_TASKS[taskIndex] = {
        ...task,
        status: "completed",
        completedAt: now,
      };
      return MOCK_TASKS[taskIndex];
    }

    throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported resolution status" });
  });
