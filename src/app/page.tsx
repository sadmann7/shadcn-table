import { db } from "@/db"
import { tasks, type Task } from "@/db/schema"
import { and, asc, desc, inArray, like, sql } from "drizzle-orm"

import { filterColumn } from "@/lib/utils"
import { searchParamsSchema } from "@/lib/validations/params"
import { Shell } from "@/components/shells/shell"
import { TasksTableShell } from "@/components/shells/tasks-table-shell"

interface IndexPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  // Parse search params using zod schema
  const { page, per_page, sort, title, status, priority } =
    searchParamsSchema.parse(searchParams)

  // Fallback page for invalid page numbers
  const pageAsNumber = Number(page)
  const fallbackPage =
    isNaN(pageAsNumber) || pageAsNumber < 1 ? 1 : pageAsNumber
  // Number of items per page
  const perPageAsNumber = Number(per_page)
  const limit = isNaN(perPageAsNumber) ? 10 : perPageAsNumber
  // Number of items to skip
  const offset = fallbackPage > 0 ? (fallbackPage - 1) * limit : 0
  // Column and order to sort by
  // Spliting the sort string by "." to get the column and order
  // Example: "title.desc" => ["title", "desc"]
  const [column, order] = (sort?.split(".") as [
    keyof Task | undefined,
    "asc" | "desc" | undefined,
  ]) ?? ["title", "desc"]

  const statuses = (status?.split(".") as Task["status"][]) ?? []

  const priorities = (priority?.split(".") as Task["priority"][]) ?? []

  // Transaction is used to ensure both queries are executed in a single transaction
  const { allTasks, totalTasks } = await db.transaction(async (tx) => {
    const allTasks = await tx
      .select()
      .from(tasks)
      .limit(limit)
      .offset(offset)
      .where(
        and(
          // Filter tasks by title
          title ? filterColumn(title, tasks.title) : undefined,
          // Filter tasks by status
          statuses.length > 0 ? inArray(tasks.status, statuses) : undefined,
          // Filter tasks by priority
          priorities.length > 0
            ? inArray(tasks.priority, priorities)
            : undefined
        )
      )
      .orderBy(
        column && column in tasks
          ? order === "asc"
            ? asc(tasks[column])
            : desc(tasks[column])
          : desc(tasks.id)
      )

    const totalTasks = await tx
      .select({
        count: sql<number>`count(${tasks.id})`,
      })
      .from(tasks)
      .where(
        and(
          and(
            // The task count should also be filtered by the same filters as the tasks
            title ? like(tasks.title, `%${title}%`) : undefined,
            statuses.length > 0 ? inArray(tasks.status, statuses) : undefined,
            priorities.length > 0
              ? inArray(tasks.priority, priorities)
              : undefined
          )
        )
      )

    return {
      allTasks,
      totalTasks: Number(totalTasks[0]?.count) ?? 0,
    }
  })

  const pageCount = Math.ceil(totalTasks / limit)

  return (
    <Shell>
      {/* Pass the DataTable component through the TasksTableShell component to memoize the columns which can not be done on react-server-components */}
      <TasksTableShell data={allTasks} pageCount={pageCount} />
    </Shell>
  )
}
