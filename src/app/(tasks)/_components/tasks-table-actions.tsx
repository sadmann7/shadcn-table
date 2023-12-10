import * as React from "react"
import { tasks, type Task } from "@/db/schema"
import { ArrowUpIcon, CheckCircledIcon, TrashIcon } from "@radix-ui/react-icons"
import { SelectTrigger } from "@radix-ui/react-select"
import { type Table } from "@tanstack/react-table"
import { toast } from "sonner"

import { catchError } from "@/lib/catch-error"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"

import {
  deleteTask,
  updateTaskPriority,
  updateTaskStatus,
} from "../_actions/actions"

export function deleteSelectedRows(
  table: Table<Task>,
  event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
) {
  event?.preventDefault()
  const selectedRows = table.getFilteredSelectedRowModel().rows as {
    original: Task
  }[]
  toast.promise(
    Promise.all(
      selectedRows.map(async (row) =>
        deleteTask({
          id: row.original.id,
        })
      )
    ),
    {
      loading: "Deleting...",
      success: () => {
        return "Tasks deleted successfully."
      },
      error: (err: unknown) => {
        return catchError(err)
      },
    }
  )
}

export function updateTasksStatus(table: Table<Task>, status: string) {
  const selectedRows = table.getFilteredSelectedRowModel().rows as unknown as {
    original: Task
  }[]

  selectedRows.map(async (row) => {
    await updateTaskStatus({
      id: row.original.id,
      status: status as Task["status"],
    })
  })
}

export function updateTasksPriority(table: Table<Task>, priority: string) {
  const selectedRows = table.getFilteredSelectedRowModel().rows as unknown as {
    original: Task
  }[]

  selectedRows.map(async (row) => {
    await updateTaskPriority({
      id: row.original.id,
      priority: priority as Task["priority"],
    })
  })
}

export function FloatingBarContent(table: Table<Task>) {
  return (
    <div className="justify-between gap-2 align-middle">
      <Select onValueChange={(value) => updateTasksStatus(table, value)}>
        <SelectTrigger asChild>
          <Button
            aria-label="Delete selected rows"
            title="Status"
            className="h-auto bg-transparent p-1 text-white hover:bg-zinc-700"
          >
            <CheckCircledIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </SelectTrigger>
        <SelectContent align="center">
          <SelectGroup>
            {tasks.status.enumValues.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => updateTasksPriority(table, value)}>
        <SelectTrigger asChild>
          <Button
            aria-label="Delete selected rows"
            title="Priority"
            className="h-auto bg-transparent p-1 text-white hover:bg-zinc-700"
          >
            <ArrowUpIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </SelectTrigger>
        <SelectContent align="center">
          <SelectGroup>
            {tasks.priority.enumValues.map((priority) => (
              <SelectItem
                key={priority}
                value={priority}
                className="capitalize"
              >
                {priority}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        aria-label="Change status of selected rows"
        title="Delete"
        className="h-auto bg-transparent p-1 text-white hover:bg-zinc-700"
        onClick={(event) => {
          table.toggleAllPageRowsSelected(false)
          deleteSelectedRows?.(table, event)
        }}
      >
        <TrashIcon className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
