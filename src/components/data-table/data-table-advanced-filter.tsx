"use client"

import * as React from "react"
import type {
  DataTableFilterableColumn,
  DataTableFilterOption,
  DataTableSearchableColumn,
} from "@/types"
import { CaretSortIcon, CheckIcon, PlusIcon } from "@radix-ui/react-icons"

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
  filterableColumns?: DataTableFilterableColumn<TData>[]
  searchableColumns?: DataTableSearchableColumn<TData>[]
  selectedOptions: DataTableFilterOption<TData>[]
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<DataTableFilterOption<TData>[]>
  >
  advancedFilterMenuOpen: boolean
  setAdvancedFilterMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
  isSwitchable?: boolean
}

export function DataTableAdvancedFilter<TData>({
  filterableColumns = [],
  searchableColumns = [],
  selectedOptions,
  setSelectedOptions,
  advancedFilterMenuOpen,
  setAdvancedFilterMenuOpen,
  isSwitchable = false,
}: DataTableAdvancedFilterProps<TData>) {
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
    <>
      {isSwitchable ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAdvancedFilterMenuOpen(!advancedFilterMenuOpen)}
        >
          Filter
          <CaretSortIcon
            className="ml-2 h-4 w-4 opacity-50"
            aria-hidden="true"
          />
        </Button>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            {advancedFilterMenuOpen ? (
              options.filter(
                (option) =>
                  !selectedOptions.find((item) => item.value === option.value)
              ).length > 0 ? (
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
              ) : null
            ) : (
              <Button variant="outline" size="sm" role="combobox">
                Filter
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Filter by..." />
              <CommandEmpty>No item found.</CommandEmpty>
              <CommandGroup>
                {options
                  .filter(
                    (option) =>
                      !selectedOptions.find(
                        (item) => item.value === option.value
                      )
                  )
                  .map((option) => (
                    <CommandItem
                      key={String(option.value)}
                      className="capitalize"
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue)
                        setOpen(false)
                        setAdvancedFilterMenuOpen(
                          selectedOptions.length > 0
                            ? true
                            : !advancedFilterMenuOpen
                        )
                        setSelectedOptions?.((prev) => {
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
                        aria-hidden="true"
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </>
  )
}
