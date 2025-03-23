"use client";

import type { Table } from "@tanstack/react-table";
import type * as React from "react";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { cn } from "@/lib/utils";

interface DataTableAdvancedToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
}

export function DataTableAdvancedToolbar<TData>({
  table,
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
      <div className="flex items-center gap-2">{children}</div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
