"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { tasks, type Task } from "@/db/schema"
import { faker } from "@faker-js/faker"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { updateTaskLabelSchema } from "@/lib/validations/task"

export async function seedTasksAction() {
  const allTasks: Task[] = []

  for (let i = 0; i < 100; i++) {
    allTasks.push({
      id: faker.number.int({ min: 1000, max: 9999 }),
      code: `TASK-${faker.number.int({ min: 1000, max: 9999 })}`,
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
        faker.helpers.shuffle<Task["priority"]>(tasks.priority.enumValues)[0] ??
        "low",
    })
  }

  await db.insert(tasks).values(allTasks)
}

export async function updateTaskLabelAction({
  id,
  label,
}: z.infer<typeof updateTaskLabelSchema>) {
  await db.update(tasks).set({ label }).where(eq(tasks.id, id))

  revalidatePath("/")
}
