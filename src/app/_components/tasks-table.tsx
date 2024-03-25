"use client"

import * as React from "react"
import { type Task } from "@/db/schema"
import { type ColumnDef } from "@tanstack/react-table"

import { useDataTable } from "@/hooks/use-data-table"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DataTable } from "@/components/data-table/data-table"

import { deleteTasks } from "../_lib/mutations"
import { type getTasks } from "../_lib/queries"
import {
  filterableColumns,
  getColumns,
  searchableColumns,
} from "./tasks-table-columns"
import { TasksTableFloatingBar } from "./tasks-table-floating-bar"

interface TasksTableProps {
  tasksPromise: ReturnType<typeof getTasks>
}

export function TasksTable({ tasksPromise }: TasksTableProps) {
  // Learn more about React.use here: https://react.dev/reference/react/use
  const { data, pageCount } = React.use(tasksPromise)

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<Task, unknown>[]>(
    () => getColumns(),
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
  const [showAdvancedFilter, setShowAdvancedFilter] = React.useState(false)
  const [showFloatingBar, setShowFloatingBar] = React.useState(false)

  return (
    <div className="space-y-4 overflow-hidden">
      <div className="flex w-fit items-center justify-center space-x-4 overflow-x-auto rounded-md border p-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={`show-advanced-filter-${id}`}
            checked={showAdvancedFilter}
            onCheckedChange={setShowAdvancedFilter}
          />
          <Label htmlFor={`show-advanced-filter-${id}`}>Advanced filter</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id={`show-floating-bar-${id}`}
            checked={!!showFloatingBar}
            onCheckedChange={setShowFloatingBar}
          />
          <Label htmlFor={`show-floating-bar-${id}`}>Floating bar</Label>
        </div>
      </div>
      <DataTable
        table={table}
        columns={columns}
        searchableColumns={searchableColumns}
        filterableColumns={filterableColumns}
        advancedFilter={showAdvancedFilter}
        floatingBar={
          showFloatingBar ? <TasksTableFloatingBar table={table} /> : null
        }
        deleteRowsAction={() =>
          deleteTasks({ rows: table.getFilteredSelectedRowModel().rows })
        }
      />
    </div>
  )
}
