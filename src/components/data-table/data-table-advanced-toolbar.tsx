"use client"

import * as React from "react"
import type { DataTableAdvancedFilterField, FilterCondition } from "@/types"
import { Cross2Icon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

interface DataTableAdvancedToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>
  filterFields?: DataTableAdvancedFilterField<TData>[]
  filters?: FilterCondition<TData>[]
  onFiltersChange?: (filters: FilterCondition<TData>[]) => void
}

export function DataTableAdvancedToolbar<TData>({
  table,
  filterFields = [],
  filters,
  onFiltersChange,
  children,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between space-x-2 overflow-auto p-1",
        className
      )}
      {...props}
    >
      <DataTableFilterList
        filterFields={filterFields}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
      <div className="flex flex-1 items-center space-x-2">
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <Cross2Icon className="ml-2 size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
