"use client";

import type { ColumnDef, Table } from "@tanstack/react-table";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/custom/accordion";
import type React from "react";
import type { DataTableFilterField } from "./types";
import { DataTableFilterResetButton } from "./data-table-filter-reset-button";
import { DataTableFilterCheckbox } from "./data-table-filter-checkbox";
import { Button } from "@/components/ui/button";
import { DataTableFilterSlider } from "./data-table-filter-slider";
import { DataTableFilterInput } from "./data-table-filter-input";
import { DataTableFilterTimerange } from "./data-table-filter-timerange";
import { X } from "lucide-react";

// FIXME: use @container (especially for the slider element) to restructure elements

// TODO: only pass the columns to generate the filters!
// https://tanstack.com/table/v8/docs/framework/react/examples/filters
interface DataTableFilterControlsProps<TData, TValue> {
  table: Table<TData>;
  columns: ColumnDef<TData, TValue>[];
  filterFields?: DataTableFilterField<TData>[];
}

export function DataTableFilterControls<TData, TValue>({
  table,
  columns,
  filterFields,
}: DataTableFilterControlsProps<TData, TValue>) {
  const filters = table.getState().columnFilters;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-[46px] items-center justify-between gap-3">
        <p className="font-medium text-foreground px-2">Filters</p>
        <div>
          {filters.length ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetColumnFilters()}
            >
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
          ) : null}
        </div>
      </div>
      <Accordion
        type="multiple"
        // REMINDER: open all filters by default
        defaultValue={filterFields
          ?.filter(({ defaultOpen }) => defaultOpen)
          ?.map(({ value }) => value as string)}
      >
        {filterFields?.map((field) => {
          const value = field.value as string;
          return (
            <AccordionItem key={value} value={value} className="border-none">
              <AccordionTrigger className="px-2 py-0 hover:no-underline w-full">
                <div className="w-full flex items-center justify-between gap-2 truncate pr-2 py-2">
                  <div className="flex gap-2 items-center truncate">
                    <p className="text-sm font-medium text-foreground">
                      {field.label}
                    </p>
                    {value !== field.label.toLowerCase() &&
                    !field.commandDisabled ? (
                      <p className="text-muted-foreground text-[10px] font-mono mt-px truncate">
                        {value}
                      </p>
                    ) : null}
                  </div>
                  <DataTableFilterResetButton table={table} {...field} />
                </div>
              </AccordionTrigger>
              {/* REMINDER: avoid the focus state to be cut due to overflow-hidden */}
              <AccordionContent className="p-1">
                {(() => {
                  switch (field.type) {
                    case "checkbox": {
                      return (
                        <DataTableFilterCheckbox table={table} {...field} />
                      );
                    }
                    case "slider": {
                      return <DataTableFilterSlider table={table} {...field} />;
                    }
                    case "input": {
                      return <DataTableFilterInput table={table} {...field} />;
                    }
                    case "timerange": {
                      return (
                        <DataTableFilterTimerange table={table} {...field} />
                      );
                    }
                  }
                })()}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
