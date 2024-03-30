"use client"

import * as React from "react"
import { type Task } from "@/db/schema"
import { type ColumnDef } from "@tanstack/react-table"

import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"

import { deleteTasks } from "../_lib/mutations"
import { type getTasks } from "../_lib/queries"
import {
  filterableColumns,
  getColumns,
  searchableColumns,
} from "./tasks-table-columns"
import { TasksTableFloatingBar } from "./tasks-table-floating-bar"
import { useTasksTable } from "./tasks-table-provider"

interface TasksTableProps {
  tasksPromise: ReturnType<typeof getTasks>
}

export function TasksTable({ tasksPromise }: TasksTableProps) {
  // Learn more about React.use here: https://react.dev/reference/react/use
  const { data, pageCount } = React.use(tasksPromise)

  // do the memoization to the columns so they don't re-render on every render
  // learn more about memo in https://react.dev/reference/react/memo
  const columns = React.useMemo<ColumnDef<Task, unknown>[]>(
    () => getColumns(),
    []
  )

  // Using the useTasksTable hook to showcase some features. Feel free to remove the TasksTableProvider component.
  const { enableAdvancedFilter, showFloatingBar } = useTasksTable()

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    searchableColumns,
    filterableColumns,
    enableAdvancedFilter,
  })

  return (
    <DataTable
      table={table}
      columns={columns}
      searchableColumns={searchableColumns}
      filterableColumns={filterableColumns}
      enableAdvancedFilter={enableAdvancedFilter}
      floatingBar={
        showFloatingBar ? <TasksTableFloatingBar table={table} /> : null
      }
      deleteRowsAction={() =>
        deleteTasks({ rows: table.getFilteredSelectedRowModel().rows })
      }
    />
  )
}
