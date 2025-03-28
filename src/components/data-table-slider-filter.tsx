"use client";

import type { Column } from "@tanstack/react-table";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useCallbackRef } from "@/hooks/use-callback-ref";
import { cn } from "@/lib/utils";
import { PlusCircle, XCircle } from "lucide-react";

type RangeValue = [number, number];

function getIsValidRange(value: unknown): value is RangeValue {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  );
}

interface DataTableSliderFilterProps<TData> {
  column: Column<TData, unknown>;
  title?: string;
}

export function DataTableSliderFilter<TData>({
  column,
  title,
}: DataTableSliderFilterProps<TData>) {
  const id = React.useId();

  const columnFilterValue = getIsValidRange(column.getFilterValue())
    ? (column.getFilterValue() as RangeValue)
    : undefined;

  const defaultRange = column.columnDef.meta?.range;
  const unit = column.columnDef.meta?.unit;

  const [min, max] = React.useMemo((): RangeValue => {
    if (defaultRange && getIsValidRange(defaultRange)) return defaultRange;

    const values = column.getFacetedMinMaxValues();
    if (values && Array.isArray(values) && values.length === 2) {
      const [minVal, maxVal] = values;
      if (typeof minVal === "number" && typeof maxVal === "number") {
        return [minVal, maxVal];
      }
    }

    return [0, 100];
  }, [column, defaultRange]);

  const [range, setRange] = React.useState<RangeValue>(
    columnFilterValue ?? [min, max],
  );

  const onRangeChange = useCallbackRef((newRange: RangeValue) => {
    setRange(newRange);
  });

  React.useEffect(() => {
    onRangeChange(columnFilterValue ?? [min, max]);
  }, [columnFilterValue, min, max, onRangeChange]);

  const step = React.useMemo(() => {
    const rangeSize = max - min;
    if (rangeSize <= 20) return 1;
    if (rangeSize <= 100) return Math.ceil(rangeSize / 20);
    return Math.ceil(rangeSize / 50);
  }, [min, max]);

  const onReset = React.useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      column.setFilterValue(undefined);
    },
    [column],
  );

  const formatValue = React.useCallback((value: number) => {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
  }, []);

  const onFromInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = Number(event.target.value);
      if (!Number.isNaN(numValue) && numValue >= min && numValue <= range[1]) {
        const newRange: RangeValue = [numValue, range[1]];
        onRangeChange(newRange);
        column.setFilterValue(newRange);
      }
    },
    [column, min, range, onRangeChange],
  );

  const onToInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = Number(event.target.value);
      if (!Number.isNaN(numValue) && numValue <= max && numValue >= range[0]) {
        const newRange: RangeValue = [range[0], numValue];
        onRangeChange(newRange);
        column.setFilterValue(newRange);
      }
    },
    [column, max, range, onRangeChange],
  );

  const onSliderValueChange = React.useCallback(
    (value: RangeValue) => {
      if (Array.isArray(value) && value.length === 2) {
        onRangeChange(value);
      }
    },
    [onRangeChange],
  );

  const onSliderValueCommit = React.useCallback(
    (value: RangeValue) => {
      if (Array.isArray(value) && value.length === 2) {
        onRangeChange(value);
        column.setFilterValue(value);
      }
    },
    [column, onRangeChange],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          {columnFilterValue ? (
            <div
              role="button"
              aria-label={`Clear ${title} filter`}
              tabIndex={0}
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onClick={onReset}
            >
              <XCircle />
            </div>
          ) : (
            <PlusCircle />
          )}
          <span>{title}</span>
          {columnFilterValue ? (
            <>
              <Separator
                orientation="vertical"
                className="mx-0.5 data-[orientation=vertical]:h-4"
              />
              {formatValue(columnFilterValue[0])} -{" "}
              {formatValue(columnFilterValue[1])}
              {unit ? ` ${unit}` : ""}
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-auto flex-col gap-4">
        <div className="flex flex-col gap-3">
          <p className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {title}
          </p>
          <div className="flex items-center gap-4">
            <Label htmlFor={`${id}-from`} className="sr-only">
              From
            </Label>
            <div className="relative">
              <Input
                id={`${id}-from`}
                type="number"
                aria-valuemin={min}
                aria-valuemax={max}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={min.toString()}
                min={min}
                max={max}
                value={range[0].toString()}
                onChange={onFromInputChange}
                className={cn("h-8 w-24", unit && "pr-8")}
              />
              {unit && (
                <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                  {unit}
                </span>
              )}
            </div>
            <Label htmlFor={`${id}-to`} className="sr-only">
              to
            </Label>
            <div className="relative">
              <Input
                id={`${id}-to`}
                type="number"
                aria-valuemin={min}
                aria-valuemax={max}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={max.toString()}
                min={min}
                max={max}
                value={range[1].toString()}
                onChange={onToInputChange}
                className={cn("h-8 w-24", unit && "pr-8")}
              />
              {unit && (
                <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                  {unit}
                </span>
              )}
            </div>
          </div>
          <Label htmlFor={`${id}-slider`} className="sr-only">
            {title} slider
          </Label>
          <Slider
            id={`${id}-slider`}
            min={min}
            max={max}
            step={step}
            value={range}
            onValueChange={onSliderValueChange}
            onValueCommit={onSliderValueCommit}
          />
        </div>
        <Button
          aria-label={`Clear ${title} filter`}
          variant="outline"
          size="sm"
          onClick={onReset}
          className="px-3 text-xs"
        >
          Clear
        </Button>
      </PopoverContent>
    </Popover>
  );
}
