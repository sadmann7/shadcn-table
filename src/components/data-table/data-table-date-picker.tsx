"use client";

import type { Column } from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarIcon, X, XCircle } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

type DateSelection = Date[] | DateRange;

function isDateRange(value: DateSelection): value is DateRange {
  return value && typeof value === "object" && !Array.isArray(value);
}

function validateDate(
  timestamp: number | string | undefined,
): Date | undefined {
  if (!timestamp) return undefined;
  const numericTimestamp =
    typeof timestamp === "string" ? Number(timestamp) : timestamp;
  const date = new Date(numericTimestamp);
  return !Number.isNaN(date.getTime()) ? date : undefined;
}

function parseColumnFilterValue(
  value: unknown,
): (number | string | undefined)[] {
  if (Array.isArray(value)) {
    if (typeof value[0] === "string" && /[^a-zA-Z0-9]/.test(value[0])) {
      return value[0].split(/[^a-zA-Z0-9]+/);
    }
    return value as (number | string)[];
  }
  if (typeof value === "string") {
    return value.split(/[^a-zA-Z0-9]+/);
  }
  return [value as number | string | undefined];
}

interface DataTableDatePickerProps<TData> {
  column: Column<TData, unknown>;
  multiple?: boolean;
}

export function DataTableDatePicker<TData>({
  column,
  multiple,
}: DataTableDatePickerProps<TData>) {
  const columnFilterValue = column.getFilterValue();

  const selectedDates = React.useMemo<DateSelection>(() => {
    if (!columnFilterValue) {
      return multiple ? { from: undefined, to: undefined } : [];
    }

    if (multiple) {
      const timestamps = parseColumnFilterValue(columnFilterValue);
      return {
        from: validateDate(timestamps[0]),
        to: validateDate(timestamps[1]),
      };
    }

    const timestamps = parseColumnFilterValue(columnFilterValue);
    const date = validateDate(timestamps[0]);
    return date ? [date] : [];
  }, [columnFilterValue, multiple]);

  const onSelect = React.useCallback(
    (date: Date | DateRange | undefined) => {
      if (!date) {
        column.setFilterValue(undefined);
        return;
      }

      if (multiple && !("getTime" in date)) {
        const from = date.from?.getTime();
        const to = date.to?.getTime();
        column.setFilterValue(from || to ? [from, to] : undefined);
      } else if (!multiple && "getTime" in date) {
        column.setFilterValue(date.getTime());
      }
    },
    [column, multiple],
  );

  const onReset = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      column.setFilterValue(undefined);
    },
    [column],
  );

  const hasValue = React.useMemo(() => {
    if (multiple) {
      if (!isDateRange(selectedDates)) return false;
      return selectedDates.from || selectedDates.to;
    }
    if (!Array.isArray(selectedDates)) return false;
    return selectedDates.length > 0;
  }, [multiple, selectedDates]);

  const formatSelectedDate = React.useCallback((date: Date | undefined) => {
    if (!date) return "";
    try {
      return format(date, "MMMM d, y");
    } catch {
      return "Invalid date";
    }
  }, []);

  const formatDateRange = React.useCallback(
    (range: DateRange) => {
      if (!range.from && !range.to) return "";
      if (range.from && range.to) {
        return `${formatSelectedDate(range.from)} - ${formatSelectedDate(range.to)}`;
      }
      return formatSelectedDate(range.from ?? range.to);
    },
    [formatSelectedDate],
  );

  const label = React.useMemo(() => {
    const columnName = column.columnDef.meta?.label ?? column.id;

    if (multiple) {
      if (!isDateRange(selectedDates)) return null;

      const hasSelectedDates = selectedDates.from || selectedDates.to;
      const dateText = hasSelectedDates
        ? formatDateRange(selectedDates)
        : "Select date range";

      return (
        <span className="flex items-center gap-2">
          <span>{columnName}</span>
          {hasSelectedDates && (
            <>
              <Separator orientation="vertical" className="mx-0.5 h-4" />
              <span>{dateText}</span>
            </>
          )}
        </span>
      );
    }

    if (isDateRange(selectedDates)) return null;

    const hasSelectedDate = selectedDates.length > 0;
    const dateText = hasSelectedDate
      ? formatSelectedDate(selectedDates[0])
      : "Select date";

    return (
      <span className="flex items-center gap-2">
        <span>{columnName}</span>
        {hasSelectedDate && (
          <>
            <Separator orientation="vertical" className="mx-0.5 h-4" />
            <span>{dateText}</span>
          </>
        )}
      </span>
    );
  }, [
    selectedDates,
    multiple,
    formatDateRange,
    formatSelectedDate,
    column.columnDef.meta?.label,
    column.id,
  ]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-dashed hover:bg-accent/50"
        >
          <div className="flex items-center gap-2">
            {hasValue ? (
              <div
                aria-label="Clear filter"
                role="button"
                tabIndex={0}
                onClick={onReset}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none data-[state=open]:bg-accent"
              >
                <XCircle />
              </div>
            ) : (
              <CalendarIcon />
            )}
          </div>
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {multiple ? (
          <Calendar
            initialFocus
            mode="range"
            selected={
              isDateRange(selectedDates)
                ? selectedDates
                : { from: undefined, to: undefined }
            }
            onSelect={onSelect}
            numberOfMonths={1}
          />
        ) : (
          <Calendar
            initialFocus
            mode="single"
            selected={
              !isDateRange(selectedDates) ? selectedDates[0] : undefined
            }
            onSelect={onSelect}
            numberOfMonths={1}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
