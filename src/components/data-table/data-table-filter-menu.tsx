"use client";

import type { Column, Table } from "@tanstack/react-table";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  ListFilter,
  X,
} from "lucide-react";
import { useQueryState } from "nuqs";
import * as React from "react";

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
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { getDefaultFilterOperator, getFilterOperators } from "@/lib/data-table";
import { generateId } from "@/lib/id";
import { getFiltersStateParser } from "@/lib/parsers";
import { cn, formatDate } from "@/lib/utils";
import type { ExtendedColumnFilter, FilterOperator } from "@/types/data-table";

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

  const onInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace" && !inputValue && selectedColumn) {
        event.preventDefault();
        setSelectedColumn(null);
      }
    },
    [inputValue, selectedColumn],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => {
        const column = columns.find((col) => col.id === filter.id);
        if (!column) return null;

        return (
          <div
            key={filter.filterId}
            className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1"
          >
            {column.columnDef.meta?.icon && (
              <column.columnDef.meta.icon className="size-4 text-muted-foreground" />
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-1 py-0.5 font-normal text-sm"
                >
                  {column.columnDef.meta?.label ?? column.id}
                  <ChevronsUpDown className="ml-1 size-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-48 p-0">
                <Command>
                  <CommandInput placeholder="Search fields..." />
                  <CommandList>
                    <CommandEmpty>No fields found.</CommandEmpty>
                    <CommandGroup>
                      {columns.map((col) => (
                        <CommandItem
                          key={col.id}
                          value={col.id}
                          onSelect={() => {
                            onFilterUpdate(filter.filterId, {
                              id: col.id as Extract<keyof TData, string>,
                              variant: col.columnDef.meta?.variant ?? "text",
                              operator: getDefaultFilterOperator(
                                col.columnDef.meta?.variant ?? "text",
                              ),
                              value: "",
                            });
                          }}
                        >
                          {col.columnDef.meta?.icon && (
                            <col.columnDef.meta.icon />
                          )}
                          <span className="truncate">
                            {col.columnDef.meta?.label ?? col.id}
                          </span>
                          <Check
                            className={cn(
                              "ml-auto",
                              col.id === filter.id
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
              onValueChange={(value) =>
                onFilterUpdate(filter.filterId, {
                  operator: value as FilterOperator,
                  value:
                    value === "isEmpty" || value === "isNotEmpty"
                      ? ""
                      : filter.value,
                })
              }
            >
              <SelectTrigger className="h-auto border-0 bg-transparent px-1 py-0.5 font-normal text-sm shadow-none [&>svg]:size-3">
                <SelectValue placeholder={filter.operator} />
              </SelectTrigger>
              <SelectContent>
                {getFilterOperators(filter.variant).map((operator) => (
                  <SelectItem
                    key={operator.value}
                    value={operator.value}
                    className="text-sm"
                  >
                    {operator.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderFilterInput({
              filter,
              column,
              onFilterUpdate,
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterRemove(filter.filterId)}
              className="-mr-2 h-auto px-1 py-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </Button>
          </div>
        );
      })}
      <Popover
        open={open}
        onOpenChange={async (open) => {
          setOpen(open);

          if (!open) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            setSelectedColumn(null);
            setInputValue("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <ListFilter />
            Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <Command className="[&_[cmdk-input-wrapper]_svg]:hidden">
            <CommandInput
              ref={inputRef}
              placeholder={
                selectedColumn
                  ? (selectedColumn.columnDef.meta?.label ?? selectedColumn.id)
                  : "Search fields..."
              }
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={onInputKeyDown}
            />
            <CommandList>
              {selectedColumn ? (
                <>
                  {selectedColumn.columnDef.meta?.options && (
                    <CommandEmpty>No options found.</CommandEmpty>
                  )}
                  <FilterValueSelector
                    column={selectedColumn}
                    value={inputValue}
                    onSelect={(value) => onFilterAdd(selectedColumn, value)}
                  />
                </>
              ) : (
                <>
                  <CommandEmpty>No fields found.</CommandEmpty>
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
                      >
                        {column.columnDef.meta?.icon && (
                          <column.columnDef.meta.icon />
                        )}
                        <span className="truncate">
                          {column.columnDef.meta?.label ?? column.id}
                        </span>
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
            onSelect={() => onSelect(value)}
            disabled={!value.trim()}
            className="justify-center"
          >
            <Check className="mr-2 size-4" />
            Apply filter
          </CommandItem>
        </CommandGroup>
      );
  }
}

function renderFilterInput<TData>({
  filter,
  column,
  onFilterUpdate,
}: {
  filter: ExtendedColumnFilter<TData>;
  column: Column<TData>;
  onFilterUpdate: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>,
  ) => void;
}) {
  if (filter.operator === "isEmpty" || filter.operator === "isNotEmpty") {
    return null;
  }

  switch (filter.variant) {
    case "text":
    case "number":
    case "range": {
      const isNumber =
        filter.variant === "number" || filter.variant === "range";
      return (
        <Input
          type={isNumber ? "number" : "text"}
          placeholder={column.columnDef.meta?.placeholder ?? "Enter value..."}
          className="h-auto w-[120px] border-0 bg-transparent px-1 py-0.5 text-sm shadow-none"
          value={typeof filter.value === "string" ? filter.value : ""}
          onChange={(e) =>
            onFilterUpdate(filter.filterId, { value: e.target.value })
          }
        />
      );
    }

    case "boolean":
      return (
        <Select
          value={typeof filter.value === "string" ? filter.value : "true"}
          onValueChange={(value: "true" | "false") =>
            onFilterUpdate(filter.filterId, { value })
          }
        >
          <SelectTrigger className="h-auto border-0 bg-transparent px-1 py-0.5 text-sm shadow-none [&>svg]:size-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      );

    case "select":
    case "multi-select": {
      const options = column.columnDef.meta?.options ?? [];
      const selectedValues = Array.isArray(filter.value)
        ? filter.value
        : [filter.value];

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-1 py-0.5 font-normal text-sm"
            >
              {selectedValues.length > 0
                ? `${selectedValues.length} selected`
                : "Select..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search options..." />
              <CommandList>
                <CommandEmpty>No options found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        const value =
                          filter.variant === "multi-select"
                            ? selectedValues.includes(option.value)
                              ? selectedValues.filter((v) => v !== option.value)
                              : [...selectedValues, option.value]
                            : option.value;
                        onFilterUpdate(filter.filterId, { value });
                      }}
                    >
                      {option.icon && <option.icon />}
                      <span className="truncate">{option.label}</span>
                      {filter.variant === "multi-select" && (
                        <Check
                          className={cn(
                            "ml-auto",
                            selectedValues.includes(option.value)
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    }

    case "date":
    case "date-range": {
      const dateValue = Array.isArray(filter.value)
        ? filter.value.filter(Boolean)
        : [filter.value].filter(Boolean);

      const formatDateSafely = (dateStr: string | undefined) => {
        if (!dateStr) return "";
        try {
          return formatDate(new Date(dateStr));
        } catch {
          return "";
        }
      };

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-1 py-0.5 font-normal text-sm"
            >
              <CalendarIcon className="mr-1 size-3" />
              {dateValue.length > 0
                ? filter.operator === "isBetween" && dateValue.length === 2
                  ? `${formatDateSafely(dateValue[0])} - ${formatDateSafely(dateValue[1])}`
                  : formatDateSafely(dateValue[0])
                : "Pick date..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            {filter.operator === "isBetween" ? (
              <Calendar
                mode="range"
                selected={{
                  from: dateValue[0] ? new Date(dateValue[0]) : undefined,
                  to: dateValue[1] ? new Date(dateValue[1]) : undefined,
                }}
                onSelect={(date: { from?: Date; to?: Date } | undefined) => {
                  if (date) {
                    onFilterUpdate(filter.filterId, {
                      value: [
                        date.from?.toISOString() ?? "",
                        date.to?.toISOString() ?? "",
                      ],
                    });
                  }
                }}
                initialFocus
              />
            ) : (
              <Calendar
                mode="single"
                selected={dateValue[0] ? new Date(dateValue[0]) : undefined}
                onSelect={(date: Date | undefined) => {
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
}
