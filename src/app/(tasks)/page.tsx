import { Shell } from "@/components/shell"

import { tasksQuery } from "./_actions/queries"
import { TasksTableShell } from "./_components/tasks-table-shell"

export interface TasksTablePageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function TasksTablePage({
  searchParams,
}: {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}) {
  // Transaction is used to ensure both queries are executed in a single transaction
  const { allData, pageCount } = await tasksQuery(searchParams)

  return (
    <Shell>
      {/* Pass the DataTable component through the TasksTableShell component to memoize the columns which can not be done on react-server-components */}
      <TasksTableShell data={allData} pageCount={pageCount} />
    </Shell>
  )
}
