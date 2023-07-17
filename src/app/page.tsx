import { db } from "@/db"
import { tasks, type Task } from "@/db/schema"
import { and, asc, desc, inArray, like, sql } from "drizzle-orm"

import { Shell } from "@/components/shells/shell"
import { TasksTableShell } from "@/components/shells/tasks-table-shell"

interface IndexPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  const { page, per_page, sort, title, status, priority } = searchParams

  console.log({
    title,
    status,
    priority,
  })

  // Number of items per page
  const limit = typeof per_page === "string" ? parseInt(per_page) : 10
  // Number of items to skip
  const offset =
    typeof page === "string"
      ? parseInt(page) > 0
        ? (parseInt(page) - 1) * limit
        : 0
      : 0
  // Column and order to sort by
  // Spliting the sort string by "." to get the column and order
  // Example: "title.desc" => ["title", "desc"]
  const [column, order] =
    typeof sort === "string"
      ? (sort.split(".") as [
          keyof Task | undefined,
          "asc" | "desc" | undefined,
        ])
      : []

  const statuses =
    typeof status === "string" ? (status.split(".") as Task["status"][]) : []

  const priorities =
    typeof priority === "string"
      ? (priority.split(",") as Task["priority"][])
      : []

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
          typeof title === "string"
            ? like(tasks.title, `%${title}%`)
            : undefined,
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
            typeof title === "string"
              ? like(tasks.title, `%${title}%`)
              : undefined,
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
      <TasksTableShell data={allTasks} pageCount={pageCount} />
    </Shell>
  )
}
