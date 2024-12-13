"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { kbdVariants } from "@/components/custom/kbd";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { presets as defaultPresets } from "@/constants/date-preset";
import type { DatePreset } from "@/components/data-table/types";

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  presets?: DatePreset[];
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
  presets = defaultPresets,
}: DatePickerWithRangeProps) {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      presets.map((preset) => {
        if (preset.shortcut === e.key) {
          setDate({ from: preset.from, to: preset.to });
        }
      });
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setDate, presets]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            size="sm"
            className={cn(
              "max-w-full justify-start truncate text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <span className="truncate">
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </span>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex justify-between">
            <DatePresets onSelect={setDate} selected={date} presets={presets} />
            <Separator orientation="vertical" className="h-auto w-[px]" />
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
            />
          </div>
          <Separator />
          <CustomDateRange onSelect={setDate} selected={date} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function DatePresets({
  selected,
  onSelect,
  presets,
}: {
  selected: DateRange | undefined;
  onSelect: (date: DateRange | undefined) => void;
  presets: DatePreset[];
}) {
  return (
    <div className="flex flex-col gap-2 p-3">
      <p className="mx-3 text-xs uppercase text-muted-foreground">Date Range</p>
      <div className="grid gap-1">
        {presets.map(({ label, shortcut, from, to }) => {
          const isActive = selected?.from === from && selected?.to === to;
          return (
            <Button
              key={label}
              variant={isActive ? "outline" : "ghost"}
              size="sm"
              onClick={() => onSelect({ from, to })}
              className={cn(
                "flex items-center justify-between gap-6",
                !isActive && "border border-transparent"
              )}
            >
              <span className="mr-auto">{label}</span>
              <span className={cn(kbdVariants(), "uppercase")}>{shortcut}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// REMINDER: We can add min max date range validation https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#setting_maximum_and_minimum_dates_and_times
function CustomDateRange({
  selected,
  onSelect,
}: {
  selected: DateRange | undefined;
  onSelect: (date: DateRange | undefined) => void;
}) {
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(
    selected?.from
  );
  const [dateTo, setDateTo] = React.useState<Date | undefined>(selected?.to);
  const debounceDateFrom = useDebounce(dateFrom, 1000);
  const debounceDateTo = useDebounce(dateTo, 1000);

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return "";
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return utcDate.toISOString().slice(0, 16);
  };

  React.useEffect(() => {
    onSelect({ from: debounceDateFrom, to: debounceDateTo });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceDateFrom, debounceDateTo]);

  return (
    <div className="flex flex-col gap-2 p-3">
      <p className="text-xs uppercase text-muted-foreground">Custom Range</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="grid w-full gap-1.5">
          <Label htmlFor="from">Start</Label>
          <Input
            key={formatDateForInput(selected?.from)}
            type="datetime-local"
            id="from"
            name="from"
            defaultValue={formatDateForInput(selected?.from)}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (!Number.isNaN(newDate.getTime())) {
                setDateFrom(newDate);
              }
            }}
            disabled={!selected?.from}
          />
        </div>
        <div className="grid w-full gap-1.5">
          <Label htmlFor="to">End</Label>
          <Input
            key={formatDateForInput(selected?.to)}
            type="datetime-local"
            id="to"
            name="to"
            defaultValue={formatDateForInput(selected?.to)}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (!Number.isNaN(newDate.getTime())) {
                setDateTo(newDate);
              }
            }}
            disabled={!selected?.to}
          />
        </div>
      </div>
    </div>
  );
}
