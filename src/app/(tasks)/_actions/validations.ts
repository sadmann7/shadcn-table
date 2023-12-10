import { tasks } from "@/db/schema"
import * as z from "zod"

export const updateTaskLabelSchema = z.object({
  uid: z.number(),
  label: z.enum(tasks.label.enumValues),
})

export const updateTaskStatusSchema = z.object({
  uid: z.number(),
  status: z.enum(tasks.status.enumValues),
})

export const updateTaskPrioritySchema = z.object({
  uid: z.number(),
  priority: z.enum(tasks.priority.enumValues),
})
