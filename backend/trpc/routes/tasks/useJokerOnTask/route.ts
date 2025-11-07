import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { MOCK_TASKS, MOCK_USERS } from "@/mocks/data";
import type { Task } from "@/types";
import { TRPCError } from "@trpc/server";

const inputSchema = z.object({
  task_id: z.string(),
});

export default publicProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    console.log("useJokerOnTask called", input);
    const { task_id } = input;

    const taskIndex = MOCK_TASKS.findIndex((t) => t.id === task_id);
    if (taskIndex === -1) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
    }

    const task: Task = MOCK_TASKS[taskIndex];
    const now = new Date().toISOString();

    const assigned = task.assignedTo;
    const assignedUserId = Array.isArray(assigned) ? (assigned[0] ?? null) : assigned ?? null;
    if (!assignedUserId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Task has no assigned user" });
    }

    const userIndex = MOCK_USERS.findIndex((u) => u.id === assignedUserId);
    if (userIndex === -1) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Assigned user not found" });
    }

    const user = MOCK_USERS[userIndex];
    const currentJokers = user.jokerCount ?? 0;
    if (currentJokers <= 0) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "No jokers available" });
    }

    MOCK_USERS[userIndex] = {
      ...user,
      jokerCount: currentJokers - 1,
      currentStreakCount: 0,
    };

    MOCK_TASKS[taskIndex] = {
      ...task,
      status: "failed_joker_used",
      failedAt: now,
    };

    return { task: MOCK_TASKS[taskIndex], user: MOCK_USERS[userIndex] };
  });