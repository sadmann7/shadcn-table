import { tasks } from "@/db/schema"
import * as z from "zod"

export const updateTaskLabelSchema = z.object({
  id: z.number(),
  label: z.enum(tasks.label.enumValues),
})
