import { type Task } from "@/db/schema"
import { type Row } from "@tanstack/react-table"
import { toast } from "sonner"

import { getErrorMessage } from "@/lib/handle-error"

import { deleteTask, updateTask } from "./actions"

interface DeleteTasksInput {
  rows: Row<Task>[]
  onSucess?: () => void
}

export function deleteTasks({ rows, onSucess }: DeleteTasksInput) {
  toast.promise(
    Promise.all(
      rows.map(async (row) =>
        deleteTask({
          id: row.original.id,
        })
      )
    ),
    {
      loading: "Deleting...",
      success: () => {
        onSucess?.()
        return "Tasks deleted"
      },
      error: (err) => getErrorMessage(err),
    }
  )
}

interface UpdateTasksInput extends DeleteTasksInput {
  label?: Task["label"]
  status?: Task["status"]
  priority?: Task["priority"]
}

export function updateTasks({
  rows,
  label,
  status,
  priority,
  onSucess,
}: UpdateTasksInput) {
  toast.promise(
    Promise.all(
      rows.map(async (row) =>
        updateTask({
          id: row.original.id,
          label,
          status,
          priority,
        })
      )
    ),
    {
      loading: "Updating...",
      success: () => {
        onSucess?.()
        return "Tasks updated"
      },
      error: (err) => getErrorMessage(err),
    }
  )
}
