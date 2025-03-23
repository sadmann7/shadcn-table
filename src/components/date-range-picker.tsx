"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import * as React from "react";
import type { ButtonProps, DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps
  extends React.ComponentPropsWithoutRef<typeof PopoverContent> {
  defaultDateRange?: DateRange;
  placeholder?: string;
  triggerVariant?: Exclude<
    React.ComponentProps<typeof Button>["variant"],
    "destructive" | "link"
  >;
  triggerSize?: Exclude<React.ComponentProps<typeof Button>["size"], "icon">;
  triggerClassName?: string;
  shallow?: boolean;
}

export function DateRangePicker({
  defaultDateRange,
  placeholder = "Pick a date",
  triggerVariant = "outline",
  triggerSize = "default",
  triggerClassName,
  shallow = true,
  className,
  ...props
}: DateRangePickerProps) {
  const [dateParams, setDateParams] = useQueryStates(
    {
      from: parseAsString.withDefault(
        defaultDateRange?.from?.toISOString() ?? "",
      ),
      to: parseAsString.withDefault(defaultDateRange?.to?.toISOString() ?? ""),
    },
    {
      clearOnDefault: true,
      shallow,
    },
  );

  const date = React.useMemo(() => {
    function parseDate(dateString: string | null) {
      if (!dateString) return undefined;
      const parsedDate = new Date(dateString);
      return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
    }

    return {
      from: parseDate(dateParams.from) ?? defaultDateRange?.from,
      to: parseDate(dateParams.to) ?? defaultDateRange?.to,
    };
  }, [dateParams, defaultDateRange]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={cn(
            "w-full justify-start gap-2 truncate text-left font-normal",
            !date && "text-muted-foreground",
            triggerClassName,
          )}
        >
          <CalendarIcon className="size-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0", className)} {...props}>
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={(newDateRange) => {
            void setDateParams({
              from: newDateRange?.from?.toISOString() ?? "",
              to: newDateRange?.to?.toISOString() ?? "",
            });
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
