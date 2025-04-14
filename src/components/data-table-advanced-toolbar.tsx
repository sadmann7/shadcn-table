"use client";

import type { Table } from "@tanstack/react-table";
import type * as React from "react";
import type { Task } from "@/db/schema";

import { DataTableViewOptions } from "@/components/data-table-view-options";
import { cn } from "@/lib/utils";

interface DataTableAdvancedToolbarProps<TData>
  extends React.ComponentProps<"div"> {
  table: Table<TData>;
  availableColumns: { id: keyof Task; label: string }[];
  selectedColumns: string[];
  onColumnsChange: (newColumns: string[]) => void;
}

export function DataTableAdvancedToolbar<TData>({
  table,
  children,
  className,
  availableColumns,
  selectedColumns,
  onColumnsChange,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        "flex w-full items-start justify-between gap-2 p-1",
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions
          availableColumns={availableColumns}
          selectedColumns={selectedColumns}
          onColumnsChange={onColumnsChange}
        />
      </div>
    </div>
  );
}
