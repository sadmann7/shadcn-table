"use client"

import * as React from "react"
import { type Task } from "@/db/schema"
import type { DataTableFilterField } from "@/types"

import { useDataTable } from "@/hooks/use-data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/advanced/data-table-advanced-toolbar"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"

import type {
  getTaskCountByPriority,
  getTaskCountByStatus,
  getTasks,
} from "../_lib/queries"
import { getColumns } from "./tasks-table-columns"
import { TasksTableFloatingBar } from "./tasks-table-floating-bar"
import { useTasksTable } from "./tasks-table-provider"
import { TasksTableToolbarActions } from "./tasks-table-toolbar-actions"

interface TasksTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getTasks>>,
      Awaited<ReturnType<typeof getTaskCountByStatus>>,
      Awaited<ReturnType<typeof getTaskCountByPriority>>,
    ]
  >
}

export function TasksTable({ promises }: TasksTableProps) {
  // Feature flags for showcasing some additional features. Feel free to remove them.
  const { featureFlags } = useTasksTable()

  // Learn more about React.use here: https://react.dev/reference/react/use
  const [{ data, pageCount }, taskCountByStatus, taskCountByPriority] =
    React.use(promises)

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo(() => getColumns(), [])

  // Filter fields for the data table
  const filterFields: DataTableFilterField<Task>[] = [
    {
      label: "Title",
      value: "title",
      placeholder: "Filter titles...",
    },
    {
      label: "Status",
      value: "status",
      options: taskCountByStatus.map(({ count, status }) => ({
        label: status[0]?.toUpperCase() + status.slice(1),
        value: status,
        count,
      })),
    },
    {
      label: "Priority",
      value: "priority",
      options: taskCountByPriority.map(({ count, priority }) => ({
        label: priority[0]?.toUpperCase() + priority.slice(1),
        value: priority,
        count,
      })),
    },
  ]

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    // optional props
    filterFields,
    enableAdvancedFilter: featureFlags.includes("advancedFilter"),
    defaultPerPage: 10,
    defaultSort: "createdAt.desc",
  })

  return (
    <div className="w-full space-y-2.5 overflow-auto">
      {featureFlags.includes("advancedFilter") ? (
        <DataTableAdvancedToolbar table={table} filterFields={filterFields}>
          <TasksTableToolbarActions table={table} />
        </DataTableAdvancedToolbar>
      ) : (
        <DataTableToolbar table={table} filterFields={filterFields}>
          <TasksTableToolbarActions table={table} />
        </DataTableToolbar>
      )}
      <DataTable
        table={table}
        floatingBar={
          featureFlags.includes("floatingBar") ? (
            <TasksTableFloatingBar table={table} />
          ) : null
        }
      />
    </div>
  )
}
