"use client"

import * as React from "react"
import { CaretSortIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

interface DataTableSortListProps<TData> {
  table: Table<TData>
}

export function DataTableSortList<TData>({
  table,
}: DataTableSortListProps<TData>) {
  const id = React.useId()

  const [sorting, setSorting] = React.useState<{ id: string; desc: boolean }[]>(
    []
  )

  // Get sortable columns from table instance
  const sortableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanSort())
    .map((column) => ({
      id: column.id,
      label: column.columnDef.header as string,
    }))

  function addSort() {
    const firstColumn = sortableColumns[0]
    if (!firstColumn) return

    setSorting([...sorting, { id: firstColumn.id, desc: false }])
  }

  function updateSort(
    index: number,
    field: Partial<{ id: string; desc: boolean }>
  ) {
    setSorting((prevSorting) => {
      const updatedSorting = prevSorting.map((sort, i) => {
        if (i === index) {
          return { ...sort, ...field }
        }
        return sort
      })
      return updatedSorting
    })
  }

  function removeSort(index: number) {
    setSorting((prevSorting) => prevSorting.filter((_, i) => i !== index))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Open sorting"
          aria-controls={`${id}-sort-dialog`}
        >
          <CaretSortIcon className="mr-2 size-3.5" aria-hidden="true" />
          Sort
          {sorting.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 rounded px-1.5 font-mono"
            >
              {sorting.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        id={`${id}-sort-dialog`}
        align="start"
        className={cn(
          "flex w-[26rem] origin-[var(--radix-popover-content-transform-origin)] flex-col p-4",
          sorting.length > 0 ? "gap-3.5" : "gap-2"
        )}
      >
        {sorting.length > 0 ? (
          <h4 className="font-medium leading-none">Sort by</h4>
        ) : (
          <div className="flex flex-col gap-1">
            <h4 className="font-medium leading-none">No sorting applied</h4>
            <p className="text-sm text-muted-foreground">
              Add sorting to organize your results.
            </p>
          </div>
        )}
        <div className="flex max-h-40 flex-col gap-2 overflow-y-auto py-0.5 pr-1">
          {sorting.map((sort, index) => {
            const sortId = `${id}-sort-${index}`
            const fieldListboxId = `${sortId}-field-listbox`
            const directionListboxId = `${sortId}-direction-listbox`

            return (
              <div key={index} className="flex items-center gap-2">
                <Select
                  value={sort.id}
                  onValueChange={(value) => updateSort(index, { id: value })}
                >
                  <SelectTrigger
                    aria-label="Select sort field"
                    aria-controls={fieldListboxId}
                    className="h-8 w-[180px] rounded"
                  >
                    <div className="truncate">
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent id={fieldListboxId}>
                    {sortableColumns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={sort.desc ? "desc" : "asc"}
                  onValueChange={(value) =>
                    updateSort(index, { desc: value === "desc" })
                  }
                >
                  <SelectTrigger
                    aria-label="Select sort direction"
                    aria-controls={directionListboxId}
                    className="h-8 w-[110px] rounded"
                  >
                    <div className="truncate">
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent id={directionListboxId}>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Remove sort ${index + 1}`}
                  className="size-8 shrink-0 rounded"
                  onClick={() => removeSort(index)}
                >
                  <Icons.trash className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            )
          })}
        </div>
        <div className="flex w-full items-center gap-2">
          <Button
            size="sm"
            className="h-[1.85rem] rounded"
            onClick={addSort}
            disabled={sorting.length >= sortableColumns.length}
          >
            Add sort
          </Button>
          {sorting.length > 0 ? (
            <Button
              size="sm"
              variant="outline"
              className="rounded"
              onClick={() => setSorting([])}
            >
              Reset sorting
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}
