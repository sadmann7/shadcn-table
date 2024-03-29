"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import type {
  DataTableFilterableColumn,
  DataTableFilterOption,
  DataTableSearchableColumn,
} from "@/types"
import { CaretSortIcon, PlusIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DataTableFilterCombobox } from "@/components/data-table/advanced/data-table-filter-combobox"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

import { DataTableFilterItem } from "./data-table-filter-item"
import { DataTableMultiFilter } from "./data-table-multi-filter"

interface DataTableAdvancedToolbarProps<TData> {
  table: Table<TData>
  searchableColumns?: DataTableSearchableColumn<TData>[]
  filterableColumns?: DataTableFilterableColumn<TData>[]
}

export function DataTableAdvancedToolbar<TData>({
  table,
  filterableColumns = [],
  searchableColumns = [],
}: DataTableAdvancedToolbarProps<TData>) {
  const searchParams = useSearchParams()

  const initialSelectedOptions = React.useMemo(() => {
    const selectedOptions: DataTableFilterOption<TData>[] = []

    filterableColumns.forEach((column) => {
      const filterValue = searchParams.get(String(column.id))
      if (filterValue) {
        selectedOptions.push({
          id: crypto.randomUUID(),
          label: column.title,
          value: column.id,
          items: column.options,
        })
      }
    })

    return selectedOptions
  }, [filterableColumns, searchParams])

  const [openMenu, setOpenMenu] = React.useState(false)
  const [selectedOptions, setSelectedOptions] = React.useState<
    DataTableFilterOption<TData>[]
  >(initialSelectedOptions)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (selectedOptions.length > 0) {
      setOpen(true)
    }
  }, [selectedOptions])

  const options: DataTableFilterOption<TData>[] = React.useMemo(() => {
    const searchableOptions = searchableColumns.map((column) => ({
      id: crypto.randomUUID(),
      label: String(column.id),
      value: column.id,
      items: [],
    }))
    const filterableOptions = filterableColumns.map((column) => ({
      id: crypto.randomUUID(),
      label: column.title,
      value: column.id,
      items: column.options,
    }))

    return [...searchableOptions, ...filterableOptions]
  }, [filterableColumns, searchableColumns])

  return (
    <div className="flex w-full flex-col space-y-2.5 overflow-auto p-1">
      <div className="ml-auto flex items-center space-x-2">
        {(options.length > 0 && selectedOptions.length > 0) || open ? (
          <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
            <CaretSortIcon
              className="mr-2 size-4 shrink-0"
              aria-hidden="true"
            />
            Filter
          </Button>
        ) : (
          <DataTableFilterCombobox
            options={options.filter(
              (option) =>
                !selectedOptions.some(
                  (selectedOption) => selectedOption.value === option.value
                )
            )}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            setOpenMenu={setOpenMenu}
          />
        )}
        <DataTableViewOptions table={table} />
      </div>
      <div className={cn("flex items-center gap-2", !open && "hidden")}>
        {selectedOptions
          .filter((option) => !option.isMulti)
          .map((selectedOption) => (
            <DataTableFilterItem
              key={String(selectedOption.value)}
              table={table}
              selectedOption={selectedOption}
              setSelectedOptions={setSelectedOptions}
              defaultOpen={openMenu}
            />
          ))}
        {selectedOptions.some((option) => option.isMulti) ? (
          <DataTableMultiFilter
            table={table}
            allOptions={options}
            options={selectedOptions.filter((option) => option.isMulti)}
            setSelectedOptions={setSelectedOptions}
            defaultOpen={openMenu}
          />
        ) : null}
        {options.length > 0 && options.length > selectedOptions.length ? (
          <DataTableFilterCombobox
            options={options}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            setOpenMenu={setOpenMenu}
          >
            <Button
              variant="outline"
              size="sm"
              role="combobox"
              className="h-7 rounded-full"
              onClick={() => setOpenMenu(true)}
            >
              <PlusIcon className="mr-2 size-4 opacity-50" aria-hidden="true" />
              Add filter
            </Button>
          </DataTableFilterCombobox>
        ) : null}
      </div>
    </div>
  )
}
