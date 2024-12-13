"use client"

import * as React from "react"
import type { DataTableAdvancedFilterField } from "@/types"
import { type Table } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

interface DataTableAdvancedToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type Table<TData>
   */
  table: Table<TData>

  /**
   * An array of filter field configurations for the data table.
   * @type DataTableAdvancedFilterField<TData>[]
   * @example
   * const filterFields = [
   *   {
   *     id: 'name',
   *     label: 'Name',
   *     type: 'text',
   *     placeholder: 'Filter by name...'
   *   },
   *   {
   *     id: 'status',
   *     label: 'Status',
   *     type: 'select',
   *     options: [
   *       { label: 'Active', value: 'active', count: 10 },
   *       { label: 'Inactive', value: 'inactive', count: 5 }
   *     ]
   *   }
   * ]
   */
  filterFields: DataTableAdvancedFilterField<TData>[]

  /**
   * Debounce time (ms) for filter updates to enhance performance during rapid input.
   * @default 300
   */
  debounceMs?: number

  /**
   * Shallow mode keeps query states client-side, avoiding server calls.
   * Setting to `false` triggers a network request with the updated querystring.
   * @default true
   */
  shallow?: boolean
}

export function DataTableAdvancedToolbar<TData>({
  table,
  filterFields = [],
  debounceMs = 300,
  shallow = true,
  children,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2 overflow-auto p-1",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <DataTableFilterList
          table={table}
          filterFields={filterFields}
          debounceMs={debounceMs}
          shallow={shallow}
        />
        <DataTableSortList
          table={table}
          debounceMs={debounceMs}
          shallow={shallow}
        />
      </div>
      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
