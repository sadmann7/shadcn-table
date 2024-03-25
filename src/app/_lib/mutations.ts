import { type Task } from "@/db/schema"
import { type Row } from "@tanstack/react-table"
import { toast } from "sonner"

import { getErrorMessage } from "@/lib/handle-error"

import { deleteTask, updateTaskPriority, updateTaskStatus } from "./actions"

export function deleteTasks({
  rows,
  onSucess,
}: {
  rows: Row<Task>[]
  onSucess?: () => void
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
        onSucess?.()
        return "Tasks deleted"
      },
      error: (err) => getErrorMessage(err),
    }
  )
}

export function updateTasksStatus({
  rows,
  status,
  onSucess,
}: {
  rows: Row<Task>[]
  status: string
  onSucess?: () => void
}) {
  toast.promise(
    Promise.all(
      rows.map(async (row) =>
        updateTaskStatus({
          id: row.original.id,
          status: status as Task["status"],
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

export function updateTasksPriority({
  rows,
  priority,
  onSucess,
}: {
  rows: Row<Task>[]
  priority: string
  onSucess?: () => void
}) {
  toast.promise(
    Promise.all(
      rows.map(async (row) =>
        updateTaskPriority({
          id: row.original.id,
          priority: priority as Task["priority"],
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
