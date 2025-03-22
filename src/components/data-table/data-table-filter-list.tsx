"use client";

import type { Table } from "@tanstack/react-table";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  GripVertical,
  ListFilter,
  Trash2,
} from "lucide-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Faceted,
  FacetedBadgeList,
  FacetedContent,
  FacetedEmpty,
  FacetedGroup,
  FacetedInput,
  FacetedItem,
  FacetedList,
  FacetedTrigger,
} from "@/components/ui/faceted";
import { Input } from "@/components/ui/input";
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
import { getFilterOperators } from "@/lib/data-table";
import { generateId } from "@/lib/id";
import { getFiltersStateParser } from "@/lib/parsers";
import { cn, formatDate } from "@/lib/utils";
import type {
  DataTableFilterField,
  ExtendedColumnFilter,
  FilterOperator,
  JoinOperator,
} from "@/types/data-table";

interface DataTableFilterListProps<TData> {
  table: Table<TData>;
  debounceMs?: number;
  shallow?: boolean;
}

export function DataTableFilterList<TData>({
  table,
  debounceMs = 300,
  shallow = true,
}: DataTableFilterListProps<TData>) {
  const id = React.useId();
  const labelId = React.useId();
  const descriptionId = React.useId();

  const filterFields = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter((column) => column.columnDef.enableColumnFilter)
        .map(
          (column) =>
            ({
              id: column.id as Extract<keyof TData, string>,
              label: column.columnDef.meta?.label ?? column.id,
              placeholder: column.columnDef.meta?.placeholder,
              variant: column.columnDef.meta?.variant ?? "text",
              options: column.columnDef.meta?.options,
            }) satisfies DataTableFilterField<TData>,
        ),
    [table],
  );

  const [filters, setFilters] = useQueryState(
    "filters",
    getFiltersStateParser<TData>(filterFields.map((field) => field.id))
      .withDefault([])
      .withOptions({
        clearOnDefault: true,
        shallow,
      }),
  );
  const debouncedSetFilters = useDebouncedCallback(setFilters, debounceMs);

  const [joinOperator, setJoinOperator] = useQueryState(
    "joinOperator",
    parseAsStringEnum(["and", "or"]).withDefault("and").withOptions({
      clearOnDefault: true,
      shallow,
    }),
  );

  const onFilterAdd = React.useCallback(() => {
    const filterField = filterFields[0];

    if (!filterField) return;

    const newFilter: ExtendedColumnFilter<TData> = {
      id: filterField.id,
      value: "",
      variant: filterField.variant,
      operator:
        (getFilterOperators(filterField.variant)[0]?.value ??
        filterField.variant === "text")
          ? "iLike"
          : "eq",
      filterId: generateId({ length: 8 }),
    };

    debouncedSetFilters([...filters, newFilter]);
  }, [filterFields, filters, debouncedSetFilters]);

  const onFilterUpdate = React.useCallback(
    (
      filterId: string,
      updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>,
    ) => {
      debouncedSetFilters((prevFilters) => {
        const updatedFilters = prevFilters.map((filter) => {
          if (filter.filterId === filterId) {
            return { ...filter, ...updates } as ExtendedColumnFilter<TData>;
          }
          return filter;
        });
        return updatedFilters;
      });
    },
    [debouncedSetFilters],
  );

  const onFilterRemove = React.useCallback(
    (filterId: string) => {
      const updatedFilters = filters.filter(
        (filter) => filter.filterId !== filterId,
      );
      void setFilters(updatedFilters);
    },
    [filters, setFilters],
  );

  const onFilterMove = React.useCallback(
    (activeIndex: number, overIndex: number) => {
      void setFilters((prevFilters) => {
        const newFilters = [...prevFilters];
        const [removed] = newFilters.splice(activeIndex, 1);
        if (!removed) return prevFilters;
        newFilters.splice(overIndex, 0, removed);
        return newFilters;
      });
    },
    [setFilters],
  );

  const onFilterInputRender = React.useCallback(
    ({
      filter,
      inputId,
    }: { filter: ExtendedColumnFilter<TData>; inputId: string }) => {
      const filterField = filterFields.find((f) => f.id === filter.id);

      if (!filterField) return null;

      if (filter.operator === "isEmpty" || filter.operator === "isNotEmpty") {
        return (
          <div
            id={inputId}
            role="status"
            aria-live="polite"
            aria-label={`${filterField.label} filter is ${
              filter.operator === "isEmpty" ? "empty" : "not empty"
            }`}
            className="h-8 w-full rounded border border-dashed"
          />
        );
      }

      switch (filter.variant) {
        case "text":
        case "number":
          return (
            <Input
              id={inputId}
              type={filter.variant}
              aria-label={`${filterField.label} filter value`}
              aria-describedby={`${inputId}-description`}
              placeholder={filterField.placeholder ?? "Enter a value..."}
              className="h-8 w-full rounded"
              defaultValue={
                typeof filter.value === "string" ? filter.value : undefined
              }
              onChange={(event) =>
                onFilterUpdate(filter.filterId, {
                  value: event.target.value,
                })
              }
            />
          );
        case "select":
          return (
            <Faceted
              value={
                typeof filter.value === "string" ? filter.value : undefined
              }
              onValueChange={(value) => {
                onFilterUpdate(filter.filterId, {
                  value,
                });
              }}
            >
              <FacetedTrigger asChild>
                <Button
                  id={inputId}
                  aria-controls={`${inputId}-listbox`}
                  aria-label={`${filterField.label} filter value`}
                  variant="outline"
                  size="sm"
                  className="w-full rounded px-1.5"
                >
                  <FacetedBadgeList
                    options={filterField.options}
                    placeholder={
                      filterField.placeholder ?? "Select an option..."
                    }
                  />
                </Button>
              </FacetedTrigger>
              <FacetedContent
                id={`${inputId}-listbox`}
                className="w-[12.5rem] origin-(--radix-popover-content-transform-origin)"
              >
                <FacetedInput
                  aria-label={`Search ${filterField?.label} options`}
                  placeholder={filterField?.label ?? "Search options..."}
                />
                <FacetedList>
                  <FacetedEmpty>No options found.</FacetedEmpty>
                  <FacetedGroup>
                    {filterField?.options?.map((option) => (
                      <FacetedItem key={option.value} value={option.value}>
                        {option.icon && (
                          <option.icon className="size-4 text-muted-foreground" />
                        )}
                        <span>{option.label}</span>
                        {option.count && (
                          <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                            {option.count}
                          </span>
                        )}
                      </FacetedItem>
                    ))}
                  </FacetedGroup>
                </FacetedList>
              </FacetedContent>
            </Faceted>
          );
        case "multi-select": {
          const selectedValues = Array.isArray(filter.value)
            ? filter.value
            : [];

          return (
            <Faceted
              multiple
              value={selectedValues as string[]}
              onValueChange={(value) => {
                onFilterUpdate(filter.filterId, {
                  value,
                });
              }}
            >
              <FacetedTrigger asChild>
                <Button
                  id={inputId}
                  aria-controls={`${inputId}-listbox`}
                  aria-label={`${filterField.label} filter values`}
                  variant="outline"
                  size="sm"
                  className="w-full rounded px-1.5"
                >
                  <FacetedBadgeList
                    options={filterField.options}
                    placeholder={
                      filterField.placeholder ?? " Select options..."
                    }
                  />
                </Button>
              </FacetedTrigger>
              <FacetedContent id={`${inputId}-listbox`}>
                <FacetedInput
                  aria-label={`Search ${filterField?.label} options`}
                  placeholder={filterField?.label ?? "Search options..."}
                />
                <FacetedList>
                  <FacetedEmpty>No options found.</FacetedEmpty>
                  <FacetedGroup>
                    {filterField?.options?.map((option) => (
                      <FacetedItem key={option.value} value={option.value}>
                        {option.icon && (
                          <option.icon className="size-4 text-muted-foreground" />
                        )}
                        <span>{option.label}</span>
                        {option.count && (
                          <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                            {option.count}
                          </span>
                        )}
                      </FacetedItem>
                    ))}
                  </FacetedGroup>
                </FacetedList>
              </FacetedContent>
            </Faceted>
          );
        }
        case "date": {
          const dateValue = Array.isArray(filter.value)
            ? filter.value.filter(Boolean)
            : [filter.value, filter.value].filter(Boolean);

          const displayValue =
            filter.operator === "isBetween" && dateValue.length === 2
              ? `${formatDate(dateValue[0] ?? new Date())} - ${formatDate(
                  dateValue[1] ?? new Date(),
                )}`
              : dateValue[0]
                ? formatDate(dateValue[0])
                : "Pick a date";

          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={inputId}
                  aria-controls={`${inputId}-calendar`}
                  aria-label={`${filterField.label} date filter`}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start rounded text-left font-normal",
                    !filter.value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">{displayValue}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                id={`${inputId}-calendar`}
                align="start"
                className="w-auto origin-(--radix-popover-content-transform-origin) p-0"
                onCloseAutoFocus={() => {
                  document.getElementById(inputId)?.focus({
                    preventScroll: true,
                  });
                }}
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
                      onFilterUpdate(filter.filterId, {
                        value: date
                          ? [
                              date.from?.toISOString() ?? "",
                              date.to?.toISOString() ?? "",
                            ]
                          : [],
                      });
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
                      onFilterUpdate(filter.filterId, {
                        value: date?.toISOString() ?? "",
                      });
                    }}
                    initialFocus
                  />
                )}
              </PopoverContent>
            </Popover>
          );
        }
        case "boolean": {
          if (Array.isArray(filter.value)) return null;

          return (
            <Select
              value={filter.value}
              onValueChange={(value) =>
                onFilterUpdate(filter.filterId, {
                  value,
                })
              }
            >
              <SelectTrigger
                id={inputId}
                aria-controls={`${inputId}-listbox`}
                aria-label={`${filterField.label} boolean filter`}
                size="sm"
                className="w-full rounded dark:bg-transparent"
              >
                <SelectValue placeholder={filter.value ? "True" : "False"} />
              </SelectTrigger>
              <SelectContent id={`${inputId}-listbox`}>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          );
        }
        default:
          return null;
      }
    },
    [filterFields, onFilterUpdate],
  );

  return (
    <Sortable
      value={filters}
      getItemValue={(item) => item.filterId}
      onMove={({ activeIndex, overIndex }) =>
        onFilterMove(activeIndex, overIndex)
      }
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            aria-label="Open filters"
            variant="outline"
            size="sm"
            className="[&>svg]:size-3"
          >
            <ListFilter aria-hidden="true" />
            Filters
            {filters.length > 0 && (
              <Badge
                variant="secondary"
                className="h-[1.14rem] rounded-[0.2rem] px-[0.32rem] font-mono font-normal text-[0.65rem]"
              >
                {filters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          aria-describedby={descriptionId}
          aria-labelledby={labelId}
          align="start"
          collisionPadding={16}
          className="flex w-[calc(100vw-(--spacing(12)))] min-w-60 origin-(--radix-popover-content-transform-origin) flex-col gap-3.5 p-4 sm:w-[36rem]"
        >
          <div className="flex flex-col gap-1">
            <h4 id={labelId} className="font-medium leading-none">
              {filters.length > 0 ? "Filters" : "No filters applied"}
            </h4>
            <p
              id={descriptionId}
              className={cn(
                "text-muted-foreground text-sm",
                filters.length > 0 && "sr-only",
              )}
            >
              {filters.length > 0
                ? "Modify filters to refine your results."
                : "Add filters to refine your results."}
            </p>
          </div>
          {filters.length > 0 ? (
            <SortableContent asChild>
              <div
                role="list"
                className="flex max-h-[300px] flex-col gap-2 overflow-y-auto py-0.5 pr-1"
              >
                {filters.map((filter, index) => {
                  const filterItemId = `${id}-filter-${filter.filterId}`;
                  const joinOperatorListboxId = `${filterItemId}-join-operator-listbox`;
                  const fieldListboxId = `${filterItemId}-field-listbox`;
                  const fieldTriggerId = `${filterItemId}-field-trigger`;
                  const operatorListboxId = `${filterItemId}-operator-listbox`;
                  const inputId = `${filterItemId}-input`;

                  return (
                    <SortableItem
                      key={filter.filterId}
                      value={filter.filterId}
                      asChild
                    >
                      <div
                        role="listitem"
                        id={filterItemId}
                        tabIndex={-1}
                        className="flex items-center gap-2"
                      >
                        <div className="min-w-[4.5rem] text-center">
                          {index === 0 ? (
                            <span className="text-muted-foreground text-sm">
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
                                size="sm"
                                className="rounded lowercase dark:bg-transparent"
                              >
                                <SelectValue placeholder={joinOperator} />
                              </SelectTrigger>
                              <SelectContent
                                id={joinOperatorListboxId}
                                position="popper"
                                className="min-w-(--radix-select-trigger-width) lowercase"
                              >
                                {dataTableConfig.joinOperators.map(
                                  (joinOperator) => (
                                    <SelectItem
                                      key={joinOperator}
                                      value={joinOperator}
                                    >
                                      {joinOperator}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              {joinOperator}
                            </span>
                          )}
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id={fieldTriggerId}
                              variant="outline"
                              size="sm"
                              role="combobox"
                              aria-label="Select filter field"
                              aria-controls={fieldListboxId}
                              className="w-32 justify-between rounded"
                            >
                              <span className="truncate">
                                {filterFields.find(
                                  (field) => field.id === filter.id,
                                )?.label ?? "Select field"}
                              </span>
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            id={fieldListboxId}
                            align="start"
                            className="w-40 origin-(--radix-popover-content-transform-origin) p-0"
                          >
                            <Command>
                              <CommandInput placeholder="Search fields..." />
                              <CommandList>
                                <CommandEmpty>No fields found.</CommandEmpty>
                                <CommandGroup>
                                  {filterFields.map((field) => (
                                    <CommandItem
                                      key={field.id}
                                      value={field.id}
                                      onSelect={(value) => {
                                        const filterField = filterFields.find(
                                          (col) => col.id === value,
                                        );

                                        if (!filterField) return;

                                        onFilterUpdate(filter.filterId, {
                                          id: value as Extract<
                                            keyof TData,
                                            string
                                          >,
                                          variant: filterField.variant,
                                          operator:
                                            getFilterOperators(
                                              filterField.variant,
                                            )[0]?.value ??
                                            (filterField.variant === "text"
                                              ? "iLike"
                                              : "eq"),
                                          value: "",
                                        });
                                      }}
                                    >
                                      <span className="truncate">
                                        {field.label}
                                      </span>
                                      <Check
                                        className={cn(
                                          "ml-auto size-4 shrink-0",
                                          field.id === filter.id
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
                          value={filter.operator}
                          onValueChange={(value: FilterOperator) =>
                            onFilterUpdate(filter.filterId, {
                              operator: value,
                              value:
                                value === "isEmpty" || value === "isNotEmpty"
                                  ? ""
                                  : filter.value,
                            })
                          }
                        >
                          <SelectTrigger
                            aria-label="Select filter operator"
                            aria-controls={operatorListboxId}
                            size="sm"
                            className="w-32 rounded dark:bg-transparent"
                          >
                            <div className="truncate">
                              <SelectValue placeholder={filter.operator} />
                            </div>
                          </SelectTrigger>
                          <SelectContent
                            id={operatorListboxId}
                            className="origin-(--radix-select-content-transform-origin)"
                          >
                            {getFilterOperators(filter.variant).map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="min-w-36 flex-1">
                          {onFilterInputRender({ filter, inputId })}
                        </div>
                        <Button
                          aria-label={`Remove filter ${index + 1}`}
                          variant="outline"
                          size="icon"
                          className="size-8 shrink-0 rounded [&>svg]:size-3.5"
                          onClick={() => onFilterRemove(filter.filterId)}
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
              onClick={onFilterAdd}
            >
              Add filter
            </Button>
            {filters.length > 0 ? (
              <Button
                size="sm"
                variant="outline"
                className="rounded"
                onClick={() => {
                  void setFilters(null);
                  void setJoinOperator("and");
                }}
              >
                Reset filters
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
      <SortableOverlay>
        <div className="flex items-center gap-2">
          <div className="h-8 min-w-[4.5rem] rounded-sm bg-primary/10" />
          <div className="h-8 w-32 rounded-sm bg-primary/10" />
          <div className="h-8 w-32 rounded-sm bg-primary/10" />
          <div className="h-8 min-w-36 flex-1 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
        </div>
      </SortableOverlay>
    </Sortable>
  );
}
