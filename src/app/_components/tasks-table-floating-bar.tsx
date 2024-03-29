import * as React from "react"
import { tasks, type Task } from "@/db/schema"
import {
  ArrowUpIcon,
  CheckCircledIcon,
  Cross2Icon,
  TrashIcon,
} from "@radix-ui/react-icons"
import { SelectTrigger } from "@radix-ui/react-select"
import { type Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { deleteTasks, updateTasks } from "../_lib/mutations"

interface TasksTableFloatingBarProps {
  table: Table<Task>
}

export function TasksTableFloatingBar({ table }: TasksTableFloatingBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows

  const [isPending, startTransition] = React.useTransition()

  return (
    <div className="mx-auto flex w-fit items-center gap-5 rounded-md border bg-muted/50 px-4 py-2">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => table.toggleAllRowsSelected(false)}
            >
              <Cross2Icon className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-sm bg-accent font-semibold text-foreground">
            <p>Clear selection</p>
          </TooltipContent>
        </Tooltip>
        {rows.length} row(s) selected
      </div>
      <div className="flex items-center">
        <Select
          onValueChange={(value: Task["status"]) => {
            startTransition(() => {
              updateTasks({
                rows,
                status: value,
                onSucess: () => table.toggleAllRowsSelected(false),
              })
            })
          }}
        >
          <Tooltip>
            <SelectTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                  disabled={isPending}
                >
                  <CheckCircledIcon className="size-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
            </SelectTrigger>
            <TooltipContent className="rounded-sm bg-accent font-semibold text-foreground">
              <p>Update status</p>
            </TooltipContent>
          </Tooltip>
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
        <Select
          onValueChange={(value: Task["priority"]) => {
            startTransition(() => {
              updateTasks({
                rows,
                priority: value,
                onSucess: () => table.toggleAllRowsSelected(false),
              })
            })
          }}
        >
          <Tooltip>
            <SelectTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                  disabled={isPending}
                >
                  <ArrowUpIcon className="size-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
            </SelectTrigger>
            <TooltipContent className="rounded-sm bg-accent font-semibold text-foreground">
              <p>Update priority</p>
            </TooltipContent>
          </Tooltip>
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => {
                startTransition(() => {
                  deleteTasks({
                    rows,
                    onSucess: () => table.toggleAllRowsSelected(false),
                  })
                })
              }}
              disabled={isPending}
            >
              <TrashIcon className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-sm bg-accent font-semibold text-foreground">
            <p>Delete tasks</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
