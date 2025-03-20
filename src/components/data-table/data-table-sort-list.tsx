"use client";

import type { ColumnSort, SortDirection, Table } from "@tanstack/react-table";
import {
  ArrowDownUp,
  Check,
  ChevronsUpDown,
  GripVertical,
  Trash2,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@/components/ui/sortable";
import { dataTableConfig } from "@/config/data-table";
import { cn, toSentenceCase } from "@/lib/utils";

interface DataTableSortListProps<TData> {
  table: Table<TData>;
}

export function DataTableSortList<TData>({
  table,
}: DataTableSortListProps<TData>) {
  const id = React.useId();
  const labelId = React.useId();
  const descriptionId = React.useId();

  const initialSorting = React.useMemo(
    () => table.initialState.sorting ?? [],
    [table.initialState.sorting],
  );

  const sorting = table.getState().sorting;
  const onSortingChange = table.setSorting;

  const uniqueSorting = React.useMemo(() => {
    const uniqueIds = new Set();
    return sorting.filter((sort) => {
      if (uniqueIds.has(sort.id)) return false;
      uniqueIds.add(sort.id);
      return true;
    });
  }, [sorting]);

  const sortableColumns = React.useMemo(() => {
    const sortingIds = new Set<string>(sorting.map((s) => s.id));
    return table
      .getAllColumns()
      .filter((column) => column.getCanSort() && !sortingIds.has(column.id))
      .map((column) => ({
        id: column.id,
        label: toSentenceCase(column.id),
        selected: false,
      }));
  }, [sorting, table]);

  const onSortAdd = React.useCallback(() => {
    const firstAvailableColumn = sortableColumns[0];

    if (!firstAvailableColumn) return;

    onSortingChange((prevSorting) => [
      ...prevSorting,
      {
        id: firstAvailableColumn.id,
        desc: false,
      },
    ]);
  }, [sortableColumns, onSortingChange]);

  const onSortUpdate = React.useCallback(
    (sortId: string, updates: Partial<ColumnSort>) => {
      onSortingChange((prevSorting) => {
        if (!prevSorting) return prevSorting;

        return prevSorting.map((sort) =>
          sort.id === sortId ? { ...sort, ...updates } : sort,
        );
      });
    },
    [onSortingChange],
  );

  const onRemoveSort = React.useCallback(
    (sortId: string) => {
      onSortingChange((prevSorting) =>
        prevSorting.filter((item) => item.id !== sortId),
      );
    },
    [onSortingChange],
  );

  const onSortingReset = React.useCallback(
    () => onSortingChange(initialSorting),
    [onSortingChange, initialSorting],
  );

  return (
    <Sortable
      value={sorting}
      onValueChange={onSortingChange}
      getItemValue={(item) => item.id}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            aria-label="Open sorting"
            variant="outline"
            size="sm"
            className="[&>svg]:size-3"
          >
            <ArrowDownUp />
            Sort
            {uniqueSorting.length > 0 && (
              <Badge
                variant="secondary"
                className="h-[1.14rem] rounded-[0.2rem] px-[0.32rem] font-mono font-normal text-[0.65rem]"
              >
                {uniqueSorting.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          aria-describedby={descriptionId}
          aria-labelledby={labelId}
          align="start"
          collisionPadding={16}
          className="flex w-[calc(100vw-(--spacing(20)))] min-w-72 max-w-[25rem] origin-(--radix-popover-content-transform-origin) flex-col gap-3.5 p-4 sm:w-[25rem]"
        >
          <div className="flex flex-col gap-1">
            <h4 id={labelId} className="font-medium leading-none">
              {uniqueSorting.length > 0 ? "Sort by" : "No sorting applied"}
            </h4>
            <p
              id={descriptionId}
              className={cn(
                "text-muted-foreground text-sm",
                uniqueSorting.length > 0 && "sr-only",
              )}
            >
              {uniqueSorting.length > 0
                ? "Modify sorting to organize your results."
                : "Add sorting to organize your results."}
            </p>
          </div>
          {uniqueSorting.length > 0 ? (
            <SortableContent asChild>
              <div
                role="list"
                className="flex max-h-[300px] flex-col gap-2 overflow-y-auto p-0.5"
              >
                {uniqueSorting.map((sort) => {
                  const sortItemId = `${id}-sort-${sort.id}`;
                  const fieldListboxId = `${sortItemId}-field-listbox`;
                  const fieldTriggerId = `${sortItemId}-field-trigger`;
                  const directionListboxId = `${sortItemId}-direction-listbox`;

                  return (
                    <SortableItem key={sort.id} value={sort.id} asChild>
                      <div
                        role="listitem"
                        id={sortItemId}
                        tabIndex={-1}
                        className="flex items-center gap-2"
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id={fieldTriggerId}
                              role="combobox"
                              aria-controls={fieldListboxId}
                              variant="outline"
                              size="sm"
                              className="w-44 justify-between rounded"
                            >
                              <span className="truncate">
                                {toSentenceCase(sort.id)}
                              </span>
                              <div className="ml-auto flex items-center gap-1">
                                {initialSorting[0]?.id === sort.id ? (
                                  <Badge
                                    variant="secondary"
                                    className="h-[1.125rem] rounded px-1 font-mono font-normal text-[0.65rem]"
                                  >
                                    Default
                                  </Badge>
                                ) : null}
                                <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                              </div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            id={fieldListboxId}
                            className="w-(--radix-popover-trigger-width) origin-(--radix-popover-content-transform-origin) p-0"
                          >
                            <Command>
                              <CommandInput placeholder="Search fields..." />
                              <CommandList>
                                <CommandEmpty>No fields found.</CommandEmpty>
                                <CommandGroup>
                                  {sortableColumns.map((column) => (
                                    <CommandItem
                                      key={column.id}
                                      value={column.id}
                                      onSelect={(value) =>
                                        onSortUpdate(sort.id, {
                                          id: value,
                                        })
                                      }
                                    >
                                      <span className="truncate">
                                        {column.label}
                                      </span>
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          column.id === sort.id
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <Select
                          value={sort.desc ? "desc" : "asc"}
                          onValueChange={(value: SortDirection) =>
                            onSortUpdate(sort.id, {
                              id: sort.id,
                              desc: value === "desc",
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
                            className="min-w-(--radix-select-trigger-width) origin-(--radix-select-content-transform-origin)"
                          >
                            {dataTableConfig.sortOrders.map((order) => (
                              <SelectItem key={order.value} value={order.value}>
                                {order.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          aria-label={`Remove sort ${sort.id}`}
                          variant="outline"
                          size="icon"
                          className="size-8 shrink-0 rounded [&>svg]:size-3.5"
                          onClick={() => onRemoveSort(sort.id)}
                        >
                          <Trash2 />
                        </Button>
                        <SortableItemHandle asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8 shrink-0 rounded [&>svg]:size-3.5"
                          >
                            <GripVertical />
                          </Button>
                        </SortableItemHandle>
                      </div>
                    </SortableItem>
                  );
                })}
              </div>
            </SortableContent>
          ) : null}
          <div className="flex w-full items-center gap-2">
            <Button
              size="sm"
              className="h-[1.85rem] rounded"
              onClick={onSortAdd}
            >
              Add sort
            </Button>
            {uniqueSorting.length > 0 ? (
              <Button
                size="sm"
                variant="outline"
                className="rounded"
                onClick={onSortingReset}
              >
                Reset sorting
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
      <SortableOverlay>
        <div className="flex items-center gap-2">
          <div className="h-8 w-[11.25rem] rounded-sm bg-primary/10" />
          <div className="h-8 w-24 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
        </div>
      </SortableOverlay>
    </Sortable>
  );
}
