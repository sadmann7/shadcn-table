"use client"

import { tasks, type Task } from "@/db/schema"
import {
  ArrowUpIcon,
  CheckCircledIcon,
  Cross2Icon,
  TrashIcon,
} from "@radix-ui/react-icons"
import { SelectTrigger } from "@radix-ui/react-select"
import { type Table } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"
import { updateTaskPriority, updateTaskStatus } from "@/app/_actions/task"

interface DataTableFloatingBarProps<TData>
  extends React.HTMLAttributes<HTMLElement> {
  table: Table<TData>
  deleteRowsAction?: React.MouseEventHandler<HTMLButtonElement>
}

export function DataTableFloatingBar<TData>({
  table,
  deleteRowsAction,
  className,
  ...props
}: DataTableFloatingBarProps<TData>) {
  if (table.getFilteredSelectedRowModel().rows.length <= 0) return null

  function updateTasksStatus(table: Table<TData>, status: string) {
    const selectedRows = table.getFilteredSelectedRowModel()
      .rows as unknown as { original: Task }[]

    selectedRows.map(async (row) => {
      await updateTaskStatus({
        id: row.original.id,
        status: status as Task["status"],
      })
    })
  }

  function updateTasksPriority(table: Table<TData>, priority: string) {
    const selectedRows = table.getFilteredSelectedRowModel()
      .rows as unknown as { original: Task }[]

    selectedRows.map(async (row) => {
      await updateTaskPriority({
        id: row.original.id,
        priority: priority as Task["priority"],
      })
    })
  }

  return (
    <div
      className={cn(
        "mx-auto flex w-fit items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-white",
        className
      )}
      {...props}
    >
      <Button
        aria-label="Clear selection"
        title="Clear"
        className="h-auto bg-transparent p-1 text-white hover:bg-zinc-700"
        onClick={() => table.toggleAllRowsSelected(false)}
      >
        <Cross2Icon className="h-4 w-4" aria-hidden="true" />
      </Button>
      {table.getFilteredSelectedRowModel().rows.length} row(s) selected
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
          deleteRowsAction?.(event)
        }}
      >
        <TrashIcon className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
