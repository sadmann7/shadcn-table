"use server"

import { db } from "@/db"
import { tasks } from "@/db/schema"
import { and, asc, desc, ilike, sql } from "drizzle-orm"

// import { ParsedSearchParams } from "./search-params"
import { type TableState } from "./types"

export async function getUsers({
  sorting,
  // columnFilters,
  globalFilter,
  pageIndex,
  pageSize,
}: TableState) {
  try {
    // Build where conditions for Drizzle
    let conditions = []

    // Handle column filters
    // for (const filter of columnFilters) {
    //   if (filter.id in tasks) {
    //     conditions.push(
    //       ilike(tasks[filter.id as keyof typeof tasks], `%${filter.value}%`)
    //     )
    //   }
    // }

    // Handle global search
    if (globalFilter) {
      conditions.push(
        sql`(${ilike(tasks.title, `%${globalFilter}%`)} OR 
            ${ilike(tasks.label, `%${globalFilter}%`)} OR 
            ${ilike(tasks.status, `%${globalFilter}%`)})`
      )
    }

    // Combine conditions with AND
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Build orderBy for Drizzle
    const orderBy = sorting.map((sort) => {
      const column = tasks[sort.id as keyof typeof tasks]
      return sort.desc ? desc(column) : asc(column)
    })

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(whereClause)

    const total = countResult[0]?.count ?? 0

    // Get paginated data
    const data = await db
      .select()
      .from(tasks)
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset(pageIndex * pageSize)

    return {
      data,
      pageCount: Math.ceil(total / pageSize),
    }
  } catch (error) {
    console.error("Error:", error)
    throw new Error("Failed to fetch tasks.")
  }
}
