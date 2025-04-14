import type { SearchParams } from "@/types";
import * as React from "react";

import { DataTableSkeleton } from "@/components/data-table-skeleton";
import { Shell } from "@/components/shell";
import { getValidFilters } from "@/lib/data-table";

import { FeatureFlagsProvider } from "./_components/feature-flags-provider";
import { TasksTable } from "./_components/tasks-table";
import {
  getEstimatedHoursRange,
  getTaskPriorityCounts,
  getTaskStatusCounts,
  getTasks,
} from "./_lib/queries";
import { searchParamsCache } from "./_lib/validations";
import type { Task } from "@/db/schema";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

// Define all selectable columns with user-friendly labels
const availableColumns: { id: keyof Task; label: string }[] = [
  { id: "code", label: "Code" },
  { id: "title", label: "Title" },
  { id: "status", label: "Status" },
  { id: "priority", label: "Priority" },
  { id: "label", label: "Label" },
  { id: "estimatedHours", label: "Est. Hours" },
  { id: "createdAt", label: "Created At" },
  // Add other columns from your Task schema as needed
];

export default async function IndexPage(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getTasks({
      ...search,
      filters: validFilters,
      // Ensure columns are passed if defined, otherwise default handled by getTasks
      columns: search.columns,
    }),
    getTaskStatusCounts(),
    getTaskPriorityCounts(),
    getEstimatedHoursRange(),
  ]);

  return (
    <Shell className="gap-2">
      <FeatureFlagsProvider>
        <React.Suspense
          fallback={
            <DataTableSkeleton
              columnCount={search.columns.length > 0 ? search.columns.length : availableColumns.length} // Adjust skeleton based on selected/available columns
              filterCount={2}
              // Adjust cellWidths based on default/selected columns if needed
              // cellWidths={[
              //   "10rem",
              //   "30rem",
              //   "10rem",
              //   "10rem",
              //   "6rem",
              // ]}
              shrinkZero
            />
          }
        >
          {/* Pass promises, availableColumns, and search */}
          <TasksTable
            promises={promises}
            availableColumns={availableColumns}
            search={search} // Pass the parsed search params
          />
        </React.Suspense>
      </FeatureFlagsProvider>
    </Shell>
  );
}
