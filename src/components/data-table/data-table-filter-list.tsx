"use client"

import type {
  DataTableAdvancedFilterField,
  FilterCondition,
  FilterOperator,
  JoinOperator,
} from "@/types"
import { CalendarIcon, CaretSortIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { useQueryState } from "nuqs"

import { dataTableConfig } from "@/config/data-table"
import { getDefaultFilterOperator, getFilterOperators } from "@/lib/data-table"
import { cn } from "@/lib/utils"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
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
  debouncedMs: number
  shallow?: boolean
}

export function DataTableFilterList<TData>({
  filterFields,
  debouncedMs,
  shallow,
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
      shallow,
    }
  )

  const debouncedSetFilters = useDebouncedCallback(setFilters, debouncedMs)

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

  function updateFilter({
    index,
    field,
    debounced = false,
  }: {
    index: number
    field: Partial<FilterCondition<TData>>
    debounced?: boolean
  }) {
    const updateFunction = debounced ? debouncedSetFilters : setFilters
    updateFunction((prevFilters) => {
      let updatedFilters = prevFilters.map((filter, i) => {
        if (i === index) {
          const updatedFilter = { ...filter, ...field }
          if ("type" in field) {
            updatedFilter.value = ""
          }
          return updatedFilter
        }
        return filter
      })

      if ("joinOperator" in field) {
        updatedFilters = updatedFilters.map((filter, i) =>
          i > 0
            ? { ...filter, joinOperator: field.joinOperator as JoinOperator }
            : filter
        )
      }

      return updatedFilters
    })
  }

  function removeFilter(index: number) {
    const updatedFilters = filters.filter((_, i) => i !== index)
    void setFilters(updatedFilters)
  }

  function renderFilterInput(filter: FilterCondition<TData>, index: number) {
    const filterField = filterFields.find((f) => f.id === filter.id)

    if (!filterField) return null

    switch (filter.type) {
      case "text":
      case "number":
        return (
          <Input
            type={filter.type}
            placeholder={filterField.placeholder}
            className="h-8 w-full rounded"
            defaultValue={
              typeof filter.value === "string" ? filter.value : undefined
            }
            onChange={(event) =>
              updateFilter({
                index,
                field: { value: event.target.value },
                debounced: true,
              })
            }
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
                        updateFilter({ index, field: { value } })
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
                        updateFilter({ index, field: { value: newValue } })
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
                <CalendarIcon
                  className="mr-2 size-3.5 shrink-0"
                  aria-hidden="true"
                />

                <span className="truncate">
                  {filter.value
                    ? format(new Date(filter.value as string), "PPP")
                    : "Pick a date"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={
                  filter.value ? new Date(filter.value as string) : undefined
                }
                onSelect={(date) =>
                  updateFilter({
                    index,
                    field: { value: date ? date.toISOString() : "" },
                  })
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
            onValueChange={(value) => updateFilter({ index, field: { value } })}
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
                      updateFilter({ index, field: { joinOperator: value } })
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
                      updateFilter({
                        index,
                        field: {
                          id: value as keyof TData,
                          type: column.type,
                          operator: getDefaultFilterOperator(column.type),
                        },
                      })
                    }
                  }}
                >
                  <SelectTrigger className="h-8 w-32 rounded">
                    <div className="truncate">
                      <SelectValue />
                    </div>
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
                  onValueChange={(value: FilterOperator) =>
                    updateFilter({ index, field: { operator: value } })
                  }
                >
                  <SelectTrigger className="h-8 w-32 rounded">
                    <div className="truncate">
                      <SelectValue placeholder={filter.operator} />
                    </div>
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
