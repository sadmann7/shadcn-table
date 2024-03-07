import { tasks } from "@/db/schema"
import * as z from "zod"

export const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  title: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  operator: z.string().optional(),
})

export const getTasksSchema = searchParamsSchema

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
