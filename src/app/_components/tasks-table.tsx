"use client";

import type { Task } from "@/db/schema";
import type { DataTableRowAction } from "@/types";
import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";

import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import type {
  getTaskPriorityCounts,
  getTaskStatusCounts,
  getTasks,
} from "../_lib/queries";
import { DeleteTasksDialog } from "./delete-tasks-dialog";
import { useFeatureFlags } from "./feature-flags-provider";
import { getTasksTableColumns } from "./tasks-table-columns";
import { TasksTableFloatingBar } from "./tasks-table-floating-bar";
import { UpdateTaskSheet } from "./update-task-sheet";

interface TasksTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getTasks>>,
      Awaited<ReturnType<typeof getTaskStatusCounts>>,
      Awaited<ReturnType<typeof getTaskPriorityCounts>>,
    ]
  >;
}

export function TasksTable({ promises }: TasksTableProps) {
  const { featureFlags } = useFeatureFlags();

  const [{ data, pageCount }, statusCounts, priorityCounts] =
    React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Task> | null>(null);

  const columns = React.useMemo(
    () => getTasksTableColumns({ statusCounts, priorityCounts, setRowAction }),
    [statusCounts, priorityCounts],
  );

  const enableAdvancedTable = featureFlags.includes("advancedTable");

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter: enableAdvancedTable,
    defaultColumn: {
      enableColumnFilter: false,
    },
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <>
      <DataTable
        table={table}
        floatingBar={<TasksTableFloatingBar table={table} />}
      >
        <DataTableToolbar table={table} />
      </DataTable>
      <UpdateTaskSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        task={rowAction?.row.original ?? null}
      />
      <DeleteTasksDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        tasks={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
}
