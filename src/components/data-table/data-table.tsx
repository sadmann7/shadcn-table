import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from "@/types";
import * as React from "react";

import {
  flexRender,
  type Table as TanstackTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTableAdvancedToolbar } from "./advanced/data-table-advanced-toolbar";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableFloatingBar } from "./data-table-floating-bar";
import { DataTableToolbar } from "./data-table-toolbar";

interface DataTableProps<TData extends { uid: number }, TValue> {
  dataTable: TanstackTable<TData>
  columns: ColumnDef<TData, TValue>[]
  filterableColumns?: DataTableFilterableColumn<TData>[]
  searchableColumns?: DataTableSearchableColumn<TData>[]
  advancedFilter?: boolean
  floatingBar?: boolean
  selectedActionControls: React.ReactNode;
  deleteRowsAction: React.MouseEventHandler<HTMLButtonElement>
}

export function DataTable<TData extends { uid: number }, TValue>({
  dataTable,
  columns,
  filterableColumns = [],
  searchableColumns = [],
  advancedFilter = false,
  floatingBar = false,
  selectedActionControls,
  deleteRowsAction,
}: DataTableProps<TData, TValue>) {

  return (
    <div className="w-full space-y-2.5 overflow-auto">
      {advancedFilter ? (
        <DataTableAdvancedToolbar
          dataTable={dataTable}
          filterableColumns={filterableColumns}
          searchableColumns={searchableColumns}
        />
      ) : (
        <DataTableToolbar
          table={dataTable}
          filterableColumns={filterableColumns}
          searchableColumns={searchableColumns}
          deleteRowsAction={floatingBar ? undefined :  deleteRowsAction}
        />
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {dataTable.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {dataTable.getRowModel().rows?.length ? (
              dataTable.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-2.5">
        <DataTablePagination table={dataTable} />
        {floatingBar ? (
          <DataTableFloatingBar table={dataTable}>{selectedActionControls}</DataTableFloatingBar>
        ) : null}
      </div>
    </div>
  )
}
