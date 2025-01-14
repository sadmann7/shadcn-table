"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import * as React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/custom/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Table } from "@tanstack/react-table";
import { Kbd } from "@/components/custom/kbd";
import { cn } from "@/lib/utils";

export interface DataTableSheetDetailsProps<TData> {
  table: Table<TData>;
  title?: string;
  titleClassName?: string;
  children?: React.ReactNode;
}

export function DataTableSheetDetails<TData>({
  table,
  title,
  titleClassName,
  children,
}: DataTableSheetDetailsProps<TData>) {
  const selectedRowKey =
    Object.keys(table.getState().rowSelection)?.[0] || undefined;

  const index = table
    .getCoreRowModel()
    .flatRows.findIndex((row) => row.id === selectedRowKey);

  const nextId = React.useMemo(
    () => table.getCoreRowModel().flatRows[index + 1]?.id,
    [index, table]
  );

  const prevId = React.useMemo(
    () => table.getCoreRowModel().flatRows[index - 1]?.id,
    [index, table]
  );

  const onPrev = React.useCallback(() => {
    if (prevId) table.setRowSelection({ [prevId]: true });
  }, [prevId, table]);

  const onNext = React.useCallback(() => {
    if (nextId) table.setRowSelection({ [nextId]: true });
  }, [nextId, table]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!selectedRowKey) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        onPrev();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        onNext();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [selectedRowKey, onNext, onPrev]);

  return (
    <Sheet
      open={!!selectedRowKey}
      onOpenChange={() => table.toggleAllRowsSelected(false)}
    >
      <SheetContent className="sm:max-w-md overflow-y-auto p-0" hideClose>
        <SheetHeader className="sticky top-0 border-b bg-background p-4">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className={cn(titleClassName, "text-left truncate")}>
              {title}
            </SheetTitle>
            <div className="flex items-center gap-1 h-7">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      disabled={!prevId}
                      onClick={onPrev}
                    >
                      <ChevronUp className="h-5 w-5" />
                      <span className="sr-only">Previous</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Navigate <Kbd variant="outline">↑</Kbd>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      disabled={!nextId}
                      onClick={onNext}
                    >
                      <ChevronDown className="h-5 w-5" />
                      <span className="sr-only">Next</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Navigate <Kbd variant="outline">↓</Kbd>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Separator orientation="vertical" className="mx-1" />
              <SheetClose autoFocus={true} asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </SheetClose>
            </div>
          </div>
        </SheetHeader>
        <SheetDescription className="sr-only">
          Selected row details
        </SheetDescription>
        <div className="p-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
