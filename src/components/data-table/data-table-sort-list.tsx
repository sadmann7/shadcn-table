"use client"

import * as React from "react"
import type {
  ExtendedColumnSort,
  ExtendedSortingState,
  StringKeyOf,
} from "@/types"
import type { SortDirection, Table } from "@tanstack/react-table"
import { ArrowDownUp, GripVertical, Trash2 } from "lucide-react"
import { useQueryState } from "nuqs"

import { dataTableConfig } from "@/config/data-table"
import { getSortingStateParser } from "@/lib/parsers"
import { cn, toSentenceCase } from "@/lib/utils"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
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
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "@/components/ui/sortable"

interface DataTableSortListProps<TData> {
  table: Table<TData>
  debounceMs: number
  shallow?: boolean
}

export function DataTableSortList<TData>({
  table,
  debounceMs,
  shallow,
}: DataTableSortListProps<TData>) {
  const id = React.useId()

  const initialSorting = (table.initialState.sorting ??
    []) as ExtendedSortingState<TData>

  const [sorting, setSorting] = useQueryState(
    "sort",
    getSortingStateParser(table.getRowModel().rows[0]?.original)
      .withDefault(initialSorting)
      .withOptions({
        clearOnDefault: true,
        shallow,
      })
  )

  const uniqueSorting = sorting.filter(
    (sort, index, self) => index === self.findIndex((t) => t.id === sort.id)
  )

  const debouncedSetSorting = useDebouncedCallback(setSorting, debounceMs)

  const sortableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanSort())
    .map((column) => ({
      id: column.id,
      label: toSentenceCase(column.id),
      selected: sorting?.some((s) => s.id === column.id),
    }))

  function addSort() {
    const firstAvailableColumn = sortableColumns.find(
      (column) => !sorting.some((s) => s.id === column.id)
    )
    if (!firstAvailableColumn) return

    void setSorting([
      ...sorting,
      {
        id: firstAvailableColumn.id as StringKeyOf<TData>,
        desc: false,
      },
    ])
  }

  function updateSort({
    field,
    index,
    debounced = false,
  }: {
    field: Partial<ExtendedColumnSort<TData>>
    index: number
    debounced?: boolean
  }) {
    const updateFunction = debounced ? debouncedSetSorting : setSorting

    updateFunction((prevSorting) => {
      if (!prevSorting) return prevSorting

      const updatedSorting = prevSorting.map((sort, i) =>
        i === index ? { ...sort, ...field } : sort
      )
      return updatedSorting
    })
  }

  function removeSort(id: string) {
    void setSorting((prevSorting) =>
      prevSorting.filter((item) => item.id !== id)
    )
  }

  return (
    <Sortable
      value={sorting}
      onValueChange={setSorting}
      overlay={
        <div className="flex items-center gap-2">
          <div className="h-8 w-[11.25rem] rounded-sm bg-primary/10" />
          <div className="h-8 w-24 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
        </div>
      }
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label="Open sorting"
            aria-controls={`${id}-sort-dialog`}
          >
            <ArrowDownUp className="size-3" aria-hidden="true" />
            Sort
            {uniqueSorting.length > 0 && (
              <Badge
                variant="secondary"
                className="h-[1.14rem] rounded-[0.2rem] px-[0.32rem] font-mono text-[0.65rem] font-normal"
              >
                {uniqueSorting.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          id={`${id}-sort-dialog`}
          align="start"
          className={cn(
            "flex w-[25rem] origin-[var(--radix-popover-content-transform-origin)] flex-col p-4",
            uniqueSorting.length > 0 ? "gap-3.5" : "gap-2"
          )}
        >
          {uniqueSorting.length > 0 ? (
            <h4 className="font-medium leading-none">Sort by</h4>
          ) : (
            <div className="flex flex-col gap-1">
              <h4 className="font-medium leading-none">No sorting applied</h4>
              <p className="text-sm text-muted-foreground">
                Add sorting to organize your results.
              </p>
            </div>
          )}
          <div className="flex max-h-40 flex-col gap-2 overflow-y-auto p-0.5">
            <div className="flex w-full flex-col gap-2">
              {uniqueSorting.map((sort, index) => {
                const sortId = `${id}-sort-${sort.id}`
                const fieldListboxId = `${sortId}-field-listbox`
                const directionListboxId = `${sortId}-direction-listbox`

                return (
                  <SortableItem key={sort.id} value={sort.id} asChild>
                    <div className="flex items-center gap-2">
                      <Select
                        value={sort.id}
                        onValueChange={(value: StringKeyOf<TData>) =>
                          updateSort({
                            field: { id: value },
                            index,
                          })
                        }
                      >
                        <SelectTrigger
                          aria-label="Select sort field"
                          aria-controls={fieldListboxId}
                          className="h-8 w-[11.25rem] rounded"
                        >
                          <div className="truncate">
                            <SelectValue />
                          </div>
                          {initialSorting.length === 1 &&
                          initialSorting[0]?.id === sort.id ? (
                            <Badge
                              variant="secondary"
                              className="ml-auto h-[1.125rem] rounded px-1 font-mono text-[0.65rem] font-normal"
                            >
                              Default
                            </Badge>
                          ) : null}
                        </SelectTrigger>
                        <SelectContent id={fieldListboxId}>
                          {sortableColumns
                            .filter(
                              (column) =>
                                !column.selected || column.id === sort.id
                            )
                            .map((column) => (
                              <SelectItem key={column.id} value={column.id}>
                                {column.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={sort.desc ? "desc" : "asc"}
                        onValueChange={(value: SortDirection) =>
                          updateSort({
                            field: { id: sort.id, desc: value === "desc" },
                            index,
                          })
                        }
                      >
                        <SelectTrigger
                          aria-label="Select sort direction"
                          aria-controls={directionListboxId}
                          className="h-8 w-24 rounded"
                        >
                          <div className="truncate">
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent
                          id={directionListboxId}
                          className="min-w-[var(--radix-select-trigger-width)]"
                        >
                          {dataTableConfig.sortOrders.map((order) => (
                            <SelectItem key={order.value} value={order.value}>
                              {order.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Remove sort ${sort.id}`}
                        className="size-8 shrink-0 rounded"
                        onClick={() => removeSort(sort.id)}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </Button>
                      <SortableDragHandle
                        variant="outline"
                        size="icon"
                        className="size-8 shrink-0 rounded"
                      >
                        <GripVertical className="size-3.5" aria-hidden="true" />
                      </SortableDragHandle>
                    </div>
                  </SortableItem>
                )
              })}
            </div>
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
                onClick={() => setSorting(null)}
              >
                Reset sorting
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </Sortable>
  )
}
