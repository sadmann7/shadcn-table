import { type Metadata } from "next"
import { db } from "@/db"
import { tasks, type Task } from "@/db/schema"
import { and, asc, desc, inArray, like, sql } from "drizzle-orm"

import { Shell } from "@/components/shells/shell"

export const metadata: Metadata = {
  title: "Million.js",
  description:
    "Shadcn table component with server side sorting, pagination, and filtering, built with Million.js",
}

interface MillionPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function MillionPage({ searchParams }: MillionPageProps) {
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
            // Filter tasks by title
            typeof title === "string"
              ? like(tasks.title, `%${title}%`)
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
      <div className="flex h-full min-h-screen w-full flex-col items-center justify-center">
        <h1 className="text-center text-4xl font-bold">Under Construction</h1>
        <p className="text-center text-base text-muted-foreground">
          This page is under construction. Please check back later.
        </p>
      </div>
    </Shell>
  )
}
