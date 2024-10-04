import "server-only"

import { unstable_noStore as noStore } from "next/cache"
import { db } from "@/db"
import { tasks, type Task } from "@/db/schema"
import { type DrizzleWhere } from "@/types"
import { and, asc, count, desc, gte, lte, or, type SQL } from "drizzle-orm"

import { filterColumn } from "@/lib/filter-column"

import { type GetTasksSchema } from "./validations"

export async function getTasks(input: GetTasksSchema) {
  noStore()

  try {
    // Offset to paginate the results
    const offset = (input.page - 1) * input.per_page
    // Column and order to sort by
    // Spliting the sort string by "." to get the column and order
    // Example: "title.desc" => ["title", "desc"]
    const [column, order] = (input.sort?.split(".").filter(Boolean) ?? [
      "createdAt",
      "desc",
    ]) as [keyof Task | undefined, "asc" | "desc" | undefined]

    // Convert the date strings to date objects
    const fromDate = input.from ? new Date(input.from) : undefined
    const toDate = input.to ? new Date(input.to) : undefined

    const expressions: (SQL<unknown> | undefined)[] = [
      input.title
        ? filterColumn({
            column: tasks.title,
            value: input.title,
          })
        : undefined,
      // Filter tasks by status
      !!input.status
        ? filterColumn({
            column: tasks.status,
            value: input.status,
            isSelectable: true,
          })
        : undefined,
      // Filter tasks by priority
      !!input.priority
        ? filterColumn({
            column: tasks.priority,
            value: input.priority,
            isSelectable: true,
          })
        : undefined,
      // Filter by createdAt
      fromDate ? gte(tasks.createdAt, fromDate) : undefined,
      toDate ? lte(tasks.createdAt, toDate) : undefined,
    ]
    const where: DrizzleWhere<Task> =
      !input.operator || input.operator === "and"
        ? and(...expressions)
        : or(...expressions)

    // Transaction is used to ensure both queries are executed in a single transaction
    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx
        .select()
        .from(tasks)
        .limit(input.per_page)
        .offset(offset)
        .where(where)
        .orderBy(
          column && column in tasks
            ? order === "asc"
              ? asc(tasks[column])
              : desc(tasks[column])
            : desc(tasks.id)
        )

      const total = await tx
        .select({
          count: count(),
        })
        .from(tasks)
        .where(where)
        .execute()
        .then((res) => res[0]?.count ?? 0)

      return {
        data,
        total,
      }
    })

    const pageCount = Math.ceil(total / input.per_page)
    return { data, pageCount }
  } catch (err) {
    return { data: [], pageCount: 0 }
  }
}

export async function getTaskCountByStatus() {
  noStore()
  try {
    return await db
      .select({
        status: tasks.status,
        count: count(),
      })
      .from(tasks)
      .groupBy(tasks.status)
      .execute()
  } catch (err) {
    return []
  }
}

export async function getTaskCountByPriority() {
  noStore()
  try {
    return await db
      .select({
        priority: tasks.priority,
        count: count(),
      })
      .from(tasks)
      .groupBy(tasks.priority)
      .execute()
  } catch (err) {
    return []
  }
}
