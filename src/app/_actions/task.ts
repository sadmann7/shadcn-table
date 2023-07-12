"use server"

import { db } from "@/db"
import { Task, tasks } from "@/db/schema"
import { faker } from "@faker-js/faker"

export async function seedTasksAction() {
  const allTasks: Task[] = []

  for (let i = 0; i < 100; i++) {
    allTasks.push({
      id: i + 1,
      code: `TASK-${faker.datatype.number({ min: 1000, max: 9999 })}`,
      title: faker.hacker
        .phrase()
        .replace(/^./, (letter) => letter.toUpperCase()),
      status:
        faker.helpers.shuffle<Task["status"]>([
          "todo",
          "in-progress",
          "done",
          "canceled",
        ])[0] ?? "todo",
      label:
        faker.helpers.shuffle<Task["label"]>([
          "bug",
          "feature",
          "enhancement",
          "documentation",
        ])[0] ?? "bug",
      priority:
        faker.helpers.shuffle<Task["priority"]>(["low", "medium", "high"])[0] ??
        "low",
    })
  }

  await db.insert(tasks).values(allTasks)
}
