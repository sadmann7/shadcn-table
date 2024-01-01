import type { SearchParams } from "@/types"

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
      {/**
       * The `TasksTableShell` component is used to render the `DataTable` component within it.
       * This is done because the table columns need to be memoized, and the `useDataTable` hook needs to be called in a client component.
       * By encapsulating the `DataTable` component within the `tasktableshell` component, we can ensure that the necessary logic and state management is handled correctly.
       */}
      <TasksTableShell tasksPromise={tasksPromise} />
    </Shell>
  )
}
