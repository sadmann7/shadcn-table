"use client";

import type { Task } from "@/db/schema";
import type { DataTableRowAction } from "@/types/data-table";
import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DataTable } from "@/components/data-table";
import { useDataTable } from "@/hooks/use-data-table";

import { DataTableAdvancedToolbar } from "@/components/data-table-advanced-toolbar";
import { DataTableFilterList } from "@/components/data-table-filter-list";
import { DataTableFilterMenu } from "@/components/data-table-filter-menu";
import { DataTableSortList } from "@/components/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { DataTableViewOptions } from "@/components/data-table-view-options";
import type {
  getEstimatedHoursRange,
  getTaskPriorityCounts,
  getTaskStatusCounts,
  getTasks,
} from "../_lib/queries";
import type { GetTasksSchema } from "../_lib/validations";
import { DeleteTasksDialog } from "./delete-tasks-dialog";
import { useFeatureFlags } from "./feature-flags-provider";
import { TasksTableActionBar } from "./tasks-table-action-bar";
import { getTasksTableColumns } from "./tasks-table-columns";
import { UpdateTaskSheet } from "./update-task-sheet";

interface AvailableColumn {
  id: keyof Task;
  label: string;
}

interface TasksTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getTasks>>,
      Awaited<ReturnType<typeof getTaskStatusCounts>>,
      Awaited<ReturnType<typeof getTaskPriorityCounts>>,
      Awaited<ReturnType<typeof getEstimatedHoursRange>>,
    ]
  >;
  availableColumns: AvailableColumn[];
  search: GetTasksSchema;
}

export function TasksTable({
  promises,
  availableColumns,
  search,
}: TasksTableProps) {
  const { enableAdvancedFilter, filterFlag } = useFeatureFlags();

  // Use React.use to resolve the promises
  const [
    { data, pageCount },
    statusCounts,
    priorityCounts,
    estimatedHoursRange,
  ] = React.use(promises);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Task> | null>(null);

  // Filter the columns based on the search params
  const columns = React.useMemo(() => {
    const allPossibleColumns = getTasksTableColumns({
      statusCounts,
      priorityCounts,
      estimatedHoursRange: estimatedHoursRange,
      setRowAction,
    });

    // Ensure 'actions' column is always present if defined
    const actionsColumn = allPossibleColumns.find((col) => col.id === "actions");

    // Filter based on search.columns, always include 'actions'
    const filteredColumns = allPossibleColumns.filter(
      (col) => col.id === "actions" || search.columns.includes(col.id as string),
    );

    // Make sure actions column is included even if not in search.columns (though it shouldn't be)
    if (actionsColumn && !filteredColumns.some((col) => col.id === "actions")) {
      filteredColumns.push(actionsColumn);
    }

    return filteredColumns;
  }, [
    statusCounts,
    priorityCounts,
    estimatedHoursRange,
    search.columns, // Add search.columns to dependency array
  ]);

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data: data as any,
    columns,
    pageCount,
    enableAdvancedFilter,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnVisibility: {},
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  });

  const handleColumnsChange = React.useCallback(
    (newColumns: string[]) => {
      const current = new URLSearchParams(searchParams?.toString());
      if (newColumns.length === 0) {
        current.delete("columns");
      } else {
        current.set("columns", newColumns.join(","));
      }
      router.replace(`${pathname}?${current.toString()}`);
    },
    [pathname, router, searchParams],
  );

  return (
    <>
      <DataTable
        table={table}
        actionBar={<TasksTableActionBar table={table} />}
      >
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar
            table={table}
            availableColumns={availableColumns}
            selectedColumns={search.columns}
            onColumnsChange={handleColumnsChange}
          >
            <DataTableSortList table={table} align="start" />
            {filterFlag === "advancedFilters" ? (
              <DataTableFilterList
                table={table}
                shallow={shallow}
                debounceMs={debounceMs}
                throttleMs={throttleMs}
                align="start"
              />
            ) : (
              <DataTableFilterMenu
                table={table}
                shallow={shallow}
                debounceMs={debounceMs}
                throttleMs={throttleMs}
              />
            )}
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar
            table={table}
            availableColumns={availableColumns}
            selectedColumns={search.columns}
            onColumnsChange={handleColumnsChange}
          >
            <DataTableSortList table={table} align="end" />
          </DataTableToolbar>
        )}
      </DataTable>
      <UpdateTaskSheet
        open={rowAction?.variant === "update"}
        onOpenChange={() => setRowAction(null)}
        task={rowAction?.row.original ?? null}
      />
      <DeleteTasksDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        tasks={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
}
