"use client";

import type {
  ExtendedColumnSort,
  ExtendedSortingState,
  StringKeyOf,
} from "@/types";
import type { SortDirection, Table } from "@tanstack/react-table";
import {
  ArrowDownUp,
  Check,
  ChevronsUpDown,
  GripVertical,
  Trash2,
} from "lucide-react";
import { useQueryState } from "nuqs";
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
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { getSortingStateParser } from "@/lib/parsers";
import { cn, toSentenceCase } from "@/lib/utils";

interface DataTableSortListProps<TData> {
  table: Table<TData>;
  debounceMs: number;
  shallow?: boolean;
}

export function DataTableSortList<TData>({
  table,
  debounceMs,
  shallow,
}: DataTableSortListProps<TData>) {
  const id = React.useId();

  const initialSorting = React.useMemo(
    () => (table.initialState.sorting ?? []) as ExtendedSortingState<TData>,
    [table.initialState.sorting],
  );

  const sortingParser = React.useMemo(
    () =>
      getSortingStateParser(table.getRowModel().rows[0]?.original)
        .withDefault(initialSorting)
        .withOptions({
          clearOnDefault: true,
          shallow,
        }),
    [initialSorting, shallow, table],
  );

  const [sorting, setSorting] = useQueryState("sort", sortingParser);
  const debouncedSetSorting = useDebouncedCallback(setSorting, debounceMs);

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

  const onAddSort = React.useCallback(() => {
    const firstAvailableColumn = sortableColumns[0];
    if (!firstAvailableColumn) return;

    void setSorting([
      ...sorting,
      {
        id: firstAvailableColumn.id as StringKeyOf<TData>,
        desc: false,
      },
    ]);
  }, [sortableColumns, sorting, setSorting]);

  const onUpdateSort = React.useCallback(
    ({
      id,
      field,
      debounced = false,
    }: {
      id: string;
      field: Partial<ExtendedColumnSort<TData>>;
      debounced?: boolean;
    }) => {
      const updateFunction = debounced ? debouncedSetSorting : setSorting;

      updateFunction((prevSorting) => {
        if (!prevSorting) return prevSorting;

        return prevSorting.map((sort) =>
          sort.id === id ? { ...sort, ...field } : sort,
        );
      });
    },
    [debouncedSetSorting, setSorting],
  );

  const onRemoveSort = React.useCallback(
    (id: string) => {
      void setSorting((prevSorting) =>
        prevSorting.filter((item) => item.id !== id),
      );
    },
    [setSorting],
  );

  const onSortingReset = React.useCallback(
    () => setSorting(null),
    [setSorting],
  );

  return (
    <Sortable
      value={sorting}
      onValueChange={setSorting}
      getItemValue={(item) => item.id}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            aria-label="Open sorting"
            size="sm"
            className="gap-2 [&>svg]:size-3"
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
          align="start"
          collisionPadding={16}
          className={cn(
            "flex w-[calc(100vw-(--spacing(20)))] min-w-72 max-w-[25rem] origin-(--radix-popover-content-transform-origin) flex-col p-4 sm:w-[25rem]",
            sorting.length > 0 ? "gap-3.5" : "gap-2",
          )}
        >
          {uniqueSorting.length > 0 ? (
            <h4 className="font-medium leading-none">Sort by</h4>
          ) : (
            <div className="flex flex-col gap-1">
              <h4 className="font-medium leading-none">No sorting applied</h4>
              <p className="text-muted-foreground text-sm">
                Add sorting to organize your results.
              </p>
            </div>
          )}
          <SortableContent asChild>
            <div className="flex max-h-40 flex-col gap-2 overflow-y-auto p-0.5">
              {uniqueSorting.map((sort) => {
                const sortId = `${id}-sort-${sort.id}`;
                const fieldListboxId = `${sortId}-field-listbox`;
                const fieldTriggerId = `${sortId}-field-trigger`;
                const directionListboxId = `${sortId}-direction-listbox`;

                return (
                  <SortableItem key={sort.id} value={sort.id} asChild>
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id={fieldTriggerId}
                            role="combobox"
                            aria-controls={fieldListboxId}
                            variant="outline"
                            size="sm"
                            className="h-8 w-44 justify-between gap-2 rounded focus:outline-hidden focus:ring-1 focus:ring-ring"
                            onPointerDown={(event) => {
                              // prevent implicit pointer capture
                              const target = event.target;
                              if (!(target instanceof Element)) return;
                              if (target.hasPointerCapture(event.pointerId)) {
                                target.releasePointerCapture(event.pointerId);
                              }

                              if (
                                event.button === 0 &&
                                event.ctrlKey === false &&
                                event.pointerType === "mouse"
                              ) {
                                // prevent trigger from stealing focus from the active item
                                event.preventDefault();
                              }
                            }}
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
                          onCloseAutoFocus={() =>
                            document
                              .getElementById(fieldTriggerId)
                              ?.focus({ preventScroll: true })
                          }
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
                                    onSelect={(value) => {
                                      const newFieldTriggerId = `${id}-sort-${value}-field-trigger`;

                                      onUpdateSort({
                                        id: sort.id,
                                        field: {
                                          id: value as StringKeyOf<TData>,
                                        },
                                      });

                                      requestAnimationFrame(() => {
                                        document
                                          .getElementById(newFieldTriggerId)
                                          ?.focus();
                                      });
                                    }}
                                  >
                                    <span className="mr-1.5 truncate">
                                      {column.label}
                                    </span>
                                    <Check
                                      className={cn(
                                        "ml-auto size-4 shrink-0",
                                        column.id === sort.id
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                      aria-hidden="true"
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
                          onUpdateSort({
                            id: sort.id,
                            field: { id: sort.id, desc: value === "desc" },
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
          <div className="flex w-full items-center gap-2">
            <Button
              size="sm"
              className="h-[1.85rem] rounded"
              onClick={onAddSort}
              disabled={sorting.length >= sortableColumns.length}
            >
              Add sort
            </Button>
            {sorting.length > 0 ? (
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
