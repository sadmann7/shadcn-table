"use client"

import * as React from "react"
import { tasks, type Task } from "@/db/schema"
import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from "@/types"
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons"
import { type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

import { getErrorMessage } from "@/lib/handle-error"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

import { deleteTask, updateTaskLabel } from "../_lib/actions"

export function getColumns(): ColumnDef<Task>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Task" />
      ),
      cell: ({ row }) => <div className="w-[80px]">{row.getValue("code")}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        const label = tasks.label.enumValues.find(
          (label) => label === row.original.label
        )

        return (
          <div className="flex space-x-2">
            {label && <Badge variant="outline">{label}</Badge>}
            <span className="max-w-[500px] truncate font-medium">
              {row.getValue("title")}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = tasks.status.enumValues.find(
          (status) => status === row.original.status
        )

        if (!status) return null

        return (
          <div className="flex w-[100px] items-center">
            {status === "canceled" ? (
              <CrossCircledIcon
                className="mr-2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
            ) : status === "done" ? (
              <CheckCircledIcon
                className="mr-2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
            ) : status === "in-progress" ? (
              <StopwatchIcon
                className="mr-2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
            ) : status === "todo" ? (
              <QuestionMarkCircledIcon
                className="mr-2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
            ) : (
              <CircleIcon
                className="mr-2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            <span className="capitalize">{status}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = tasks.priority.enumValues.find(
          (priority) => priority === row.original.priority
        )

        if (!priority) {
          return null
        }

        return (
          <div className="flex items-center">
            {priority === "low" ? (
              <ArrowDownIcon
                className="mr-2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
            ) : priority === "medium" ? (
              <ArrowRightIcon
                className="mr-2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
            ) : priority === "high" ? (
              <ArrowUpIcon
                className="mr-2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
            ) : (
              <CircleIcon
                className="mr-2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            <span className="capitalize">{priority}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id))
      },
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        const [isUpdatePending, startUpdateTransition] = React.useTransition()
        const [isDeletePending, startDeleteTransition] = React.useTransition()

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <DotsHorizontalIcon className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={row.original.label}
                    onValueChange={(value) => {
                      startUpdateTransition(() => {
                        toast.promise(
                          updateTaskLabel({
                            id: row.original.id,
                            label: value as Task["label"],
                          }),
                          {
                            loading: "Updating...",
                            success: "Label updated",
                            error: (err) => getErrorMessage(err),
                          }
                        )
                      })
                    }}
                  >
                    {tasks.label.enumValues.map((label) => (
                      <DropdownMenuRadioItem
                        key={label}
                        value={label}
                        className="capitalize"
                        disabled={isUpdatePending}
                      >
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  startDeleteTransition(() => {
                    toast.promise(
                      deleteTask({
                        id: row.original.id,
                      }),
                      {
                        loading: "Deleting...",
                        success: () => {
                          row.toggleSelected(false)
                          return "Task deleted"
                        },
                        error: (err: unknown) => getErrorMessage(err),
                      }
                    )
                  })
                }}
                disabled={isDeletePending}
              >
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

export const searchableColumns: DataTableSearchableColumn<Task>[] = [
  {
    id: "title",
    placeholder: "Filter titles...",
  },
]

export const filterableColumns: DataTableFilterableColumn<Task>[] = [
  {
    id: "status",
    title: "Status",
    options: tasks.status.enumValues.map((status) => ({
      label: status[0]?.toUpperCase() + status.slice(1),
      value: status,
    })),
  },
  {
    id: "priority",
    title: "Priority",
    options: tasks.priority.enumValues.map((priority) => ({
      label: priority[0]?.toUpperCase() + priority.slice(1),
      value: priority,
    })),
  },
]
