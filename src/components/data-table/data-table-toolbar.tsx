"use client"

import * as React from "react"
import Link from "next/link"
import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from "@/types"
import { Cross2Icon, PlusCircledIcon, TrashIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterableColumns?: DataTableFilterableColumn<TData>[]
  searchableColumns?: DataTableSearchableColumn<TData>[]
  newRowLink?: string
  deleteRowsAction?: React.MouseEventHandler<HTMLButtonElement>
}

export function DataTableToolbar<TData>({
  table,
  filterableColumns = [],
  searchableColumns = [],
  newRowLink,
  deleteRowsAction,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [isDeletePending, startDeleteTransition] = React.useTransition()

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
      <div className="flex flex-1 items-center space-x-2">
        {searchableColumns.length > 0 &&
          searchableColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : "") && (
                <Input
                  key={String(column.id)}
                  placeholder={`Filter ${column.title}...`}
                  value={
                    (table
                      .getColumn(String(column.id))
                      ?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn(String(column.id))
                      ?.setFilterValue(event.target.value)
                  }
                  className="h-8 w-[150px] lg:w-[250px]"
                />
              )
          )}
        {filterableColumns.length > 0 &&
          filterableColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : "") && (
                <DataTableFacetedFilter
                  key={String(column.id)}
                  column={table.getColumn(column.id ? String(column.id) : "")}
                  title={column.title}
                  options={column.options}
                />
              )
          )}
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
      <div className="flex items-center space-x-2">
        {deleteRowsAction && table.getSelectedRowModel().rows.length > 0 ? (
          <Button
            aria-label="Delete selected rows"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={(event) => {
              startDeleteTransition(() => {
                table.toggleAllPageRowsSelected(false)
                deleteRowsAction(event)
              })
            }}
            disabled={isDeletePending}
          >
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Delete
          </Button>
        ) : newRowLink ? (
          <Link
            aria-label="Create new row"
            href={newRowLink}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "sm",
                className: "h-8",
              })
            )}
          >
            <PlusCircledIcon className="mr-2 size-4" aria-hidden="true" />
            New
          </Link>
        ) : null}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
