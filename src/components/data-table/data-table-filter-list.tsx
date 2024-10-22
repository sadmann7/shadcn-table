"use client"

import * as React from "react"
import type { FilterColumn, FilterCondition } from "@/types"
import { CalendarIcon, CaretSortIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"

import { dataTableConfig } from "@/config/data-table"
import { getDefaultFilterOperator, getFilterOperators } from "@/lib/data-table"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FacetedFilter } from "@/components/faceted-filter"
import { Icons } from "@/components/icons"

interface DataTableFilterListProps<TData> {
  filterColumns: FilterColumn<TData>[]
  onFilterChange: (filters: FilterCondition<TData>[]) => void
}

export function DataTableFilterList<TData>({
  filterColumns,
  onFilterChange,
}: DataTableFilterListProps<TData>) {
  const [filters, setFilters] = React.useState<FilterCondition<TData>[]>([])

  function addFilter() {
    const firstColumn = filterColumns[0]
    if (firstColumn) {
      const newFilter: FilterCondition<TData> = {
        id: firstColumn.id,
        value: "",
        type: firstColumn.type,
        operator: getDefaultFilterOperator(firstColumn.type),
        joinOperator: "and",
        options: firstColumn.options,
      }
      setFilters([...filters, newFilter])
    }
  }

  function updateFilter(index: number, field: Partial<FilterCondition<TData>>) {
    const updatedFilters = [...filters]
    updatedFilters[index] = {
      ...updatedFilters[index],
      ...field,
    } as FilterCondition<TData>
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  function removeFilter(index: number) {
    const updatedFilters = filters.filter((_, i) => i !== index)
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  function renderFilterInput(filter: FilterCondition<TData>, index: number) {
    const filterColumn = filterColumns.find((col) => col.id === filter.id)

    switch (filter.type) {
      case "text":
      case "number":
        return (
          <Input
            type={filter.type}
            value={filter.value as string}
            placeholder={filterColumn?.placeholder}
            className="h-8 w-full rounded bg-transparent"
            onChange={(e) => updateFilter(index, { value: e.target.value })}
          />
        )
      case "select":
        return (
          <Select
            value={filter.value as string}
            onValueChange={(value) => updateFilter(index, { value })}
          >
            <SelectTrigger className="h-8 w-full rounded bg-transparent">
              <SelectValue placeholder={filterColumn?.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "multi-select":
        return (
          <FacetedFilter
            options={filter.options ?? []}
            value={Array.isArray(filter.value) ? filter.value : []}
            onValueChange={(value) => updateFilter(index, { value })}
            contentWidth={200}
            placeholder={filterColumn?.label}
            className="w-full rounded text-muted-foreground hover:text-muted-foreground"
          >
            Select an option
            <CaretSortIcon className="size-4" />
          </FacetedFilter>
        )
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filter.value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 size-4" aria-hidden="true" />
                {filter.value ? (
                  format(new Date(filter.value as string), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={
                  filter.value ? new Date(filter.value as string) : undefined
                }
                onSelect={(date) =>
                  updateFilter(index, { value: date ? date.toISOString() : "" })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )
      case "boolean":
        return (
          <Select
            value={filter.value as string}
            onValueChange={(value) => updateFilter(index, { value })}
          >
            <SelectTrigger className="h-8 w-full rounded bg-transparent">
              <SelectValue placeholder="True" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        )
      default:
        return null
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Icons.listFilter className="mr-2 size-4" aria-hidden="true" />
          Filters
          {filters.length > 0 && (
            <Badge variant="secondary" className="ml-2 rounded-sm">
              {filters.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[36rem] p-0" align="start">
        <div className="flex flex-col gap-4 p-4">
          <h4 className="font-medium leading-none">Filters</h4>
          <div className="flex flex-col gap-2">
            {filters.map((filter, index) => (
              <div key={index} className="flex items-center gap-2">
                {index === 0 ? (
                  <span className="w-20 text-center text-sm text-muted-foreground">
                    Where
                  </span>
                ) : (
                  <Select
                    value={filter.joinOperator}
                    onValueChange={(value) =>
                      updateFilter(index, { joinOperator: value })
                    }
                  >
                    <SelectTrigger className="h-8 w-20 rounded lowercase">
                      <SelectValue placeholder={filter.joinOperator} />
                    </SelectTrigger>
                    <SelectContent className="min-w-[var(--radix-select-trigger-width)] lowercase">
                      {dataTableConfig.joinOperators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select
                  value={filter.id as string}
                  onValueChange={(value) => {
                    const column = filterColumns.find((col) => col.id === value)

                    if (column) {
                      updateFilter(index, {
                        id: value as keyof TData,
                        type: column.type,
                        operator: getDefaultFilterOperator(column.type),
                        options: column.options,
                      })
                    }
                  }}
                >
                  <SelectTrigger className="h-8 w-32 rounded">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filterColumns.map((col) => (
                      <SelectItem
                        key={col.id as string}
                        value={col.id as string}
                      >
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filter.operator}
                  onValueChange={(value) =>
                    updateFilter(index, { operator: value })
                  }
                >
                  <SelectTrigger className="h-8 w-32 rounded">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilterOperators(filter.type).map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1">{renderFilterInput(filter, index)}</div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeFilter(index)}
                  className="size-8 shrink-0 rounded"
                >
                  <Icons.trash className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button size="sm" onClick={addFilter} className="mt-2 rounded">
              Add Filter
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}