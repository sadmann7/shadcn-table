"use client"

import type {
  DataTableAdvancedFilterField,
  FilterCondition,
  JoinOperator,
  Operator,
} from "@/types"
import { CalendarIcon, CaretSortIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { useQueryState } from "nuqs"

import { dataTableConfig } from "@/config/data-table"
import { getDefaultFilterOperator, getFilterOperators } from "@/lib/data-table"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  FacetedFilter,
  FacetedFilterContent,
  FacetedFilterEmpty,
  FacetedFilterGroup,
  FacetedFilterInput,
  FacetedFilterItem,
  FacetedFilterList,
  FacetedFilterTrigger,
} from "@/components/ui/faceted-filter"
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
import { Icons } from "@/components/icons"

interface DataTableFilterListProps<TData> {
  filterFields: DataTableAdvancedFilterField<TData>[]
}

export function DataTableFilterList<TData>({
  filterFields,
}: DataTableFilterListProps<TData>) {
  const [filters, setFilters] = useQueryState<FilterCondition<TData>[]>(
    "filters",
    {
      defaultValue: [],
      parse: (value) => JSON.parse(value) as FilterCondition<TData>[],
      serialize: (value) => JSON.stringify(value),
      eq: (a, b) =>
        a.length === b.length &&
        a.every(
          (filter, index) =>
            filter.id === b[index]?.id && filter.value === b[index]?.value
        ),
      clearOnDefault: true,
    }
  )

  function addFilter() {
    const firstColumn = filterFields[0]
    if (firstColumn) {
      const newFilter: FilterCondition<TData> = {
        id: firstColumn.id,
        value: "",
        type: firstColumn.type,
        operator: getDefaultFilterOperator(firstColumn.type),
        joinOperator: "and",
      }
      void setFilters([...filters, newFilter])
    }
  }

  function updateFilter(index: number, field: Partial<FilterCondition<TData>>) {
    void setFilters((prevFilters) => {
      const updatedFilters = prevFilters?.map((filter, i) => {
        if (i !== index) {
          return "joinOperator" in field && index === 0
            ? { ...filter, joinOperator: field.joinOperator ?? "and" }
            : filter
        }

        const updatedFilter = { ...filter, ...field }
        if ("type" in field) {
          updatedFilter.value = ""
        }
        return updatedFilter
      })

      return updatedFilters
    })
  }

  function removeFilter(index: number) {
    const updatedFilters = filters.filter((_, i) => i !== index)
    void setFilters(updatedFilters)
  }

  function renderFilterInput(filter: FilterCondition<TData>, index: number) {
    const filterField = filterFields.find((col) => col.id === filter.id)

    switch (filter.type) {
      case "text":
      case "number":
        return (
          <Input
            type={filter.type}
            value={filter.value as string}
            placeholder={filterField?.placeholder}
            className="h-8 w-full rounded bg-transparent"
            onChange={(e) => updateFilter(index, { value: e.target.value })}
          />
        )
      case "select":
        return (
          <FacetedFilter>
            <FacetedFilterTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full justify-start rounded text-left text-muted-foreground hover:text-muted-foreground"
              >
                {filter.value && typeof filter.value === "string" ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {filterField?.options?.find(
                      (option) => option.value === filter.value
                    )?.label || filter.value}
                  </Badge>
                ) : (
                  <>
                    Select option...
                    <CaretSortIcon className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </FacetedFilterTrigger>
            <FacetedFilterContent className="w-[12.5rem]">
              <FacetedFilterInput
                placeholder={filterField?.label ?? "Search options..."}
              />
              <FacetedFilterList>
                <FacetedFilterEmpty>No options found.</FacetedFilterEmpty>
                <FacetedFilterGroup>
                  {filterField?.options?.map((option) => (
                    <FacetedFilterItem
                      key={option.value}
                      value={option.value}
                      selected={filter.value === option.value}
                      onSelect={(value) => {
                        updateFilter(index, { value })
                        const closeEvent = new Event("keydown")
                        Object.defineProperty(closeEvent, "key", {
                          value: "Escape",
                        })
                        document.dispatchEvent(closeEvent)
                      }}
                    >
                      {option.label}
                    </FacetedFilterItem>
                  ))}
                </FacetedFilterGroup>
              </FacetedFilterList>
            </FacetedFilterContent>
          </FacetedFilter>
        )
      case "multi-select":
        const selectedValues = new Set(
          Array.isArray(filter.value) ? filter.value : []
        )

        return (
          <FacetedFilter>
            <FacetedFilterTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full justify-start rounded text-left text-muted-foreground hover:text-muted-foreground"
              >
                <>
                  {selectedValues.size === 0 && (
                    <>
                      Select options...
                      <CaretSortIcon className="ml-2 size-4" />
                    </>
                  )}
                </>
                {selectedValues?.size > 0 && (
                  <div className="flex items-center">
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal lg:hidden"
                    >
                      {selectedValues.size}
                    </Badge>
                    <div className="hidden min-w-0 gap-1 lg:flex">
                      {selectedValues.size > 2 ? (
                        <Badge
                          variant="secondary"
                          className="rounded-sm px-1 font-normal"
                        >
                          {selectedValues.size} selected
                        </Badge>
                      ) : (
                        filterField?.options
                          ?.filter((option) => selectedValues.has(option.value))
                          .map((option) => (
                            <Badge
                              variant="secondary"
                              key={option.value}
                              className="truncate rounded-sm px-1 font-normal"
                            >
                              {option.label}
                            </Badge>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </Button>
            </FacetedFilterTrigger>
            <FacetedFilterContent className="w-[12.5rem]">
              <FacetedFilterInput
                placeholder={filterField?.label ?? "Search options..."}
              />
              <FacetedFilterList>
                <FacetedFilterEmpty>No options found.</FacetedFilterEmpty>
                <FacetedFilterGroup>
                  {filterField?.options?.map((option) => (
                    <FacetedFilterItem
                      key={option.value}
                      value={option.value}
                      selected={selectedValues.has(option.value)}
                      onSelect={(value) => {
                        const currentValue = Array.isArray(filter.value)
                          ? filter.value
                          : []
                        const newValue = currentValue.includes(value)
                          ? currentValue.filter((v) => v !== value)
                          : [...currentValue, value]
                        updateFilter(index, { value: newValue })
                      }}
                    >
                      {option.label}
                    </FacetedFilterItem>
                  ))}
                </FacetedFilterGroup>
              </FacetedFilterList>
            </FacetedFilterContent>
          </FacetedFilter>
        )
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 w-full justify-start rounded text-left font-normal",
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

  console.log({ filters })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Icons.listFilter className="mr-2 size-3.5" aria-hidden="true" />
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
                ) : index === 1 ? (
                  <Select
                    value={filter.joinOperator}
                    onValueChange={(value: JoinOperator) =>
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
                ) : (
                  <span className="w-20 text-center text-sm text-muted-foreground">
                    {filter.joinOperator}
                  </span>
                )}
                <Select
                  value={filter.id as string}
                  onValueChange={(value) => {
                    const column = filterFields.find((col) => col.id === value)

                    if (column) {
                      updateFilter(index, {
                        id: value as keyof TData,
                        type: column.type,
                        operator: getDefaultFilterOperator(column.type),
                      })
                    }
                  }}
                >
                  <SelectTrigger className="h-8 w-32 rounded">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filterFields.map((col) => (
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
                  onValueChange={(value: Operator) =>
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
                <div className="min-w-36 flex-1">
                  {renderFilterInput(filter, index)}
                </div>
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
            <div className="mt-2 flex w-full items-center gap-2">
              <Button
                size="sm"
                className="h-[1.85rem] rounded"
                onClick={addFilter}
              >
                Add filter
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded"
                onClick={() => setFilters([])}
              >
                Reset filters
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
