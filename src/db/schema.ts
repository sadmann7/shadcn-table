import { mysqlEnum, mysqlTableCreator, varchar } from "drizzle-orm/mysql-core"

import { createId } from "@/lib/utils"

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

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
