"use client";

import type { Column, Table } from "@tanstack/react-table";
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
import { getDefaultFilterOperator, getFilterOperators } from "@/lib/data-table";
import { generateId } from "@/lib/id";
import { getFiltersStateParser } from "@/lib/parsers";
import { cn, formatDate } from "@/lib/utils";
import type {
  ExtendedColumnFilter,
  FilterOperator,
  JoinOperator,
} from "@/types/data-table";
import type { PopoverContentProps } from "@radix-ui/react-popover";

const FILTERS_KEY = "filters";
const JOIN_OPERATOR_KEY = "joinOperator";
const DEBOUNCE_MS = 300;
const THROTTLE_MS = 50;

interface DataTableFilterListProps<TData>
  extends Pick<
    PopoverContentProps,
    "align" | "alignOffset" | "collisionPadding" | "side" | "sideOffset"
  > {
  table: Table<TData>;
  debounceMs?: number;
  throttleMs?: number;
  shallow?: boolean;
}

export function DataTableFilterList<TData>({
  table,
  debounceMs = DEBOUNCE_MS,
  throttleMs = THROTTLE_MS,
  shallow = true,
  align = "center",
  side = "bottom",
  alignOffset = 0,
  sideOffset = 4,
  collisionPadding = 16,
}: DataTableFilterListProps<TData>) {
  const id = React.useId();
  const labelId = React.useId();
  const descriptionId = React.useId();

  const columns = React.useMemo(() => {
    return table
      .getAllColumns()
      .filter((column) => column.columnDef.enableColumnFilter);
  }, [table]);

  const [filters, setFilters] = useQueryState(
    FILTERS_KEY,
    getFiltersStateParser<TData>(columns.map((field) => field.id))
      .withDefault([])
      .withOptions({
        clearOnDefault: true,
        shallow,
        throttleMs,
      }),
  );
  const debouncedSetFilters = useDebouncedCallback(setFilters, debounceMs);

  const [joinOperator, setJoinOperator] = useQueryState(
    JOIN_OPERATOR_KEY,
    parseAsStringEnum(["and", "or"]).withDefault("and").withOptions({
      clearOnDefault: true,
      shallow,
    }),
  );

  const onFilterAdd = React.useCallback(() => {
    const column = columns[0];

    if (!column) return;

    const newFilter: ExtendedColumnFilter<TData> = {
      id: column.id as Extract<keyof TData, string>,
      value: "",
      variant: column.columnDef.meta?.variant ?? "text",
      operator: getDefaultFilterOperator(
        column.columnDef.meta?.variant ?? "text",
      ),
      filterId: generateId({ length: 8 }),
    };

    debouncedSetFilters([...filters, newFilter]);
  }, [columns, filters, debouncedSetFilters]);

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

  return (
    <Sortable
      value={filters}
      onValueChange={setFilters}
      getItemValue={(item) => item.filterId}
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
          align={align}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          side={side}
          sideOffset={sideOffset}
          className="flex w-[calc(100vw-(--spacing(12)))] min-w-60 origin-(--radix-popover-content-transform-origin) flex-col gap-3.5 p-4 sm:w-[38rem]"
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
                {filters.map((filter, index) => (
                  <FilterItem<TData>
                    key={filter.filterId}
                    filter={filter}
                    index={index}
                    filterItemId={`${id}-filter-${filter.filterId}`}
                    joinOperator={joinOperator}
                    setJoinOperator={setJoinOperator}
                    columns={columns}
                    onFilterUpdate={onFilterUpdate}
                    onFilterRemove={onFilterRemove}
                  />
                ))}
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

interface FilterItemProps<TData> {
  filter: ExtendedColumnFilter<TData>;
  index: number;
  filterItemId: string;
  joinOperator: JoinOperator;
  setJoinOperator: (value: JoinOperator) => void;
  columns: Column<TData>[];
  onFilterUpdate: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>,
  ) => void;
  onFilterRemove: (filterId: string) => void;
}

function FilterItem<TData>({
  filter,
  index,
  filterItemId,
  joinOperator,
  setJoinOperator,
  columns,
  onFilterUpdate,
  onFilterRemove,
}: FilterItemProps<TData>) {
  const joinOperatorListboxId = `${filterItemId}-join-operator-listbox`;
  const fieldListboxId = `${filterItemId}-field-listbox`;
  const fieldTriggerId = `${filterItemId}-field-trigger`;
  const operatorListboxId = `${filterItemId}-operator-listbox`;
  const inputId = `${filterItemId}-input`;
  const [showFieldSelector, setShowFieldSelector] = React.useState(false);

  const onFilterInputRender = React.useCallback(
    ({
      filter,
      inputId,
    }: { filter: ExtendedColumnFilter<TData>; inputId: string }) => {
      const column = columns.find((f) => f.id === filter.id);

      if (!column) return null;

      if (filter.operator === "isEmpty" || filter.operator === "isNotEmpty") {
        return (
          <div
            id={inputId}
            role="status"
            aria-live="polite"
            aria-label={`${column.columnDef.meta?.label} filter is ${
              filter.operator === "isEmpty" ? "empty" : "not empty"
            }`}
            className="h-8 w-full rounded border border-dashed"
          />
        );
      }

      switch (filter.variant) {
        case "text":
        case "number":
        case "range": {
          if (filter.variant === "range" && filter.operator === "isBetween") {
            return (
              <RangeFilter
                filter={filter}
                column={column}
                inputId={inputId}
                onFilterUpdate={onFilterUpdate}
              />
            );
          }

          const isNumber =
            filter.variant === "number" || filter.variant === "range";

          return (
            <Input
              id={inputId}
              type={isNumber ? "number" : filter.variant}
              aria-label={`${column.columnDef.meta?.label} filter value`}
              aria-describedby={`${inputId}-description`}
              inputMode={isNumber ? "numeric" : undefined}
              placeholder={
                column.columnDef.meta?.placeholder ?? "Enter a value..."
              }
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
                aria-label={`${column.columnDef.meta?.label} boolean filter`}
                size="sm"
                className="w-full rounded"
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
                  aria-label={`${column.columnDef.meta?.label} filter value`}
                  variant="outline"
                  size="sm"
                  className="w-full rounded px-1.5"
                >
                  <FacetedBadgeList
                    options={column.columnDef.meta?.options}
                    placeholder={
                      column.columnDef.meta?.placeholder ??
                      "Select an option..."
                    }
                  />
                </Button>
              </FacetedTrigger>
              <FacetedContent
                id={`${inputId}-listbox`}
                className="w-[12.5rem] origin-(--radix-popover-content-transform-origin)"
              >
                <FacetedInput
                  aria-label={`Search ${column.columnDef.meta?.label} options`}
                  placeholder={
                    column.columnDef.meta?.placeholder ?? "Search options..."
                  }
                />
                <FacetedList>
                  <FacetedEmpty>No options found.</FacetedEmpty>
                  <FacetedGroup>
                    {column.columnDef.meta?.options?.map((option) => (
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
                  aria-label={`${column.columnDef.meta?.label} filter values`}
                  variant="outline"
                  size="sm"
                  className="w-full rounded px-1.5"
                >
                  <FacetedBadgeList
                    options={column.columnDef.meta?.options}
                    placeholder={
                      column.columnDef.meta?.placeholder ?? " Select options..."
                    }
                  />
                </Button>
              </FacetedTrigger>
              <FacetedContent id={`${inputId}-listbox`}>
                <FacetedInput
                  aria-label={`Search ${column.columnDef.meta?.label} options`}
                  placeholder={
                    column.columnDef.meta?.placeholder ?? "Search options..."
                  }
                />
                <FacetedList>
                  <FacetedEmpty>No options found.</FacetedEmpty>
                  <FacetedGroup>
                    {column.columnDef.meta?.options?.map((option) => (
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

        case "date":
        case "date-range": {
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
                  aria-label={`${column.columnDef.meta?.label} date filter`}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start rounded text-left font-normal [&>svg]:size-3.5",
                    !filter.value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon />
                  <span className="truncate">{displayValue}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                id={`${inputId}-calendar`}
                align="start"
                className="w-auto origin-(--radix-popover-content-transform-origin) p-0"
              >
                {filter.operator === "isBetween" ? (
                  <Calendar
                    id={`${inputId}-calendar`}
                    mode="range"
                    aria-label={`Select ${column.columnDef.meta?.label} date range`}
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
                    aria-label={`Select ${column.columnDef.meta?.label} date`}
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

        default:
          return null;
      }
    },
    [columns, onFilterUpdate],
  );

  return (
    <SortableItem value={filter.filterId} asChild>
      <div
        role="listitem"
        id={filterItemId}
        tabIndex={-1}
        className="flex items-center gap-2"
      >
        <div className="min-w-[4.5rem] text-center">
          {index === 0 ? (
            <span className="text-muted-foreground text-sm">Where</span>
          ) : index === 1 ? (
            <Select
              value={joinOperator}
              onValueChange={(value: JoinOperator) => setJoinOperator(value)}
            >
              <SelectTrigger
                aria-label="Select join operator"
                aria-controls={joinOperatorListboxId}
                size="sm"
                className="rounded lowercase"
              >
                <SelectValue placeholder={joinOperator} />
              </SelectTrigger>
              <SelectContent
                id={joinOperatorListboxId}
                position="popper"
                className="min-w-(--radix-select-trigger-width) lowercase"
              >
                {dataTableConfig.joinOperators.map((joinOperator) => (
                  <SelectItem key={joinOperator} value={joinOperator}>
                    {joinOperator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-muted-foreground text-sm">
              {joinOperator}
            </span>
          )}
        </div>
        <Popover open={showFieldSelector} onOpenChange={setShowFieldSelector}>
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
                {columns.find((field) => field.id === filter.id)?.columnDef.meta
                  ?.label ?? "Select field"}
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
                  {columns.map((column) => (
                    <CommandItem
                      key={column.id}
                      value={column.id}
                      onSelect={(value) => {
                        const column = columns.find((col) => col.id === value);

                        if (!column) return;

                        onFilterUpdate(filter.filterId, {
                          id: value as Extract<keyof TData, string>,
                          variant: column.columnDef.meta?.variant ?? "text",
                          operator: getDefaultFilterOperator(
                            column.columnDef.meta?.variant ?? "text",
                          ),
                          value: "",
                        });

                        setShowFieldSelector(false);
                      }}
                    >
                      <span className="truncate">
                        {column.columnDef.meta?.label}
                      </span>
                      <Check
                        className={cn(
                          "ml-auto size-4 shrink-0",
                          column.id === filter.id ? "opacity-100" : "opacity-0",
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
            className="w-32 rounded lowercase"
          >
            <div className="truncate">
              <SelectValue placeholder={filter.operator} />
            </div>
          </SelectTrigger>
          <SelectContent
            id={operatorListboxId}
            className="origin-(--radix-select-content-transform-origin)"
          >
            {getFilterOperators(filter.variant).map((operator) => (
              <SelectItem
                key={operator.value}
                value={operator.value}
                className="lowercase"
              >
                {operator.label}
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
}

interface RangeFilterProps<TData> {
  filter: ExtendedColumnFilter<TData>;
  column: Column<TData>;
  inputId: string;
  onFilterUpdate: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>,
  ) => void;
}

function RangeFilter<TData>({
  filter,
  column,
  inputId,
  onFilterUpdate,
}: RangeFilterProps<TData>) {
  const meta = column.columnDef.meta;

  const [min, max] = React.useMemo(() => {
    const range = column.columnDef.meta?.range;
    if (range) return range;

    const values = column.getFacetedMinMaxValues();
    if (!values) return [0, 100];

    return [values[0], values[1]];
  }, [column]);

  const formatValue = React.useCallback(
    (value: string | number | undefined) => {
      if (value === undefined || value === "") return "";
      const numValue = Number(value);
      return Number.isNaN(numValue)
        ? ""
        : numValue.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          });
    },
    [],
  );

  const value = React.useMemo(() => {
    if (Array.isArray(filter.value)) return filter.value.map(formatValue);
    return [formatValue(filter.value), ""];
  }, [filter.value, formatValue]);

  const onRangeValueChange = React.useCallback(
    (value: string, isMin?: boolean) => {
      const numValue = Number(value);
      const currentValues = Array.isArray(filter.value)
        ? filter.value
        : ["", ""];
      const otherValue = isMin
        ? (currentValues[1] ?? "")
        : (currentValues[0] ?? "");

      if (
        value === "" ||
        (!Number.isNaN(numValue) &&
          (isMin
            ? numValue >= min && numValue <= (Number(otherValue) || max)
            : numValue <= max && numValue >= (Number(otherValue) || min)))
      ) {
        onFilterUpdate(filter.filterId, {
          value: isMin ? [value, otherValue] : [otherValue, value],
        });
      }
    },
    [filter.filterId, filter.value, min, max, onFilterUpdate],
  );

  return (
    <div className="flex w-full items-center gap-2">
      <Input
        id={`${inputId}-min`}
        type="number"
        aria-label={`${meta?.label} minimum value`}
        aria-valuemin={min}
        aria-valuemax={max}
        inputMode="numeric"
        placeholder={min.toString()}
        min={min}
        max={max}
        className="h-8 w-full rounded"
        defaultValue={value[0]}
        onChange={(event) => onRangeValueChange(event.target.value, true)}
      />
      <span className="sr-only shrink-0 text-muted-foreground">to</span>
      <Input
        id={`${inputId}-max`}
        type="number"
        aria-label={`${meta?.label} maximum value`}
        aria-valuemin={min}
        aria-valuemax={max}
        inputMode="numeric"
        placeholder={max.toString()}
        min={min}
        max={max}
        className="h-8 w-full rounded"
        defaultValue={value[1]}
        onChange={(event) => onRangeValueChange(event.target.value)}
      />
    </div>
  );
}
