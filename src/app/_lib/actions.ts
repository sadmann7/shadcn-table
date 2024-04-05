"use server"

import { unstable_noStore as noStore, revalidatePath } from "next/cache"
import { db } from "@/db"
import { tasks, type Task } from "@/db/schema"
import { faker } from "@faker-js/faker"
import { eq } from "drizzle-orm"
import { customAlphabet } from "nanoid"

import { getErrorMessage } from "@/lib/handle-error"
import { generateId } from "@/lib/utils"

import type { CreateTaskSchema, UpdateTaskSchema } from "./validations"

export async function seedTasks(
  input: { count: number; reset?: boolean } = {
    count: 100,
    reset: false,
  }
) {
  noStore()
  try {
    const allTasks: Task[] = []

    for (let i = 0; i < input.count; i++) {
      allTasks.push({
        id: generateId(),
        code: `TASK-${customAlphabet("0123456789", 4)()}`,
        title: faker.hacker
          .phrase()
          .replace(/^./, (letter) => letter.toUpperCase()),
        status:
          faker.helpers.shuffle<Task["status"]>(tasks.status.enumValues)[0] ??
          "todo",
        label:
          faker.helpers.shuffle<Task["label"]>(tasks.label.enumValues)[0] ??
          "bug",
        priority:
          faker.helpers.shuffle<Task["priority"]>(
            tasks.priority.enumValues
          )[0] ?? "low",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    input.reset && (await db.delete(tasks))

    console.log("📝 Inserting tasks", allTasks.length)

    await db.insert(tasks).values(allTasks)
  } catch (err) {
    console.error(err)
  }
}

export async function createTask(
  input: CreateTaskSchema & { anotherTaskId: string }
) {
  noStore()
  try {
    await Promise.all([
      db.insert(tasks).values({
        id: generateId(),
        code: `TASK-${customAlphabet("0123456789", 4)()}`,
        title: input.title,
        status: input.status,
        label: input.label,
        priority: input.priority,
      }),
      // Delete another task to maintain the same number of tasks
      deleteTask({ id: input.anotherTaskId }),
    ])

    revalidatePath("/")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function updateTask(input: UpdateTaskSchema & { id: string }) {
  noStore()
  try {
    await db
      .update(tasks)
      .set({
        title: input.title,
        label: input.label,
        status: input.status,
        priority: input.priority,
      })
      .where(eq(tasks.id, input.id))

    revalidatePath("/")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteTask(input: { id: string }) {
  try {
    await db.delete(tasks).where(eq(tasks.id, input.id))

    // Create a new task for the deleted one
    await seedTasks({ count: 1 })

    revalidatePath("/")
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}
