"use client"

import * as React from "react"
import type {
  DataTableFilterableColumn,
  DataTableFilterOptions,
  DataTableSearchableColumn,
} from "@/types"
import { Cross2Icon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableCombinedFilter } from "@/components/data-table/data-table-combined-filter"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

import { DataTableCombinedFilterItem } from "./data-table-combined-filter-item"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterableColumns?: DataTableFilterableColumn<TData>[]
  searchableColumns?: DataTableSearchableColumn<TData>[]
  combinedFilterOptions?: DataTableFilterOptions<TData>[]
}

export function DataTableToolbar<TData>({
  table,
  filterableColumns = [],
  searchableColumns = [],
  combinedFilterOptions = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [selectedOptions, setSelectedOptions] = React.useState<
    DataTableFilterOptions<TData>[]
  >([])

  return (
    <div className="w-full space-y-2.5 overflow-auto p-1">
      <div className="flex items-center justify-between space-x-2">
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
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <DataTableCombinedFilter
            table={table}
            options={combinedFilterOptions}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
          />
          <DataTableViewOptions table={table} />
        </div>
      </div>
      {selectedOptions.length > 0 ? (
        <div className="flex items-center space-x-2">
          {selectedOptions.map((option) => (
            <DataTableCombinedFilterItem
              key={String(option.value)}
              option={option}
              setSelectedOptions={setSelectedOptions}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
