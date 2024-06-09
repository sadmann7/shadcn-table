import { db } from "@/db"
import { tasks, type Task } from "@/db/schema"

import { generateRandomTask } from "./utils"

export async function seedTasks(input: { count: number }) {
  const count = input.count ?? 100

  try {
    const allTasks: Task[] = []

    for (let i = 0; i < count; i++) {
      allTasks.push(generateRandomTask())
    }

    await db.delete(tasks)

    console.log("📝 Inserting tasks", allTasks.length)

    await db.insert(tasks).values(allTasks)
  } catch (err) {
    console.error(err)
  }
}
