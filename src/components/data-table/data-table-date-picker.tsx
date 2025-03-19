"use client";

import type { Column } from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DateSelection = Date[] | DateRange;

function isDateRange(value: DateSelection): value is DateRange {
  return "from" in value && "to" in value;
}

interface DataTableDatePickerProps<TData> {
  column: Column<TData, unknown>;
  multiple?: boolean;
}

export function DataTableDatePicker<TData>({
  column,
  multiple = false,
}: DataTableDatePickerProps<TData>) {
  const columnFilterValue = column.getFilterValue();

  const selectedDates = React.useMemo<DateSelection>(() => {
    if (!columnFilterValue) {
      return multiple ? { from: undefined, to: undefined } : [];
    }

    function validateDate(timestamp: number | string | undefined) {
      if (!timestamp) return undefined;
      const numericTimestamp =
        typeof timestamp === "string" ? Number(timestamp) : timestamp;
      const date = new Date(numericTimestamp);
      return !Number.isNaN(date.getTime()) ? date : undefined;
    }

    if (multiple) {
      let timestamps: (number | string | undefined)[] = [];

      if (Array.isArray(columnFilterValue)) {
        // Handle array of strings case ["timestamp1,timestamp2"]
        if (
          typeof columnFilterValue[0] === "string" &&
          columnFilterValue[0].includes(",")
        ) {
          timestamps = columnFilterValue[0].split(",");
        } else {
          timestamps = columnFilterValue as (number | string)[];
        }
      } else if (typeof columnFilterValue === "string") {
        timestamps = columnFilterValue.split(",");
      }

      return {
        from: validateDate(timestamps[0]),
        to: validateDate(timestamps[1]),
      };
    }

    let timestamp: number | string | undefined;

    if (Array.isArray(columnFilterValue) && columnFilterValue.length > 0) {
      const firstValue = columnFilterValue[0];
      if (typeof firstValue === "string" || typeof firstValue === "number") {
        timestamp = firstValue;
      }
    } else if (typeof columnFilterValue === "string") {
      timestamp = columnFilterValue;
    } else if (typeof columnFilterValue === "number") {
      timestamp = columnFilterValue;
    }

    const date = validateDate(timestamp);
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
      } else if (
        !multiple &&
        "getTime" in date &&
        !Number.isNaN(date.getTime())
      ) {
        column.setFilterValue(date.getTime());
      }
    },
    [column, multiple],
  );

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
      if (range.from && range.to) {
        return `${formatSelectedDate(range.from)} - ${formatSelectedDate(range.to)}`;
      }
      if (range.from) {
        return formatSelectedDate(range.from);
      }
      if (range.to) {
        return formatSelectedDate(range.to);
      }
      return "";
    },
    [formatSelectedDate],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          <CalendarIcon />
          {multiple
            ? (() => {
                if (!isDateRange(selectedDates)) return null;
                return selectedDates.from || selectedDates.to ? (
                  <span className="hidden lg:inline">
                    {formatDateRange(selectedDates)}
                  </span>
                ) : (
                  <span>
                    {column.columnDef.meta?.label ?? "Pick a date range"}
                  </span>
                );
              })()
            : (() => {
                if (isDateRange(selectedDates)) return null;
                return selectedDates.length > 0 ? (
                  <span className="hidden lg:inline">
                    {formatSelectedDate(selectedDates[0])}
                  </span>
                ) : (
                  <span>{column.columnDef.meta?.label ?? "Pick a date"}</span>
                );
              })()}
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
            onSelect={(dates) => onSelect(dates)}
            numberOfMonths={1}
          />
        ) : (
          <Calendar
            initialFocus
            mode="single"
            selected={
              !isDateRange(selectedDates) ? selectedDates[0] : undefined
            }
            onSelect={(date) => onSelect(date)}
            numberOfMonths={1}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
