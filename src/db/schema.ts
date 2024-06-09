import { pgTable } from "@/db/utils"
import { sql } from "drizzle-orm"
import { pgEnum, timestamp, varchar } from "drizzle-orm/pg-core"

import { databasePrefix } from "@/lib/constants"
import { generateId } from "@/lib/id"

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
  id: varchar("id", { length: 30 })
    .$defaultFn(() => generateId())
    .primaryKey(),
  code: varchar("code", { length: 256 }).notNull().unique(),
  title: varchar("title", { length: 256 }),
  status: statusEnum("status").notNull().default("todo"),
  label: labelEnum("label").notNull().default("bug"),
  priority: priorityEnum("priority").notNull().default("low"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
})

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
