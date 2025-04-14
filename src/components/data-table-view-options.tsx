"use client";

import type { Table } from "@tanstack/react-table";
import type { Task } from "@/db/schema"; // Assuming Task type is accessible
import { Check, ChevronsUpDown, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import * as React from "react";

// Define the structure for available columns prop matching TasksTable
interface AvailableColumn {
  id: keyof Task; // Use keyof Task for better type safety
  label: string;
}

// Update props interface
interface DataTableViewOptionsProps {
  availableColumns: AvailableColumn[];
  selectedColumns: string[]; // Array of selected column IDs
  onColumnsChange: (newColumns: string[]) => void; // Callback function
}

export function DataTableViewOptions({
  availableColumns,
  selectedColumns,
  onColumnsChange,
}: DataTableViewOptionsProps) {
  const handleSelect = (columnId: string) => {
    const newSelectedColumns = selectedColumns.includes(columnId)
      ? selectedColumns.filter((id) => id !== columnId) // Deselect
      : [...selectedColumns, columnId]; // Select
    onColumnsChange(newSelectedColumns);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Toggle columns"
          role="combobox"
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Settings2 className="size-4" />
          View
          <ChevronsUpDown className="ml-auto size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-0">
        <Command>
          <CommandInput placeholder="Search columns..." />
          <CommandList>
            <CommandEmpty>No columns found.</CommandEmpty>
            <CommandGroup>
              {/* Map over availableColumns instead of table.getAllColumns */}
              {Array.isArray(availableColumns) && availableColumns.map((column) => {
                const isSelected = selectedColumns.includes(column.id);
                return (
                  <CommandItem
                    key={column.id}
                    onSelect={() => handleSelect(column.id)} // Use the new handler
                  >
                    <span className="truncate">{column.label}</span>
                    <Check
                      className={cn(
                        "ml-auto size-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0", // Check based on selectedColumns prop
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
