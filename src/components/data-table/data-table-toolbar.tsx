"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import * as React from "react";

import { DataTableDatePicker } from "@/components/data-table/data-table-date-picker";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableRangeFilter } from "@/components/data-table/data-table-range-filter";
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

  console.log({
    columnIds: columns.map((column) => column.id),
    columnDefs: columns.map((column) => column.columnDef),
  });

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
        {columns.map((column) => {
          const columnMeta = column.columnDef.meta;

          return columnMeta?.variant === "text" ||
            columnMeta?.variant === "number" ? (
            <Input
              key={column.id}
              type={columnMeta?.variant}
              placeholder={columnMeta?.placeholder ?? columnMeta?.label}
              value={column.getFilterValue() as string}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className="h-8 w-40 lg:w-56"
            />
          ) : columnMeta?.variant === "date" ||
            columnMeta?.variant === "date-range" ? (
            <DataTableDatePicker
              key={column.id}
              column={column}
              multiple={columnMeta?.variant === "date-range"}
            />
          ) : columnMeta?.variant === "range" ? (
            <DataTableRangeFilter
              key={column.id}
              column={column}
              title={columnMeta?.label ?? column.id}
            />
          ) : (
            (columnMeta?.variant === "select" ||
              columnMeta?.variant === "multi-select") && (
              <DataTableFacetedFilter
                key={column.id}
                column={column}
                title={columnMeta?.label ?? column.id}
                options={columnMeta?.options ?? []}
                multiple={columnMeta?.variant === "multi-select"}
              />
            )
          );
        })}
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
