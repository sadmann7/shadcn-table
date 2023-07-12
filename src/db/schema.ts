import { mysqlEnum, mysqlTable, serial, varchar } from "drizzle-orm/mysql-core"

export const tasks = mysqlTable("tasks", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 255 }).unique(),
  title: varchar("title", { length: 255 }),
  status: mysqlEnum("status", ["todo", "in-progress", "done", "canceled"]),
  label: varchar("label", { length: 255 }),
  priority: mysqlEnum("priority", ["low", "medium", "high"]),
})
