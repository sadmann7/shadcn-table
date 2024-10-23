"use client"

import * as React from "react"
import type { DataTableAdvancedFilterField } from "@/types"
import type { Table } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

interface DataTableAdvancedToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>
  filterFields?: DataTableAdvancedFilterField<TData>[]
}

export function DataTableAdvancedToolbar<TData>({
  table,
  filterFields = [],
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
      <DataTableFilterList filterFields={filterFields} />
      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
