import { type Task } from "@/db/schema"
import { type Row } from "@tanstack/react-table"
import { toast } from "sonner"

import { getErrorMessage } from "@/lib/handle-error"

import { deleteTask, updateTask } from "./actions"

export function deleteTasks({
  rows,
  onSuccess,
}: {
  rows: Row<Task>[]
  onSuccess?: () => void
}) {
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
        onSuccess?.()
        return "Tasks deleted"
      },
      error: (err) => getErrorMessage(err),
    }
  )
}

export function updateTasks({
  rows,
  label,
  status,
  priority,
  onSuccess,
}: {
  rows: Row<Task>[]
  label?: Task["label"]
  status?: Task["status"]
  priority?: Task["priority"]
  onSuccess?: () => void
}) {
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
        onSuccess?.()
        return "Tasks updated"
      },
      error: (err) => getErrorMessage(err),
    }
  )
}
