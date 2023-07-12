import { type InferModel } from "drizzle-orm";
import { mysqlEnum, mysqlTable, serial, varchar } from "drizzle-orm/mysql-core"
import { createSelectSchema } from 'drizzle-zod';


export const tasks = mysqlTable("tasks", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 255 }).unique(),
  title: varchar("title", { length: 255 }),
  status: mysqlEnum("status", ["todo", "in-progress", "done", "canceled"]),
  label: varchar("label", { length: 255 }),
  priority: mysqlEnum("priority", ["low", "medium", "high"]),
})

export type Task = InferModel<typeof tasks>;

export const selectTaskSchema = createSelectSchema(tasks);

