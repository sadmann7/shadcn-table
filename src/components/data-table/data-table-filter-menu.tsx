"use client";

import type { Column, Table } from "@tanstack/react-table";
import { CalendarIcon, Check, ListFilter, X } from "lucide-react";
import { useQueryState } from "nuqs";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { getDefaultFilterOperator } from "@/lib/data-table";
import { generateId } from "@/lib/id";
import { getFiltersStateParser } from "@/lib/parsers";
import { cn, formatDate } from "@/lib/utils";
import type { ExtendedColumnFilter } from "@/types/data-table";

const FILTERS_KEY = "filters";
const DEBOUNCE_MS = 300;
const THROTTLE_MS = 50;

interface DataTableFilterMenuProps<TData> {
  table: Table<TData>;
  debounceMs?: number;
  throttleMs?: number;
  shallow?: boolean;
}

export function DataTableFilterMenu<TData>({
  table,
  debounceMs = DEBOUNCE_MS,
  throttleMs = THROTTLE_MS,
  shallow = true,
}: DataTableFilterMenuProps<TData>) {
  const columns = React.useMemo(() => {
    return table
      .getAllColumns()
      .filter((column) => column.columnDef.enableColumnFilter);
  }, [table]);

  const [open, setOpen] = React.useState(false);
  const [selectedColumn, setSelectedColumn] =
    React.useState<Column<TData> | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

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

  const onFilterAdd = React.useCallback(
    (column: Column<TData>, value: string) => {
      if (!value.trim() && column.columnDef.meta?.variant !== "boolean") {
        return;
      }

      const filterValue =
        column.columnDef.meta?.variant === "multi-select" ? [value] : value;

      const newFilter: ExtendedColumnFilter<TData> = {
        id: column.id as Extract<keyof TData, string>,
        value: filterValue,
        variant: column.columnDef.meta?.variant ?? "text",
        operator: getDefaultFilterOperator(
          column.columnDef.meta?.variant ?? "text",
        ),
        filterId: generateId({ length: 8 }),
      };

      debouncedSetFilters([...filters, newFilter]);
      setSelectedColumn(null);
      setInputValue("");
      setOpen(false);
    },
    [filters, debouncedSetFilters],
  );

  const onFilterRemove = React.useCallback(
    (filterId: string) => {
      const updatedFilters = filters.filter(
        (filter) => filter.filterId !== filterId,
      );
      debouncedSetFilters(updatedFilters);
    },
    [filters, debouncedSetFilters],
  );

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

  const clearAllFilters = React.useCallback(() => {
    setFilters([]);
  }, [setFilters]);

  const onInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Backspace" && selectedColumn && !inputValue) {
        event.preventDefault();
        setSelectedColumn(null);
      }
    },
    [selectedColumn, inputValue],
  );

  const renderFilterValue = (filter: ExtendedColumnFilter<TData>) => {
    const column = columns.find((col) => col.id === filter.id);
    if (!column) return null;

    switch (filter.variant) {
      case "date":
      case "date-range":
        return (
          <DateFilterDisplay
            filter={filter}
            column={column}
            onUpdate={onFilterUpdate}
          />
        );

      case "select":
      case "multi-select":
        return (
          <SelectFilterDisplay
            filter={filter}
            column={column}
            onUpdate={onFilterUpdate}
          />
        );

      case "boolean":
        return (
          <BooleanFilterDisplay
            filter={filter}
            column={column}
            onUpdate={onFilterUpdate}
          />
        );

      default:
        return (
          <TextFilterDisplay
            filter={filter}
            column={column}
            onUpdate={onFilterUpdate}
          />
        );
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const column = columns.find((col) => col.id === filter.id);
            if (!column) return null;

            return (
              <Badge
                key={filter.filterId}
                variant="outline"
                className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs"
              >
                <span className="font-medium">
                  {column.columnDef.meta?.label ?? column.id}:
                </span>
                {renderFilterValue(filter)}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onFilterRemove(filter.filterId)}
                  className="ml-1 h-3.5 w-3.5 rounded-full p-0"
                >
                  <X className="h-2.5 w-2.5" />
                </Button>
              </Badge>
            );
          })}
          {filters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 rounded-sm text-xs"
              onClick={clearAllFilters}
            >
              Clear
            </Button>
          )}
        </div>
      )}
      <Popover
        open={open}
        onOpenChange={async (open) => {
          setOpen(open);

          await new Promise((resolve) => setTimeout(resolve, 100));

          if (!open) {
            setSelectedColumn(null);
            setInputValue("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "group flex h-6 items-center gap-1.5 rounded-sm text-xs transition",
              filters.length > 0 && "w-6",
            )}
          >
            <ListFilter className="size-3 text-muted-foreground transition-all group-hover:text-primary" />
            {!filters.length && "Filter"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <Command className="[&_[data-slot=command-input-wrapper]_svg]:hidden">
            <CommandInput
              placeholder={
                selectedColumn
                  ? (selectedColumn.columnDef.meta?.label ?? selectedColumn.id)
                  : "Filter..."
              }
              className="h-9"
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={onInputKeyDown}
            />
            <CommandList>
              {selectedColumn ? (
                <>
                  {selectedColumn?.columnDef.meta?.options && (
                    <CommandEmpty>No results found.</CommandEmpty>
                  )}
                  <FilterValueSelector
                    column={selectedColumn}
                    value={inputValue}
                    onSelect={(value) => onFilterAdd(selectedColumn, value)}
                  />
                </>
              ) : (
                <>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {columns.map((column) => (
                      <CommandItem
                        key={column.id}
                        value={column.id}
                        onSelect={() => {
                          setSelectedColumn(column);
                          setInputValue("");
                          requestAnimationFrame(() => {
                            inputRef.current?.focus();
                          });
                        }}
                        className="group flex items-center gap-2 text-sm"
                      >
                        <span>{column.columnDef.meta?.label ?? column.id}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface FilterValueSelectorProps<TData> {
  column: Column<TData>;
  value: string;
  onSelect: (value: string) => void;
}

function FilterValueSelector<TData>({
  column,
  value,
  onSelect,
}: FilterValueSelectorProps<TData>) {
  const variant = column.columnDef.meta?.variant ?? "text";

  switch (variant) {
    case "boolean":
      return (
        <CommandGroup>
          <CommandItem value="true" onSelect={() => onSelect("true")}>
            True
          </CommandItem>
          <CommandItem value="false" onSelect={() => onSelect("false")}>
            False
          </CommandItem>
        </CommandGroup>
      );

    case "select":
    case "multi-select":
      return (
        <>
          <CommandGroup>
            {column.columnDef.meta?.options?.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => onSelect(option.value)}
              >
                {option.icon && <option.icon />}
                <span className="truncate">{option.label}</span>
                {option.count && (
                  <span className="ml-auto font-mono text-xs">
                    {option.count}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      );

    case "date":
    case "date-range":
      return (
        <div className="p-2">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => {
              if (date) {
                onSelect(date.toISOString());
              }
            }}
            initialFocus
          />
        </div>
      );

    default:
      return (
        <CommandGroup>
          <CommandItem
            value={value}
            className="justify-center"
            onSelect={() => onSelect(value)}
            disabled={value.trim() === ""}
          >
            <Check />
            Apply filter
          </CommandItem>
        </CommandGroup>
      );
  }
}

interface FilterDisplayProps<TData> {
  filter: ExtendedColumnFilter<TData>;
  column: Column<TData>;
  onUpdate: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>,
  ) => void;
}

function TextFilterDisplay<TData>({
  filter,
  column,
}: FilterDisplayProps<TData>) {
  let displayValue = "";

  if (filter.operator === "isEmpty") {
    displayValue = "is empty";
  } else if (filter.operator === "isNotEmpty") {
    displayValue = "is not empty";
  } else if (typeof filter.value === "string") {
    displayValue = filter.value;
  }

  return <span className="max-w-[100px] truncate">{displayValue}</span>;
}

function DateFilterDisplay<TData>({
  filter,
  column,
}: FilterDisplayProps<TData>) {
  if (filter.operator === "isEmpty") return <span>is empty</span>;
  if (filter.operator === "isNotEmpty") return <span>is not empty</span>;

  if (
    filter.operator === "isBetween" &&
    Array.isArray(filter.value) &&
    filter.value.length === 2
  ) {
    return (
      <span className="flex items-center gap-1">
        <CalendarIcon className="h-3 w-3" />
        <span className="max-w-[80px] truncate">
          {formatDate(filter.value[0] || "")} -{" "}
          {formatDate(filter.value[1] || "")}
        </span>
      </span>
    );
  }

  const date = Array.isArray(filter.value) ? filter.value[0] : filter.value;

  return (
    <span className="flex items-center gap-1">
      <CalendarIcon className="h-3 w-3" />
      <span className="max-w-[80px] truncate">{formatDate(date || "")}</span>
    </span>
  );
}

function SelectFilterDisplay<TData>({
  filter,
  column,
}: FilterDisplayProps<TData>) {
  if (filter.operator === "isEmpty") return <span>is empty</span>;
  if (filter.operator === "isNotEmpty") return <span>is not empty</span>;

  if (Array.isArray(filter.value)) {
    if (filter.value.length === 0) return null;

    const options = column.columnDef.meta?.options ?? [];
    const selectedOptions = filter.value
      .map((val) => options.find((opt) => opt.value === val))
      .filter(Boolean);

    return (
      <span className="max-w-[100px] truncate">
        {selectedOptions.length > 1
          ? `${selectedOptions.length} items`
          : (selectedOptions[0]?.label ?? filter.value[0])}
      </span>
    );
  }

  const option = column.columnDef.meta?.options?.find(
    (opt) => opt.value === filter.value,
  );
  return (
    <span className="max-w-[100px] truncate">
      {option?.label ?? filter.value}
    </span>
  );
}

function BooleanFilterDisplay<TData>({ filter }: FilterDisplayProps<TData>) {
  const value = typeof filter.value === "string" ? filter.value : "";
  return <span>{value === "true" ? "true" : "false"}</span>;
}
