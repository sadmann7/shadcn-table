"use client"

import * as React from "react"
import { type Task } from "@/db/schema"
import { type ColumnDef } from "@tanstack/react-table"

import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"

import { type TasksPromise } from "../_lib/queries"
import { deleteSelectedRows } from "./tasks-table-actions"
import {
  fetchTasksTableColumnDefs,
  filterableColumns,
  searchableColumns,
} from "./tasks-table-column-def"

interface TasksTableShellProps {
  tasksPromise: TasksPromise
}

export function TasksTableShell({ tasksPromise }: TasksTableShellProps) {
  // Learn more about use here: https://react.dev/reference/react/use
  const { data, pageCount } = React.use(tasksPromise)

  const [isPending, startTransition] = React.useTransition()

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<Task, unknown>[]>(
    () => fetchTasksTableColumnDefs(isPending, startTransition),
    [isPending]
  )

  const { dataTable } = useDataTable({
    columns,
    data,
    pageCount,
    filterableColumns,
    searchableColumns,
  })

  return (
    <DataTable
      dataTable={dataTable}
      columns={columns}
      // Render notion like filters
      advancedFilter={false}
      // Render dynamic faceted filters
      filterableColumns={filterableColumns}
      // Render dynamic searchable filters
      searchableColumns={searchableColumns}
      // Render floating action controls at the bottom of the table on Row selection
      // floatingBarContent={TasksTableFloatingBarContent(dataTable)}
      // Delete selected rows
      deleteRowsAction={(event) => deleteSelectedRows(dataTable, event)}
    />
  )
}
