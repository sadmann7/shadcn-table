import "server-only"

import { unstable_noStore as noStore } from "next/cache"
import { db } from "@/db"
import { tasks, type Task } from "@/db/schema"
import { and, asc, count, desc, or } from "drizzle-orm"

import { filterColumn } from "@/lib/filter-column"

import { type GetTasksSchema } from "./validations"

export async function getTasks(input: GetTasksSchema) {
  noStore()
  try {
    const { page, per_page, sort, title, status, priority, operator } = input

    // Offset to paginate the results
    const offset = (page - 1) * per_page
    // Column and order to sort by
    // Spliting the sort string by "." to get the column and order
    // Example: "title.desc" => ["title", "desc"]
    const [column, order] = (sort?.split(".") as [
      keyof Task | undefined,
      "asc" | "desc" | undefined,
    ]) ?? ["title", "desc"]

    // Transaction is used to ensure both queries are executed in a single transaction
    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx
        .select()
        .from(tasks)
        .limit(per_page)
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
                !!status
                  ? filterColumn({
                      column: tasks.status,
                      value: status,
                      isSelectable: true,
                    })
                  : undefined,
                // Filter tasks by priority
                !!priority
                  ? filterColumn({
                      column: tasks.priority,
                      value: priority,
                      isSelectable: true,
                    })
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
                !!status
                  ? filterColumn({
                      column: tasks.status,
                      value: status,
                      isSelectable: true,
                    })
                  : undefined,
                // Filter tasks by priority
                !!priority
                  ? filterColumn({
                      column: tasks.priority,
                      value: priority,
                      isSelectable: true,
                    })
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

      const total = await tx
        .select({
          count: count(),
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
                !!status
                  ? filterColumn({
                      column: tasks.status,
                      value: status,
                      isSelectable: true,
                    })
                  : undefined,
                // Filter tasks by priority
                !!priority
                  ? filterColumn({
                      column: tasks.priority,
                      value: priority,
                      isSelectable: true,
                    })
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
                !!status
                  ? filterColumn({
                      column: tasks.status,
                      value: status,
                      isSelectable: true,
                    })
                  : undefined,
                // Filter tasks by priority
                !!priority
                  ? filterColumn({
                      column: tasks.priority,
                      value: priority,
                      isSelectable: true,
                    })
                  : undefined
              )
        )
        .execute()
        .then((res) => res[0]?.count ?? 0)

      return {
        data,
        total,
      }
    })

    const pageCount = Math.ceil(total / per_page)
    return { data, pageCount }
  } catch (err) {
    return { data: [], pageCount: 0 }
  }
}
