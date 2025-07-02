"use server";

import type { Task } from "@/db/schema";
import { createTaskAdapter } from "@/lib/database-adapter";
import { customAlphabet } from "nanoid";
import { revalidateTag, unstable_noStore } from "next/cache";

import { getErrorMessage } from "@/lib/handle-error";

import { generateRandomTask } from "./utils";
import type { CreateTaskSchema, UpdateTaskSchema } from "./validations";

export async function seedTasks(input: { count: number }) {
  const count = input.count ?? 100;

  try {
    const adapter = await createTaskAdapter();
    const allTasks: Task[] = [];

    for (let i = 0; i < count; i++) {
      allTasks.push(generateRandomTask());
    }

    // Note: For seeding, we need to clear existing data and insert in bulk
    // This would require additional adapter methods for bulk operations
    // For now, we'll create tasks individually
    console.log("📝 Inserting tasks", allTasks.length);

    for (const task of allTasks) {
      await adapter.create(task);
    }
  } catch (err) {
    console.error(err);
  }
}

export async function createTask(input: CreateTaskSchema) {
  unstable_noStore();
  try {
    const adapter = await createTaskAdapter();
    
    await adapter.transaction(async ({ adapter: tx }) => {
      const newTask = await tx.create({
        code: `TASK-${customAlphabet("0123456789", 4)()}`,
        title: input.title,
        status: input.status,
        label: input.label,
        priority: input.priority,
      });

      // Delete the oldest task to keep the total number of tasks constant
      const oldestTask = await tx.findFirst({
        filters: [{
          id: 'id',
          operator: 'ne',
          value: newTask.id,
          variant: 'text',
          filterId: 'exclude-new-task',
        }],
        sorts: [{ id: 'createdAt', desc: false }],
        joinOperator: 'and',
      });

      if (oldestTask) {
        await tx.delete(oldestTask.id);
      }
    });

    revalidateTag("tasks");
    revalidateTag("task-status-counts");
    revalidateTag("task-priority-counts");

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function updateTask(input: UpdateTaskSchema & { id: string }) {
  unstable_noStore();
  try {
    const adapter = await createTaskAdapter();
    
    const data = await adapter.update(input.id, {
      title: input.title,
      label: input.label,
      status: input.status,
      priority: input.priority,
      estimatedHours: input.estimatedHours,
    });

    revalidateTag("tasks");
    if (data.status === input.status) {
      revalidateTag("task-status-counts");
    }
    if (data.priority === input.priority) {
      revalidateTag("task-priority-counts");
    }

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function updateTasks(input: {
  ids: string[];
  label?: Task["label"];
  status?: Task["status"];
  priority?: Task["priority"];
}) {
  unstable_noStore();
  try {
    const adapter = await createTaskAdapter();
    
    const data = await adapter.updateMany(input.ids, {
      label: input.label,
      status: input.status,
      priority: input.priority,
    });

    revalidateTag("tasks");
    // Check if we should revalidate counts based on the first updated task
    const firstTask = data[0];
    if (firstTask?.status === input.status) {
      revalidateTag("task-status-counts");
    }
    if (firstTask?.priority === input.priority) {
      revalidateTag("task-priority-counts");
    }

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function deleteTask(input: { id: string }) {
  unstable_noStore();
  try {
    const adapter = await createTaskAdapter();
    
    await adapter.transaction(async ({ adapter: tx }) => {
      await tx.delete(input.id);

      // Create a new task for the deleted one
      await tx.create(generateRandomTask());
    });

    revalidateTag("tasks");
    revalidateTag("task-status-counts");
    revalidateTag("task-priority-counts");

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function deleteTasks(input: { ids: string[] }) {
  unstable_noStore();
  try {
    const adapter = await createTaskAdapter();
    
    await adapter.transaction(async ({ adapter: tx }) => {
      await tx.deleteMany(input.ids);

      // Create new tasks for the deleted ones
      for (let i = 0; i < input.ids.length; i++) {
        await tx.create(generateRandomTask());
      }
    });

    revalidateTag("tasks");
    revalidateTag("task-status-counts");
    revalidateTag("task-priority-counts");

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}
