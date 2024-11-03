import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from "@radix-ui/react-icons"
import { SelectIcon } from "@radix-ui/react-select"
import { type Column } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        defaultValue={column.getIsSorted() === "desc" ? "desc" : "asc"}
        onValueChange={(value) => {
          if (value === "asc") column.toggleSorting(false)
          else if (value === "desc") column.toggleSorting(true)
          else if (value === "hide") column.toggleVisibility(false)
        }}
      >
        <SelectTrigger
          aria-label={
            column.getIsSorted() === "desc"
              ? "Sorted descending. Click to sort ascending."
              : column.getIsSorted() === "asc"
                ? "Sorted ascending. Click to sort descending."
                : "Not sorted. Click to sort ascending."
          }
          className="-ml-3 h-8 w-fit border-none text-xs hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent [&>svg:last-child]:hidden"
        >
          {title}
          <SelectIcon asChild>
            {column.getCanSort() && column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2.5 size-4" aria-hidden="true" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2.5 size-4" aria-hidden="true" />
            ) : (
              <CaretSortIcon className="ml-2.5 size-4" aria-hidden="true" />
            )}
          </SelectIcon>
        </SelectTrigger>
        <SelectContent align="start">
          {column.getCanSort() && (
            <>
              <SelectItem value="asc">
                <span className="flex items-center">
                  <ArrowUpIcon
                    className="mr-2 size-3.5 text-muted-foreground/70"
                    aria-hidden="true"
                  />
                  Asc
                </span>
              </SelectItem>
              <SelectItem value="desc">
                <span className="flex items-center">
                  <ArrowDownIcon
                    className="mr-2 size-3.5 text-muted-foreground/70"
                    aria-hidden="true"
                  />
                  Desc
                </span>
              </SelectItem>
            </>
          )}
          {column.getCanHide() && (
            <SelectItem value="hide">
              <span className="flex items-center">
                <EyeNoneIcon
                  className="mr-2 size-3.5 text-muted-foreground/70"
                  aria-hidden="true"
                />
                Hide
              </span>
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
