"use client"

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { MixerHorizontalIcon } from "@radix-ui/react-icons"
import { type Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const hideAbleColumns = table.getAllColumns().filter(
    (column) => typeof column.accessorFn !== "undefined" && column.getCanHide()
  );
  return (
    <>
      {hideAbleColumns.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto hidden h-8 lg:flex"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px]">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hideAbleColumns.map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.isVisible}
                  onCheckedChange={(value) =>
                    column.toggleHidden(!!value)
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
}
