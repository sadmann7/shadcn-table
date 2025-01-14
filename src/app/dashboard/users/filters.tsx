"use client"

import { Task } from "@/db/schema"
import { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useTableSearchParams } from "./data-table"

export function TextFilter({ column, table }: any) {
  const columnFilterValue = column.getFilterValue()

  return (
    <Input
      value={columnFilterValue ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value)}
      //   placeholder={`Filter ${column.id}...`}
      placeholder={`Пошук...`}
      className="mb-2 max-w-sm"
    />
  )
}

// Reusable column filter component for select fields
export function SelectFilter({ column, options }: any) {
  const columnFilterValue = column.getFilterValue()
  //   console.log(4444, columnFilterValue)

  const [
    { sorting, columnFilters, globalFilter, pageIndex, pageSize },
    setTableState,
  ] = useTableSearchParams()

  //   console.log(columnFilters)

  return (
    <div className="mb-2">
      <Select
        value={columnFilterValue ?? ""}
        onValueChange={(value) => column.setFilterValue(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Виберіть..." />
        </SelectTrigger>
        <SelectContent>
          {/* <SelectItem value="">All</SelectItem> */}
          {options.map((option: any) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
