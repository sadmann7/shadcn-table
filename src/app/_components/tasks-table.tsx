"use client"

import * as React from "react"
import { type Task } from "@/db/schema"
import { type ColumnDef } from "@tanstack/react-table"

import { useDataTable } from "@/hooks/use-data-table"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DataTable } from "@/components/data-table/data-table"

import { type getTasks } from "../_lib/queries"
import {
  deleteSelectedRows,
  TasksTableFloatingBarContent,
} from "./tasks-table-actions"
import {
  fetchTasksTableColumnDef,
  filterableColumns,
  searchableColumns,
} from "./tasks-table-column-def"

interface TasksTableProps {
  tasksPromise: ReturnType<typeof getTasks>
}

export function TasksTable({ tasksPromise }: TasksTableProps) {
  // Learn more about React.use here: https://react.dev/reference/react/use
  const { data, pageCount } = React.use(tasksPromise)

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<Task, unknown>[]>(
    () => fetchTasksTableColumnDef(),
    []
  )

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    searchableColumns,
    filterableColumns,
  })

  // Toggling some data-table states for demo
  const id = React.useId()
  const [advancedFilter, setAdvancedFilter] = React.useState(false)
  const [floatingBarContent, setFloatingBarContent] =
    React.useState<React.ReactNode | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex w-fit items-center justify-center space-x-4 rounded-md border p-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={`advanced-filter-${id}`}
            checked={advancedFilter}
            onCheckedChange={setAdvancedFilter}
          />
          <Label htmlFor={`advanced-filter-${id}`}>Advanced filter</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id={`floating-bar-${id}`}
            checked={!!floatingBarContent}
            onCheckedChange={(checked) =>
              setFloatingBarContent(
                checked ? TasksTableFloatingBarContent(table) : null
              )
            }
          />
          <Label htmlFor={`floating-bar-${id}`}>Floating bar</Label>
        </div>
      </div>
      <DataTable
        table={table}
        columns={columns}
        searchableColumns={searchableColumns}
        filterableColumns={filterableColumns}
        advancedFilter={advancedFilter}
        floatingBarContent={floatingBarContent}
        deleteRowsAction={(event) => deleteSelectedRows({ table, event })}
      />
    </div>
  )
}
