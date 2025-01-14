"use server"

import { db } from "@/db"
import { users } from "@/db/schema"
import { and, asc, desc, ilike, sql } from "drizzle-orm"

// import { ParsedSearchParams } from "./search-params"
import { type TableState } from "./types"

export async function getUsers({
  sorting,
  columnFilters,
  globalFilter,
  pageIndex,
  pageSize,
}: TableState) {
  try {
    // Build where conditions for Drizzle
    let conditions = []

    // Handle column filters
    for (const filter of columnFilters) {
      if (filter.id in users) {
        conditions.push(
          ilike(users[filter.id as keyof typeof users], `%${filter.value}%`)
        )
      }
    }

    // Handle global search
    if (globalFilter) {
      conditions.push(
        sql`(${ilike(users.name, `%${globalFilter}%`)} OR 
            ${ilike(users.email, `%${globalFilter}%`)})`
      )
    }

    // Combine conditions with AND
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Build orderBy for Drizzle
    const orderBy = sorting.map((sort) => {
      const column = users[sort.id as keyof typeof users]
      return sort.desc ? desc(column) : asc(column)
    })

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause)

    const total = countResult[0]?.count ?? 0

    // Get paginated data
    const data = await db
      .select()
      .from(users)
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
