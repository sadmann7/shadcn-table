import type { Option } from "@/types"
import { CheckIcon } from "@radix-ui/react-icons"
import { type Column } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

interface DataTableAdvancedFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: Option[]
}

export function DataTableAdvancedFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableAdvancedFacetedFilterProps<TData, TValue>) {
  const selectedValues = new Set(column?.getFilterValue() as string[])

  return (
    <Command className="p-1">
      <CommandInput
        placeholder={title}
        autoFocus
        showIcon={false}
        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      <CommandList className="mt-1">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {options.map((option) => {
            const isSelected = selectedValues.has(option.value)
            return (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  if (isSelected) {
                    selectedValues.delete(option.value)
                  } else {
                    selectedValues.add(option.value)
                  }
                  const filterValues = Array.from(selectedValues)
                  column?.setFilterValue(
                    filterValues.length ? filterValues : undefined
                  )
                }}
              >
                <div
                  className={cn(
                    "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50 [&_svg]:invisible"
                  )}
                >
                  <CheckIcon className={cn("size-4")} aria-hidden="true" />
                </div>
                {option.icon && (
                  <option.icon
                    className="mr-2 size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                <span>{option.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
        {selectedValues.size > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => column?.setFilterValue(undefined)}
                className="justify-center text-center"
              >
                Clear filters
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  )
}
