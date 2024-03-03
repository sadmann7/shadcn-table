import { pgEnum, pgTableCreator, varchar } from "drizzle-orm/pg-core"

import { createId } from "@/lib/utils"

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const pgTable = pgTableCreator((name) => `shadcn-table_${name}`)

export const statusEnum = pgEnum("status", [
  "todo",
  "in-progress",
  "done",
  "canceled",
])

export const labelEnum = pgEnum("label", [
  "bug",
  "feature",
  "enhancement",
  "documentation",
])

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"])

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
