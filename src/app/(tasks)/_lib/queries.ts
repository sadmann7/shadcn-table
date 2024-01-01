"use server"

import { db } from "@/db"
import { tasks, type Task } from "@/db/schema"
import type { SearchParams } from "@/types"
import { and, asc, desc, inArray, or, sql } from "drizzle-orm"

import { filterColumn } from "@/lib/filter-column"
import { searchParamsSchema } from "@/lib/validations/params"

export async function getTasks(searchParams: SearchParams) {
  const { page, per_page, sort, title, status, priority, operator } =
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
  const { data, count } = await db.transaction(async (tx) => {
    const data = await tx
      .select()
      .from(tasks)
      .limit(limit)
      .offset(offset)
      .where(
        !operator || operator === "and"
          ? and(
              // Filter tasks by title
              title
                ? filterColumn({
                    column: tasks.title,
                    value: title,
                  })
                : undefined,
              // Filter tasks by status
              statuses.length > 0 ? inArray(tasks.status, statuses) : undefined,
              // Filter tasks by priority
              priorities.length > 0
                ? inArray(tasks.priority, priorities)
                : undefined
            )
          : or(
              // Filter tasks by title
              title
                ? filterColumn({
                    column: tasks.title,
                    value: title,
                  })
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

    const count = await tx
      .select({
        count: sql<number>`count(${tasks.id})`.mapWith(Number),
      })
      .from(tasks)
      .where(
        !operator || operator === "and"
          ? and(
              // Filter tasks by title
              title
                ? filterColumn({
                    column: tasks.title,
                    value: title,
                  })
                : undefined,
              // Filter tasks by status
              statuses.length > 0 ? inArray(tasks.status, statuses) : undefined,
              // Filter tasks by priority
              priorities.length > 0
                ? inArray(tasks.priority, priorities)
                : undefined
            )
          : or(
              // Filter tasks by title
              title
                ? filterColumn({
                    column: tasks.title,
                    value: title,
                  })
                : undefined,
              // Filter tasks by status
              statuses.length > 0 ? inArray(tasks.status, statuses) : undefined,
              // Filter tasks by priority
              priorities.length > 0
                ? inArray(tasks.priority, priorities)
                : undefined
            )
      )
      .execute()
      .then((res) => res[0]?.count ?? 0)

    return {
      data,
      count,
    }
  })

  const pageCount = Math.ceil(count / limit)
  return { data, pageCount }
}

export type TasksPromise = ReturnType<typeof getTasks>
