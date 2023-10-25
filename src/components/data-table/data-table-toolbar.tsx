"use client"

import * as React from "react"
import type {
  DataTableFilterableColumn,
  DataTableFilterOption,
  DataTableSearchableColumn,
} from "@/types"
import { CaretSortIcon, Cross2Icon, PlusIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableAdvancedFilter } from "@/components/data-table/data-table-advanced-filter"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

import { DataTableAdvancedFilterItem } from "./data-table-advanced-filter-item"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchableColumns?: DataTableSearchableColumn<TData>[]
  filterableColumns?: DataTableFilterableColumn<TData>[]
  advancedFilter?: boolean
}

export function DataTableToolbar<TData>({
  table,
  filterableColumns = [],
  searchableColumns = [],
  advancedFilter = false,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [selectedOptions, setSelectedOptions] = React.useState<
    DataTableFilterOption<TData>[]
  >([])
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (selectedOptions.length > 0) {
      setOpen(true)
    }
  }, [selectedOptions])

  const options: DataTableFilterOption<TData>[] = React.useMemo(() => {
    const searchableOptions = searchableColumns.map((column) => ({
      label: String(column.id),
      value: column.id,
      items: [],
    }))
    const filterableOptions = filterableColumns.map((column) => ({
      label: column.title,
      value: column.id,
      items: column.options,
    }))

    return [...searchableOptions, ...filterableOptions]
  }, [filterableColumns, searchableColumns])

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
          {!advancedFilter &&
            filterableColumns.length > 0 &&
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
          {!advancedFilter && isFiltered && (
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
          {advancedFilter ? (
            selectedOptions.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen((prev) => !prev)}
              >
                Filter
                <CaretSortIcon
                  className="ml-2 h-4 w-4 opacity-50"
                  aria-hidden="true"
                />
              </Button>
            ) : (
              <DataTableAdvancedFilter
                options={options.filter(
                  (option) =>
                    !selectedOptions.some(
                      (selectedOption) => selectedOption.value === option.value
                    )
                )}
                setSelectedOptions={setSelectedOptions}
              />
            )
          ) : null}
          <DataTableViewOptions table={table} />
        </div>
      </div>
      {advancedFilter && open ? (
        <div className="flex items-center space-x-2">
          {selectedOptions.map((selectedOption) => (
            <DataTableAdvancedFilterItem
              key={crypto.randomUUID()}
              table={table}
              selectedOption={selectedOption}
              setSelectedOptions={setSelectedOptions}
            />
          ))}
          <DataTableAdvancedFilter
            options={options}
            setSelectedOptions={setSelectedOptions}
          >
            <Button
              variant="outline"
              size="sm"
              role="combobox"
              className="rounded-full"
            >
              <PlusIcon
                className="mr-2 h-4 w-4 opacity-50"
                aria-hidden="true"
              />
              Add filter
            </Button>
          </DataTableAdvancedFilter>
        </div>
      ) : null}
    </div>
  )
}
