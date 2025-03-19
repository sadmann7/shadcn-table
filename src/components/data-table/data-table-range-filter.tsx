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
import { PlusCircle, Settings2, XCircle } from "lucide-react";

interface DataTableRangeFilterProps<TData> {
  column: Column<TData, unknown>;
  title?: string;
}

export function DataTableRangeFilter<TData>({
  column,
  title,
}: DataTableRangeFilterProps<TData>) {
  const id = React.useId();
  const columnFilterValue = column.getFilterValue() as
    | [number, number]
    | undefined;

  const unit = column.columnDef.meta?.unit;

  const [min, max] = React.useMemo(() => {
    const range = column.columnDef.meta?.range;
    if (range) return range;

    const values = column.getFacetedMinMaxValues();
    if (!values) return [0, 100];

    return [values[0], values[1]];
  }, [column]);

  const [range, setRange] = React.useState<[number, number]>(
    columnFilterValue ?? [min, max],
  );

  const onRangeChange = React.useCallback(
    (values: [number, number]) => {
      setRange(values);
      column.setFilterValue(values);
    },
    [column],
  );

  const onReset = React.useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      setRange([min, max]);
      column.setFilterValue(undefined);
    },
    [column, min, max],
  );

  const formatValue = React.useCallback((value: number) => {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-dashed hover:bg-accent/50"
        >
          <div className="flex items-center gap-2">
            {columnFilterValue ? (
              <div
                aria-label="Clear filter"
                role="button"
                tabIndex={0}
                onClick={onReset}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none data-[state=open]:bg-accent"
              >
                <XCircle className="size-4" />
              </div>
            ) : (
              <PlusCircle className="size-4" />
            )}
          </div>
          <span>{title}</span>
          {columnFilterValue ? (
            <>
              <Separator orientation="vertical" className="mx-0.5 h-4" />
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
                min={min}
                max={max}
                value={range[0]}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (value > range[1]) return;
                  onRangeChange([value, range[1]]);
                }}
                className="h-8 w-24 pr-8"
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
                min={min}
                max={max}
                value={range[1]}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (value < range[0]) return;
                  onRangeChange([range[0], value]);
                }}
                className="h-8 w-24 pr-8"
              />
              {unit && (
                <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                  {unit}
                </span>
              )}
            </div>
          </div>
          <Slider
            aria-label="Select range"
            min={min}
            max={max}
            value={range}
            onValueChange={(value) => onRangeChange(value as [number, number])}
            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          />
        </div>
        <Button
          aria-label="Reset range filter"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="px-3 text-xs"
        >
          Reset
        </Button>
      </PopoverContent>
    </Popover>
  );
}
