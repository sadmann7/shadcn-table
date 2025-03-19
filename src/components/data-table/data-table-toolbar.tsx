"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import * as React from "react";

import { DataTableDatePicker } from "@/components/data-table/data-table-date-picker";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table],
  );

  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
  }, [table]);

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
      <div className="flex flex-1 items-center gap-2 p-0.5">
        {columns.map((column) =>
          column.columnDef.meta?.variant === "text" ? (
            <Input
              key={column.id}
              placeholder={column.columnDef.meta.label}
              value={column.getFilterValue() as string}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className="h-8 w-40 lg:w-64"
            />
          ) : column.columnDef.meta?.variant === "date" ||
            column.columnDef.meta?.variant === "date-range" ? (
            <DataTableDatePicker
              key={column.id}
              column={column}
              multiple={column.columnDef.meta?.variant === "date-range"}
            />
          ) : (
            (column.columnDef.meta?.variant === "select" ||
              column.columnDef.meta?.variant === "multi-select") && (
              <DataTableFacetedFilter
                key={column.id}
                column={column}
                title={column.columnDef.meta?.label ?? column.id}
                options={column.columnDef.meta?.options ?? []}
                multiple={column.columnDef.meta?.variant === "multi-select"}
              />
            )
          ),
        )}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={onReset}
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
