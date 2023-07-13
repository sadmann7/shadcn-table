import { type InferModel } from "drizzle-orm"
import { mysqlEnum, mysqlTable, serial, varchar } from "drizzle-orm/mysql-core"

export const tasks = mysqlTable("tasks", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 255 }).unique(),
  title: varchar("title", { length: 255 }),
  status: mysqlEnum("status", ["todo", "in-progress", "done", "canceled"])
    .notNull()
    .default("todo"),
  label: mysqlEnum("label", ["bug", "feature", "enhancement", "documentation"])
    .notNull()
    .default("bug"),
  priority: mysqlEnum("priority", ["low", "medium", "high"])
    .notNull()
    .default("low"),
})

export type Task = InferModel<typeof tasks>
