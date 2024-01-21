import * as React from "react"
import type { SearchParams } from "@/types"

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { Shell } from "@/components/shell"

import { TasksTableShell } from "./_components/tasks-table-shell"
import { getTasks } from "./_lib/fetchers"

export interface TasksTablePageProps {
  searchParams: SearchParams
}

export default function TasksTablePage({ searchParams }: TasksTablePageProps) {
  const tasksPromise = getTasks(searchParams)

  return (
    <Shell>
      <React.Suspense
        fallback={
          <DataTableSkeleton columnCount={4} filterableColumnCount={2} />
        }
      >
        {/**
         * The `TasksTableShell` component is used to render the `DataTable` component within it.
         * This is done because the table columns need to be memoized, and the `useDataTable` hook needs to be called in a client component.
         * By encapsulating the `DataTable` component within the `tasktableshell` component, we can ensure that the necessary logic and state management is handled correctly.
         */}
        <TasksTableShell
          tasksPromise={tasksPromise}
          searchParams={searchParams}
        />
      </React.Suspense>
    </Shell>
  )
}
