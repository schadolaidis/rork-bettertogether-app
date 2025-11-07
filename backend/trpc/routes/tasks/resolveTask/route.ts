import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { MOCK_TASKS, MOCK_FUND_TARGETS, MOCK_USERS } from "@/mocks/data";
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
      const assigned = task.assignedTo;
      const assignedUserId = Array.isArray(assigned) ? (assigned[0] ?? null) : assigned ?? null;
      if (assignedUserId) {
        const userIndex = MOCK_USERS.findIndex((u) => u.id === assignedUserId);
        if (userIndex !== -1) {
          const user = MOCK_USERS[userIndex];
          const jokers = user.jokerCount ?? 0;
          if (jokers > 0) {
            console.log("Joker available - intercepting fail", { taskId: task.id, userId: user.id, jokers });
            return { status: "JOKER_AVAILABLE", joker_count: jokers, task_id } as const;
          }
        }
      }

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
    }

    if (resolution_status === "completed") {
      MOCK_TASKS[taskIndex] = {
        ...task,
        status: "completed",
        completedAt: now,
      };

      const assigned = task.assignedTo;
      const assignedUserId = Array.isArray(assigned) ? (assigned[0] ?? null) : assigned ?? null;

      if (assignedUserId) {
        const userIndex = MOCK_USERS.findIndex((u) => u.id === assignedUserId);
        if (userIndex !== -1) {
          const user = MOCK_USERS[userIndex];
          const newStreakCount = (user.currentStreakCount ?? 0) + 1;
          const isMilestone = newStreakCount % 10 === 0;
          const newJokerCount = isMilestone ? (user.jokerCount ?? 0) + 1 : user.jokerCount ?? 0;

          MOCK_USERS[userIndex] = {
            ...user,
            currentStreakCount: newStreakCount,
            jokerCount: newJokerCount,
          };

          if (isMilestone) {
            console.log(
              `Milestone reached: User ${user.id} streak=${newStreakCount}. Granted a Joker. Total jokers=${newJokerCount}`
            );
          }
        } else {
          console.warn("Assigned user not found for task completion", { assignedUserId, taskId: task.id });
        }
      } else {
        console.warn("No assigned user found on task for streak accounting", { taskId: task.id });
      }

      return MOCK_TASKS[taskIndex];
    }

    throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported resolution status" });
  });
