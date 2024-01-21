"use client"

import * as React from "react"
import { type Task } from "@/db/schema"
import { type ColumnDef } from "@tanstack/react-table"

import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"

import { type getTasks } from "../_lib/queries"
import {
  deleteSelectedRows,
  TasksTableFloatingBarContent,
} from "./tasks-table-actions"
import {
  fetchTasksTableColumnDefs,
  filterableColumns,
  searchableColumns,
} from "./tasks-table-column-def"

interface TasksTableProps {
  tasksPromise: ReturnType<typeof getTasks>
}

export function TasksTable({ tasksPromise }: TasksTableProps) {
  // Learn more about React.use here: https://react.dev/reference/react/use
  const { data, pageCount } = React.use(tasksPromise)

  const [isPending, startTransition] = React.useTransition()

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<Task, unknown>[]>(
    () => fetchTasksTableColumnDefs(isPending, startTransition),
    [isPending]
  )

  const { dataTable } = useDataTable({
    data,
    columns,
    pageCount,
    searchableColumns,
    filterableColumns,
  })

  return (
    <DataTable
      dataTable={dataTable}
      columns={columns}
      searchableColumns={searchableColumns}
      filterableColumns={filterableColumns}
      floatingBarContent={TasksTableFloatingBarContent(dataTable)}
      deleteRowsAction={(event) => deleteSelectedRows(dataTable, event)}
    />
  )
}
