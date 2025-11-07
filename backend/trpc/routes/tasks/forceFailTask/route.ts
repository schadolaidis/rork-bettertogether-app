import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { MOCK_TASKS, MOCK_FUND_TARGETS, MOCK_USERS } from "@/mocks/data";
import type { Task } from "@/types";
import { TRPCError } from "@trpc/server";

const inputSchema = z.object({
  task_id: z.string(),
});

export default publicProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    console.log("forceFailTask called", input);
    const { task_id } = input;

    const taskIndex = MOCK_TASKS.findIndex((t) => t.id === task_id);
    if (taskIndex === -1) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
    }

    const task: Task = MOCK_TASKS[taskIndex];
    const now = new Date().toISOString();

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

    const assigned = task.assignedTo;
    const assignedUserId = Array.isArray(assigned) ? (assigned[0] ?? null) : assigned ?? null;
    if (assignedUserId) {
      const userIndex = MOCK_USERS.findIndex((u) => u.id === assignedUserId);
      if (userIndex !== -1) {
        const user = MOCK_USERS[userIndex];
        MOCK_USERS[userIndex] = {
          ...user,
          currentStreakCount: 0,
        };
      }
    }

    MOCK_TASKS[taskIndex] = {
      ...task,
      status: "failed_stake_paid",
      failedAt: now,
    };

    return MOCK_TASKS[taskIndex];
  });