"use server"

import { unstable_noStore as noStore, revalidatePath } from "next/cache"
import { db } from "@/db"
import { tasks, type Task } from "@/db/schema"
import { takeFirstOrThrow } from "@/db/utils"
import { asc, eq, inArray, not } from "drizzle-orm"
import { customAlphabet } from "nanoid"

import { getErrorMessage } from "@/lib/handle-error"

import { generateRandomTask } from "./utils"
import type { CreateTaskSchema, UpdateTaskSchema } from "./validations"

export async function createTask(input: CreateTaskSchema) {
  noStore()
  try {
    await db.transaction(async (tx) => {
      const newTask = await tx
        .insert(tasks)
        .values({
          code: `TASK-${customAlphabet("0123456789", 4)()}`,
          title: input.title,
          status: input.status,
          label: input.label,
          priority: input.priority,
        })
        .returning({
          id: tasks.id,
        })
        .then(takeFirstOrThrow)

      // Delete a task to keep the total number of tasks constant
      await tx.delete(tasks).where(
        eq(
          tasks.id,
          (
            await tx
              .select({
                id: tasks.id,
              })
              .from(tasks)
              .limit(1)
              .where(not(eq(tasks.id, newTask.id)))
              .orderBy(asc(tasks.createdAt))
              .then(takeFirstOrThrow)
          ).id
        )
      )
    })

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

export async function updateTasks(input: {
  ids: string[]
  label?: Task["label"]
  status?: Task["status"]
  priority?: Task["priority"]
}) {
  noStore()
  try {
    await db
      .update(tasks)
      .set({
        label: input.label,
        status: input.status,
        priority: input.priority,
      })
      .where(inArray(tasks.id, input.ids))

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
    await db.transaction(async (tx) => {
      await tx.delete(tasks).where(eq(tasks.id, input.id))

      // Create a new task for the deleted one
      await tx.insert(tasks).values(generateRandomTask())
    })

    revalidatePath("/")
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteTasks(input: { ids: string[] }) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(tasks).where(inArray(tasks.id, input.ids))

      // Create new tasks for the deleted ones
      await tx.insert(tasks).values(input.ids.map(() => generateRandomTask()))
    })

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
