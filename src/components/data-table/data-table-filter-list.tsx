"use client"

import * as React from "react"
import type { ColumnType, FilterColumn, FilterCondition } from "@/types"

import { dataTableConfig } from "@/config/data-table"
import { getDefaultFilterOperator, getFilterOperators } from "@/lib/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableFilterListProps<TData> {
  filterColumns: FilterColumn<TData>[]
  onFilterChange: (filters: FilterCondition<TData>[]) => void
}

export function DataTableFilterList<TData>({
  filterColumns,
  onFilterChange,
}: DataTableFilterListProps<TData>) {
  const [filters, setFilters] = React.useState<FilterCondition<TData>[]>([])

  const addFilter = () => {
    const newFilter: FilterCondition<TData> = {
      id: filterColumns[0]?.id as keyof TData,
      value: "",
      type: filterColumns[0]?.type as ColumnType,
      operator: getDefaultFilterOperator(filterColumns[0]?.type as ColumnType),
      joinOperator: "and",
      options: filterColumns[0]?.options,
    }
    setFilters([...filters, newFilter])
  }

  const updateFilter = (
    index: number,
    field: Partial<FilterCondition<TData>>
  ) => {
    const updatedFilters = [...filters]
    updatedFilters[index] = {
      ...updatedFilters[index],
      ...field,
    } as FilterCondition<TData>
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const removeFilter = (index: number) => {
    const updatedFilters = filters.filter((_, i) => i !== index)
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const renderFilterInput = (filter: FilterCondition<TData>, index: number) => {
    switch (filter.type) {
      case "text":
      case "number":
        return (
          <Input
            type={filter.type}
            value={filter.value as string}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
          />
        )
      case "select":
      case "multi-select":
        return (
          <select
            value={filter.value as string}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            multiple={filter.type === "multi-select"}
          >
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      case "date":
        return (
          <input
            type="date"
            value={filter.value as string}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
          />
        )
      case "boolean":
        return (
          <select
            value={filter.value as string}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        )
      default:
        return null
    }
  }

  return (
    <div>
      {filters.map((filter, index) => (
        <div key={index}>
          <select
            value={filter.id as string}
            onChange={(e) => {
              const column = filterColumns.find(
                (col) => col.id === e.target.value
              )
              if (column) {
                updateFilter(index, {
                  id: e.target.value as keyof TData,
                  type: column.type,
                  operator: getDefaultFilterOperator(column.type),
                  options: column.options,
                })
              }
            }}
          >
            {filterColumns.map((col) => (
              <option key={col.id as string} value={col.id as string}>
                {col.label}
              </option>
            ))}
          </select>
          <select
            value={filter.operator}
            onChange={(e) => updateFilter(index, { operator: e.target.value })}
          >
            {getFilterOperators(filter.type).map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
          {renderFilterInput(filter, index)}
          {index > 0 && (
            <select
              value={filter.joinOperator}
              onChange={(e) =>
                updateFilter(index, { joinOperator: e.target.value })
              }
            >
              {dataTableConfig.joinOperators.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          )}
          <Button onClick={() => removeFilter(index)}>Remove</Button>
        </div>
      ))}
      <Button onClick={addFilter}>Add Filter</Button>
    </div>
  )
}
