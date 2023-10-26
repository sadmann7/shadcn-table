import { tasks } from "@/db/schema"
import * as z from "zod"

export const updateTaskLabelSchema = z.object({
  id: z.number(),
  label: z.enum(tasks.label.enumValues),
})

export const updateTaskStatusSchema = z.object({
  id: z.number(),
  status: z.enum(tasks.status.enumValues),
})

export const updateTaskPrioritySchema = z.object({
  id: z.number(),
  priority: z.enum(tasks.priority.enumValues),
})
