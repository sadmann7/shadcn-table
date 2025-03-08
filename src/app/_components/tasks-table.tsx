"use client";

import { type Task, tasks } from "@/db/schema";
import type {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
} from "@/types";
import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { toSentenceCase } from "@/lib/utils";

import type {
  getTaskPriorityCounts,
  getTaskStatusCounts,
  getTasks,
} from "../_lib/queries";
import { getPriorityIcon, getStatusIcon } from "../_lib/utils";
import { DeleteTasksDialog } from "./delete-tasks-dialog";
import { useFeatureFlags } from "./feature-flags-provider";
import { getColumns } from "./tasks-table-columns";
import { TasksTableFloatingBar } from "./tasks-table-floating-bar";
import { TasksTableToolbarActions } from "./tasks-table-toolbar-actions";
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

  const columns = React.useMemo(() => getColumns({ setRowAction }), []);

  /**
   * This component can render either a faceted filter or a search filter based on the `options` prop.
   *
   * @prop options - An array of objects, each representing a filter option. If provided, a faceted filter is rendered. If not, a search filter is rendered.
   *
   * Each `option` object has the following properties:
   * @prop {string} label - The label for the filter option.
   * @prop {string} value - The value for the filter option.
   * @prop {React.ReactNode} [icon] - An optional icon to display next to the label.
   * @prop {boolean} [withCount] - An optional boolean to display the count of the filter option.
   */
  const filterFields: DataTableFilterField<Task>[] = [
    {
      id: "title",
      label: "Title",
      placeholder: "Filter titles...",
    },
    {
      id: "status",
      label: "Status",
      options: tasks.status.enumValues.map((status) => ({
        label: toSentenceCase(status),
        value: status,
        icon: getStatusIcon(status),
        count: statusCounts[status],
      })),
    },
    {
      id: "priority",
      label: "Priority",
      options: tasks.priority.enumValues.map((priority) => ({
        label: toSentenceCase(priority),
        value: priority,
        icon: getPriorityIcon(priority),
        count: priorityCounts[priority],
      })),
    },
  ];

  /**
   * Advanced filter fields for the data table.
   * These fields provide more complex filtering options compared to the regular filterFields.
   *
   * Key differences from regular filterFields:
   * 1. More field types: Includes 'text', 'multi-select', 'date', and 'boolean'.
   * 2. Enhanced flexibility: Allows for more precise and varied filtering options.
   * 3. Used with DataTableAdvancedToolbar: Enables a more sophisticated filtering UI.
   * 4. Date and boolean types: Adds support for filtering by date ranges and boolean values.
   */
  const advancedFilterFields: DataTableAdvancedFilterField<Task>[] = [
    {
      id: "title",
      label: "Title",
      type: "text",
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: tasks.status.enumValues.map((status) => ({
        label: toSentenceCase(status),
        value: status,
        icon: getStatusIcon(status),
        count: statusCounts[status],
      })),
    },
    {
      id: "priority",
      label: "Priority",
      type: "multi-select",
      options: tasks.priority.enumValues.map((priority) => ({
        label: toSentenceCase(priority),
        value: priority,
        icon: getPriorityIcon(priority),
        count: priorityCounts[priority],
      })),
    },
    {
      id: "createdAt",
      label: "Created at",
      type: "date",
    },
  ];

  const enableAdvancedTable = featureFlags.includes("advancedTable");
  const enableFloatingBar = featureFlags.includes("floatingBar");

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: enableAdvancedTable,
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
        floatingBar={
          enableFloatingBar ? <TasksTableFloatingBar table={table} /> : null
        }
      >
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            filterFields={advancedFilterFields}
            shallow={false}
          >
            <TasksTableToolbarActions table={table} />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table} filterFields={filterFields}>
            <TasksTableToolbarActions table={table} />
          </DataTableToolbar>
        )}
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
