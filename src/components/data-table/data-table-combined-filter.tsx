"use client"

import * as React from "react"
import type { DataTableFilterOptions } from "@/types"
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

interface DataTableCombinedFilterProps<TData> {
  table: Table<TData>
  options: DataTableFilterOptions<TData>[]
  selectedOptions: DataTableFilterOptions<TData>[]
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<DataTableFilterOptions<TData>[]>
  >
}

export function DataTableCombinedFilter<TData>({
  table,
  options = [],
  selectedOptions,
  setSelectedOptions,
}: DataTableCombinedFilterProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [value, setValue] = React.useState("")
  const [open, setOpen] = React.useState(false)

  return (
    <>
      {selectedOptions.length === 0 ? (
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
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      setOpen(false)
                      setSelectedOptions((prev) => {
                        if (currentValue === value) {
                          return prev.filter(
                            (item) => item.value !== option.value
                          )
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
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      ) : (
        <Button variant="outline" size="sm">
          Filter
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      )}
    </>
  )
}
