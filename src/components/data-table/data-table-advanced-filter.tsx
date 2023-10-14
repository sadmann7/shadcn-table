"use client"

import * as React from "react"
import type {
  DataTableFilterableColumn,
  DataTableFilterOption,
  DataTableSearchableColumn,
} from "@/types"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DataTableAdvancedFilterProps<TData> {
  table: Table<TData>
  filterableColumns?: DataTableFilterableColumn<TData>[]
  searchableColumns?: DataTableSearchableColumn<TData>[]
  setSelectedOptions?: React.Dispatch<
    React.SetStateAction<DataTableFilterOption<TData>[]>
  >
}

export function DataTableAdvancedFilter<TData>({
  table,
  filterableColumns = [],
  searchableColumns = [],
  setSelectedOptions,
}: DataTableAdvancedFilterProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const [value, setValue] = React.useState("")
  const [open, setOpen] = React.useState(false)

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
  }, [searchableColumns, filterableColumns])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" role="combobox">
          Filter
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Filter by..." />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={String(option.value)}
                className="capitalize"
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue)
                  setOpen(false)
                  setSelectedOptions?.((prev) => {
                    if (currentValue === value) {
                      return prev.filter((item) => item.value !== option.value)
                    } else {
                      return [...prev, option]
                    }
                  })
                }}
              >
                {option.label}
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden="true"
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
