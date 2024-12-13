import type { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue> extends ButtonProps {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        column.toggleSorting(undefined);
      }}
      className={cn("-ml-3", className)}
      {...props}
    >
      <span>{title}</span>
      <span className="ml-2 flex flex-col">
        <ChevronUp
          className={cn(
            "-mb-0.5 h-3 w-3",
            column.getIsSorted() === "asc"
              ? "text-accent-foreground"
              : "text-muted-foreground"
          )}
        />
        <ChevronDown
          className={cn(
            "-mt-0.5 h-3 w-3",
            column.getIsSorted() === "desc"
              ? "text-accent-foreground"
              : "text-muted-foreground"
          )}
        />
      </span>
    </Button>
  );
}
