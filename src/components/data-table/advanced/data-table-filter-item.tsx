import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { DataTableFilterOption } from "@/types"
import { TrashIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"

import { dataTableConfig } from "@/config/data-table"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { DataTableAdvancedFacetedFilter } from "./data-table-advanced-faceted-filter"

interface DataTableFilterItemProps<TData> {
  table: Table<TData>
  selectedOption: DataTableFilterOption<TData>
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<DataTableFilterOption<TData>[]>
  >
  defaultOpen: boolean
}

export function DataTableFilterItem<TData>({
  table,
  selectedOption,
  setSelectedOptions,
  defaultOpen,
}: DataTableFilterItemProps<TData>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = React.useState("")
  const debounceValue = useDebounce(value, 500)
  const [open, setOpen] = React.useState(defaultOpen)

  const selectedValues = new Set(
    table.getColumn(String(selectedOption.value))?.getFilterValue() as string[]
  )
  const selectedItems = Array.from(selectedValues)

  const operators =
    selectedOption.items.length > 0
      ? dataTableConfig.operators.selectables
      : dataTableConfig.operators.comparison

  const [selectedOperator, setSelectedOperator] = React.useState(operators[0])

  // Create query string
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }

      return newSearchParams.toString()
    },
    [searchParams]
  )

  React.useEffect(() => {
    if (debounceValue) {
      const filterValue = `${debounceValue}~${selectedOperator?.value}`

      router.push(
        `${pathname}?${createQueryString({
          [selectedOption.value]: filterValue,
        })}`
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceValue, selectedOperator?.value, selectedOption.value])

  function updateSelectedValues(values: string[]) {
    const filterValue = `${values.join(".")}~${selectedOperator?.value}`

    router.push(
      `${pathname}?${createQueryString({
        [selectedOption.value]: filterValue,
      })}`
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 truncate rounded-full",
            (selectedItems.length > 0 || value.length > 0) && "bg-muted/50"
          )}
        >
          {value.length > 0 || selectedItems.length > 0 ? (
            <>
              <span className="font-medium capitalize">
                {selectedOption.label}:
              </span>
              {selectedItems.length > 0 ? (
                <span className="ml-1">
                  {selectedItems.length > 2
                    ? `${selectedItems.length} selected`
                    : selectedItems.join(", ")}
                </span>
              ) : (
                <span className="ml-1">{value}</span>
              )}
            </>
          ) : (
            <span className="capitalize">{selectedOption.label}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 space-y-1.5 p-2" align="start">
        <div className="flex items-center space-x-1 pl-1 pr-0.5">
          <div className="flex flex-1 items-center space-x-1">
            <div className="text-xs capitalize text-muted-foreground">
              {selectedOption.label}
            </div>
            <Select
              onValueChange={(value) =>
                setSelectedOperator(operators.find((c) => c.value === value))
              }
            >
              <SelectTrigger className="h-auto w-fit truncate border-none px-2 py-0.5 text-xs hover:bg-muted/50">
                <SelectValue placeholder={selectedOperator?.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {operators.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                      className="py-1"
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button
            aria-label="Remove filter"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            onClick={() => {
              setSelectedOptions((prev) =>
                prev.filter((item) => item.id !== selectedOption.id)
              )

              selectedValues.clear()

              router.push(
                `${pathname}?${createQueryString({
                  [selectedOption.value]: null,
                })}`
              )
            }}
          >
            <TrashIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
        {selectedOption.items.length > 0 ? (
          table.getColumn(
            selectedOption.value ? String(selectedOption.value) : ""
          ) && (
            <DataTableAdvancedFacetedFilter
              key={String(selectedOption.value)}
              column={table.getColumn(
                selectedOption.value ? String(selectedOption.value) : ""
              )}
              title={selectedOption.label}
              options={selectedOption.items}
              selectedValues={selectedValues}
              updateSelectedValues={updateSelectedValues}
            />
          )
        ) : (
          <Input
            placeholder="Type here..."
            className="h-8"
            defaultValue={value}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoFocus
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
