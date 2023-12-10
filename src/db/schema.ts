import { mysqlEnum, mysqlTableCreator, varchar } from "drizzle-orm/mysql-core"

import { createId } from "@/lib/utils"

export const mysqlTable = mysqlTableCreator((name) => `shadcn-table_${name}`)

export const tasks = mysqlTable("tasks", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
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

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
