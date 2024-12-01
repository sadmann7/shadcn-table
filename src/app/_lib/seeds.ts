import { db } from "@/db/index"
import { tasks, users, type Task, type User } from "@/db/schema"

import { generateRandomTask, generateRandomUser } from "./utils"

export async function seedTasks(input: { count: number }) {
  const count = input.count ?? 100

  try {
    const allTasks: Task[] = []

    for (let i = 0; i < count; i++) {
      allTasks.push(generateRandomTask())
    }

    await db.delete(tasks)

    console.log("📝 Inserting tasks", allTasks.length)

    await db.insert(tasks).values(allTasks).onConflictDoNothing()
  } catch (err) {
    console.error(err)
  }
}

export async function seedUsers(input: { count: number }) {
  const count = input.count ?? 10

  try {
    const allUsers: User[] = []

    for (let i = 0; i < count; i++) {
      allUsers.push(generateRandomUser())
    }

    await db.delete(tasks)

    console.log("📝 Inserting users", allUsers.length)

    await db.insert(users).values(allUsers).onConflictDoNothing()
  } catch (err) {
    console.error(err)
  }
}
