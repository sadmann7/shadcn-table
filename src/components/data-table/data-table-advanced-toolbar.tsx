"use client";

import type { DataTableAdvancedFilterField } from "@/types";
import type { Table } from "@tanstack/react-table";
import type * as React from "react";

import { DataTableFilterList } from "@/components/data-table/data-table-filter-list";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { cn } from "@/lib/utils";

interface DataTableAdvancedToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  filterFields: DataTableAdvancedFilterField<TData>[];
  debounceMs?: number;
  shallow?: boolean;
}

export function DataTableAdvancedToolbar<TData>({
  table,
  debounceMs = 300,
  shallow = true,
  children,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        "flex w-full items-center justify-between gap-2 overflow-auto",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <DataTableFilterList
          table={table}
          debounceMs={debounceMs}
          shallow={shallow}
        />
        <DataTableSortList table={table} />
      </div>
      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
