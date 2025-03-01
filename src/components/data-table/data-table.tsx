import { type Table as TanstackTable, flexRender } from "@tanstack/react-table";
import * as React from "react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCommonPinningStyles } from "@/lib/data-table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type TanstackTable<TData>
   */
  table: TanstackTable<TData>;

  /**
   * The floating bar to render at the bottom of the table on row selection.
   * @default null
   * @type React.ReactNode | null
   * @example floatingBar={<TasksTableFloatingBar table={table} />}
   */
  floatingBar?: React.ReactNode | null;

  /**
   * Reference to the table container div element for column resizing.
   * @type React.RefObject<HTMLDivElement> | null
   */
  tableContainerRef?: React.RefObject<HTMLDivElement | null> | null;

  /**
   * Function to get column size CSS variables for the table.
   * @type (table: TanstackTable<TData>) => Record<string, string>
   */
  getColumnSizeVars?: (table: TanstackTable<TData>) => Record<string, string>;

  /**
   * Width of the container for the table.
   * @type number
   */
  containerWidth?: number;

  /**
   * Whether to enable resizing for the table.
   * @default false
   * @type boolean
   */
  enableResizing?: boolean;
}

// Generic type for TableBodyContent component
interface TableBodyContentProps<T> {
  table: TanstackTable<T>;
}

function TableBodyContent<T>({ table }: TableBodyContentProps<T>) {
  return (
    <>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                style={{
                  ...getCommonPinningStyles({ column: cell.column }),
                  // Apply column sizing styles for all columns
                  width: `var(--col-${cell.column.id}-size, auto)`,
                  minWidth: `var(--col-${cell.column.id}-size, auto)`,
                  maxWidth: `var(--col-${cell.column.id}-size, auto)`,
                }}
                className="overflow-hidden"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell
            colSpan={table.getAllColumns().length}
            className="h-24 text-center"
          >
            No results.
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// Memoized table body for better performance during resizing
const MemoizedTableBody = React.memo(
  TableBodyContent,
  (prev, next) => prev.table.options.data === next.table.options.data
) as typeof TableBodyContent;

export function DataTable<TData>({
  table,
  floatingBar = null,
  tableContainerRef = null,
  getColumnSizeVars = () => ({}),
  containerWidth = 0,
  enableResizing = false,
  children,
  className,
  ...props
}: DataTableProps<TData>) {
  // Calculate column size variables for CSS
  const columnSizeVars = React.useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: string } = {};

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      // Set default sizes even when resizing is not enabled
      const size = header.getSize();
      colSizes[`--header-${header.id}-size`] = `${size}px`;
      colSizes[`--col-${header.column.id}-size`] = `${size}px`;
    }

    return colSizes;
  }, [table, table.getState().columnSizingInfo, table.getState().columnSizing]);

  // Get table total size safely for resizing
  const totalSize = React.useMemo(() => {
    if (
      enableResizing &&
      containerWidth &&
      typeof table.getTotalSize === "function"
    ) {
      return table.getTotalSize();
    }
    return null;
  }, [enableResizing, containerWidth, table]);

  return (
    <div className={cn("w-full space-y-2.5", className)} {...props}>
      {children}

      <div className="border rounded-md flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto" ref={tableContainerRef}>
          <Table
            className={cn(enableResizing ? "w-auto table-auto" : "w-full")}
            style={{
              ...columnSizeVars,
              width: tableContainerRef?.current?.clientWidth
                ? `${table.getTotalSize()}px`
                : "100%",
            }}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          ...getCommonPinningStyles({ column: header.column }),
                          // Apply sizing styles to all headers
                          width: `var(--header-${header.id}-size, auto)`,
                          maxWidth: `var(--header-${header.id}-size, auto)`,
                          position: "relative",
                        }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center px-3 py-1.5 overflow-hidden">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </div>

                        {/* Add resize handle when resizing is enabled */}
                        {enableResizing &&
                          header.column.getCanResize() &&
                          index < headerGroup.headers.length && (
                            <div
                              onDoubleClick={() => header.column.resetSize()}
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={cn(
                                "absolute right-0 top-0 h-full w-4 cursor-col-resize select-none touch-none z-10 -translate-x-1/2",
                                "after:content-[''] after:absolute after:right-[50%] after:top-[15%] after:h-[70%] after:w-[1px] after:transition-colors",
                                header.column.getIsResizing()
                                  ? "after:bg-primary"
                                  : "after:bg-border/60 hover:after:bg-border"
                              )}
                            />
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {enableResizing &&
              table.getState().columnSizingInfo?.isResizingColumn ? (
                <MemoizedTableBody table={table} />
              ) : (
                <TableBodyContent table={table} />
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
      </div>
    </div>
  );
}
