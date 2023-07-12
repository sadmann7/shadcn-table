import { db } from "@/db"
import { tasks, type Task } from "@/db/schema"
import { and, asc, desc, like, sql } from "drizzle-orm"

interface IndexPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  const { page, per_page, sort, title } = searchParams

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
    <div className="container flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Shadcn Table</h1>
      <p className="text-base text-muted-foreground">
        Under construction, please come back later.
      </p>
    </div>
  )
}
