"use client"

import * as React from "react"
import type {
  DataTableAdvancedFilterField,
  FilterCondition,
  FilterOperator,
  JoinOperator,
} from "@/types"
import { CalendarIcon, CaretSortIcon } from "@radix-ui/react-icons"
import { parseAsStringEnum, useQueryState } from "nuqs"

import { dataTableConfig } from "@/config/data-table"
import { getDefaultFilterOperator, getFilterOperators } from "@/lib/data-table"
import { cn, formatDate } from "@/lib/utils"
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
  const id = React.useId()
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
  const [joinOperator, setJoinOperator] = useQueryState<JoinOperator>(
    "joinOperator",
    parseAsStringEnum(["and", "or"]).withDefault("and").withOptions({
      clearOnDefault: true,
      shallow,
    })
  )

  const debouncedSetFilters = useDebouncedCallback(setFilters, debouncedMs)

  function addFilter() {
    const firstColumn = filterFields[0]

    if (!firstColumn) return

    void setFilters([
      ...filters,
      {
        id: firstColumn.id,
        value: "",
        type: firstColumn.type,
        operator: getDefaultFilterOperator(firstColumn.type),
      },
    ])
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
      const updatedFilters = prevFilters.map((filter, i) => {
        if (i === index) {
          const updatedFilter = { ...filter, ...field }
          if ("type" in field) {
            updatedFilter.value = ""
          }
          if (field.operator === "isEmpty" || field.operator === "isNotEmpty") {
            updatedFilter.value = ""
          }
          return updatedFilter
        }
        return filter
      })

      return updatedFilters
    })
  }

  function removeFilter(index: number) {
    const updatedFilters = filters.filter((_, i) => i !== index)
    void setFilters(updatedFilters)
  }

  function renderFilterInput({
    filter,
    index,
    inputId,
  }: {
    filter: FilterCondition<TData>
    index: number
    inputId: string
  }) {
    const filterField = filterFields.find((f) => f.id === filter.id)

    if (!filterField) return null

    if (filter.operator === "isEmpty" || filter.operator === "isNotEmpty") {
      return (
        <div
          id={inputId}
          role="status"
          aria-live="polite"
          aria-label={`${filterField.label} filter is ${filter.operator === "isEmpty" ? "empty" : "not empty"}`}
          className="h-8 w-full rounded border border-dashed"
        />
      )
    }

    switch (filter.type) {
      case "text":
      case "number":
        return (
          <Input
            id={inputId}
            type={filter.type}
            aria-label={`${filterField.label} filter value`}
            aria-describedby={`${inputId}-description`}
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
                id={inputId}
                variant="outline"
                size="sm"
                aria-label={`${filterField.label} filter value`}
                aria-controls={`${inputId}-listbox`}
                className="h-8 w-full justify-start rounded px-1.5 text-left text-muted-foreground hover:text-muted-foreground"
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
            <FacetedFilterContent
              id={`${inputId}-listbox`}
              className="w-[12.5rem] origin-[var(--radix-popover-content-transform-origin)]"
            >
              <FacetedFilterInput
                placeholder={filterField?.label ?? "Search options..."}
                aria-label={`Search ${filterField?.label} options`}
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
                        setTimeout(() => {
                          document.getElementById(inputId)?.click()
                        }, 0)
                      }}
                    >
                      {option.icon && (
                        <option.icon
                          className="mr-2 size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                      <span>{option.label}</span>
                      {option.count && (
                        <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                          {option.count}
                        </span>
                      )}
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
                id={inputId}
                variant="outline"
                size="sm"
                aria-label={`${filterField.label} filter values`}
                aria-controls={`${inputId}-listbox`}
                className="h-8 w-full justify-start rounded px-1.5 text-left text-muted-foreground hover:text-muted-foreground"
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
            <FacetedFilterContent
              id={`${inputId}-listbox`}
              className="w-[12.5rem] origin-[var(--radix-popover-content-transform-origin)]"
            >
              <FacetedFilterInput
                aria-label={`Search ${filterField?.label} options`}
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
                      {option.icon && (
                        <option.icon
                          className="mr-2 size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                      <span>{option.label}</span>
                      {option.count && (
                        <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                          {option.count}
                        </span>
                      )}
                    </FacetedFilterItem>
                  ))}
                </FacetedFilterGroup>
              </FacetedFilterList>
            </FacetedFilterContent>
          </FacetedFilter>
        )
      case "date":
        const dateValue = Array.isArray(filter.value)
          ? filter.value.filter(Boolean)
          : [filter.value, filter.value]

        const displayValue =
          filter.operator === "isBetween" && dateValue.length === 2
            ? `${formatDate(dateValue[0] ?? new Date())} - ${formatDate(
                dateValue[1] ?? new Date()
              )}`
            : dateValue[0]
              ? formatDate(dateValue[0])
              : "Pick a date"

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={inputId}
                variant="outline"
                size="sm"
                aria-label={`${filterField.label} date filter`}
                aria-controls={`${inputId}-calendar`}
                className={cn(
                  "h-8 w-full justify-start rounded text-left font-normal",
                  !filter.value && "text-muted-foreground"
                )}
              >
                <CalendarIcon
                  className="mr-2 size-3.5 shrink-0"
                  aria-hidden="true"
                />

                <span className="truncate">{displayValue}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              id={`${inputId}-calendar`}
              align="start"
              className="w-auto p-0"
            >
              {filter.operator === "isBetween" ? (
                <Calendar
                  id={`${inputId}-calendar`}
                  mode="range"
                  aria-label={`Select ${filterField.label} date range`}
                  selected={
                    dateValue.length === 2
                      ? {
                          from: new Date(dateValue[0] ?? ""),
                          to: new Date(dateValue[1] ?? ""),
                        }
                      : {
                          from: new Date(),
                          to: new Date(),
                        }
                  }
                  onSelect={(date) => {
                    updateFilter({
                      index,
                      field: {
                        value: date
                          ? [
                              date.from?.toISOString() ?? "",
                              date.to?.toISOString() ?? "",
                            ]
                          : [],
                      },
                    })
                  }}
                  initialFocus
                  numberOfMonths={1}
                />
              ) : (
                <Calendar
                  id={`${inputId}-calendar`}
                  mode="single"
                  aria-label={`Select ${filterField.label} date`}
                  selected={dateValue[0] ? new Date(dateValue[0]) : undefined}
                  onSelect={(date) => {
                    updateFilter({
                      index,
                      field: { value: date?.toISOString() ?? "" },
                    })

                    setTimeout(() => {
                      document.getElementById(inputId)?.click()
                    }, 0)
                  }}
                  initialFocus
                />
              )}
            </PopoverContent>
          </Popover>
        )
      case "boolean":
        return (
          <Select
            value={filter.value as string}
            onValueChange={(value) => updateFilter({ index, field: { value } })}
          >
            <SelectTrigger
              id={inputId}
              aria-label={`${filterField.label} boolean filter`}
              aria-controls={`${inputId}-listbox`}
              className="h-8 w-full rounded bg-transparent"
            >
              <SelectValue placeholder="True" />
            </SelectTrigger>
            <SelectContent id={`${inputId}-listbox`}>
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
        <Button
          variant="outline"
          size="sm"
          aria-label="Open filters"
          aria-controls={`${id}-filter-dialog`}
        >
          <Icons.listFilter className="mr-2 size-3.5" aria-hidden="true" />
          Filters
          {filters.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 rounded px-1.5 font-mono"
            >
              {filters.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        id={`${id}-filter-dialog`}
        align="start"
        className={cn(
          "flex w-[36rem] origin-[var(--radix-popover-content-transform-origin)] flex-col p-4",
          filters.length > 0 ? "gap-3.5" : "gap-2"
        )}
      >
        {filters.length > 0 ? (
          <h4 className="font-medium leading-none">Filters</h4>
        ) : (
          <div className="flex flex-col gap-1">
            <h4 className="font-medium leading-none">No filters applied</h4>
            <p className="text-sm text-muted-foreground">
              Add filters to refine your results.
            </p>
          </div>
        )}
        <div className="flex max-h-40 flex-col gap-2 overflow-y-auto py-0.5 pr-1">
          {filters.map((filter, index) => {
            const filterId = `${id}-filter-${index}`
            const joinOperatorListboxId = `${filterId}-join-operator-listbox`
            const fieldListboxId = `${filterId}-field-listbox`
            const operatorListboxId = `${filterId}-operator-listbox`
            const inputId = `${filterId}-input`

            return (
              <div key={index} className="flex items-center gap-2">
                {index === 0 ? (
                  <span className="w-20 text-center text-sm text-muted-foreground">
                    Where
                  </span>
                ) : index === 1 ? (
                  <Select
                    value={joinOperator}
                    onValueChange={(value: JoinOperator) =>
                      setJoinOperator(value)
                    }
                  >
                    <SelectTrigger
                      aria-label="Select join operator"
                      aria-controls={joinOperatorListboxId}
                      className="h-8 w-20 rounded lowercase"
                    >
                      <SelectValue placeholder={joinOperator} />
                    </SelectTrigger>
                    <SelectContent
                      id={joinOperatorListboxId}
                      position="popper"
                      className="min-w-[var(--radix-select-trigger-width)] lowercase"
                    >
                      {dataTableConfig.joinOperators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="w-20 text-center text-sm text-muted-foreground">
                    {joinOperator}
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
                  <SelectTrigger
                    aria-label="Select filter field"
                    aria-controls={fieldListboxId}
                    className="h-8 w-32 rounded"
                  >
                    <div className="truncate">
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent id={fieldListboxId}>
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
                  <SelectTrigger
                    aria-label="Select filter operator"
                    aria-controls={operatorListboxId}
                    className="h-8 w-32 rounded"
                  >
                    <div className="truncate">
                      <SelectValue placeholder={filter.operator} />
                    </div>
                  </SelectTrigger>
                  <SelectContent id={operatorListboxId}>
                    {getFilterOperators(filter.type).map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="min-w-36 flex-1">
                  {renderFilterInput({
                    filter,
                    index,
                    inputId,
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Remove filter ${index + 1}`}
                  className="size-8 shrink-0 rounded"
                  onClick={() => removeFilter(index)}
                >
                  <Icons.trash className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            )
          })}
        </div>
        <div className="flex w-full items-center gap-2">
          <Button size="sm" className="h-[1.85rem] rounded" onClick={addFilter}>
            Add filter
          </Button>
          {filters.length > 0 ? (
            <Button
              size="sm"
              variant="outline"
              className="rounded"
              onClick={() => {
                void setFilters([])
                void setJoinOperator("and")
              }}
            >
              Reset filters
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}
