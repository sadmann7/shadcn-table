import type { SearchParams } from "@/types"

import { Shell } from "@/components/shell"

import { TasksTableShell } from "./_components/tasks-table-shell"
import { getTasks } from "./_lib/queries"

export interface TasksTablePageProps {
  searchParams: SearchParams
}

export default function TasksTablePage({ searchParams }: TasksTablePageProps) {
  const tasksPromise = getTasks(searchParams)

  return (
    <Shell>
      {/* Pass the DataTable component through the TasksTableShell component to memoize the columns which can not be done on react-server-components */}
      <TasksTableShell tasksPromise={tasksPromise} />
    </Shell>
  )
}
