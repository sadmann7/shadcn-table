import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core"

export const statusEnum = pgEnum("status", [
  "todo",
  "in-progress",
  "done",
  "canceled",
])

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"])

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  status: statusEnum("status"),
  label: varchar("label", { length: 255 }),
  priority: priorityEnum("priority"),
})
