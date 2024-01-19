"use client"

import * as React from "react"
import { type Task } from "@/db/schema"
import { type SearchParams } from "@/types"
import { type ColumnDef, type ColumnFiltersState } from "@tanstack/react-table"

import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"

import { type TasksPromise } from "../_lib/fetchers"
import {
  deleteSelectedRows,
  TasksTableFloatingBarContent,
} from "./tasks-table-actions"
import {
  fetchTasksTableColumnDefs,
  filterableColumns,
  searchableColumns,
} from "./tasks-table-column-def"

interface TasksTableShellProps {
  tasksPromise: TasksPromise
  searchParams: SearchParams
}

export function TasksTableShell({
  tasksPromise,
  searchParams,
}: TasksTableShellProps) {
  // Learn more about React.use here: https://react.dev/reference/react/use
  const { data, pageCount } = React.use(tasksPromise)

  const [isPending, startTransition] = React.useTransition()

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<Task, unknown>[]>(
    () => fetchTasksTableColumnDefs(isPending, startTransition),
    [isPending]
  )

  const initialColumnFilters = Object.entries(searchParams)
    .map(([columnName, columnValue]) => {
      if (!["page", "perPage", "sort"].includes(columnName) && columnValue) {
        const parsedValue =
          typeof columnValue === "string" && columnValue.includes(".")
            ? columnValue.split(".")
            : columnValue
        return { id: columnName, value: parsedValue }
      }
    })
    .filter((ele) => !!ele) as ColumnFiltersState

  const { dataTable } = useDataTable({
    data,
    columns,
    pageCount,
    searchableColumns,
    filterableColumns,
    initialColumnFilters,
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
