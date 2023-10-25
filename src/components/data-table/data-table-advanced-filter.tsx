"use client"

import * as React from "react"
import type { DataTableFilterOption } from "@/types"
import { CaretSortIcon, ChevronDownIcon, TextIcon } from "@radix-ui/react-icons"

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
  options: DataTableFilterOption<TData>[]
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<DataTableFilterOption<TData>[]>
  >
  children?: React.ReactNode
  buttonText?: string
}

export function DataTableAdvancedFilter<TData>({
  options,
  setSelectedOptions,
  children,
  buttonText = "Filter",
}: DataTableAdvancedFilterProps<TData>) {
  const [value, setValue] = React.useState("")
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ?? (
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            className="capitalize"
          >
            {buttonText}
            <CaretSortIcon
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
              aria-hidden="true"
            />
          </Button>
        )}
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
                value={String(option.value)}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue)
                  setOpen(false)
                  setSelectedOptions((prev) => {
                    if (currentValue === value) {
                      return prev.filter((item) => item.value !== option.value)
                    } else {
                      return [...prev, option]
                    }
                  })
                }}
              >
                {option.items.length > 0 ? (
                  <ChevronDownIcon
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                  />
                ) : (
                  <TextIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
