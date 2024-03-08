import { pgTable } from "@/db/utils"
import { pgEnum, varchar } from "drizzle-orm/pg-core"

import { databasePrefix } from "@/lib/constants"
import { createId } from "@/lib/utils"

export const statusEnum = pgEnum(`${databasePrefix}_status`, [
  "todo",
  "in-progress",
  "done",
  "canceled",
])

export const labelEnum = pgEnum(`${databasePrefix}_label`, [
  "bug",
  "feature",
  "enhancement",
  "documentation",
])

export const priorityEnum = pgEnum(`${databasePrefix}_priority`, [
  "low",
  "medium",
  "high",
])

export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  code: varchar("code", { length: 255 }).unique(),
  title: varchar("title", { length: 255 }),
  status: statusEnum("status").notNull().default("todo"),
  label: labelEnum("label").notNull().default("bug"),
  priority: priorityEnum("priority").notNull().default("low"),
})

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
