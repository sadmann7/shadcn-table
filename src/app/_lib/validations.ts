import { tasks } from "@/db/schema"
import * as z from "zod"

export const updateTaskLabelSchema = z.object({
  id: z.string(),
  label: z.enum(tasks.label.enumValues),
})

export const updateTaskStatusSchema = z.object({
  id: z.string(),
  status: z.enum(tasks.status.enumValues),
})

export const updateTaskPrioritySchema = z.object({
  id: z.string(),
  priority: z.enum(tasks.priority.enumValues),
})
