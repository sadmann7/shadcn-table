import { type Filter } from "@/types"
import type { SortingState } from "@tanstack/react-table"
import { type Table } from "drizzle-orm"
import { createParser } from "nuqs/server"
import { z } from "zod"

import { dataTableConfig } from "@/config/data-table"

interface SortOption<T extends Table> {
  column: keyof T["_"]["columns"]
  order: "asc" | "desc"
}

/**
 * Create a parser for sorting options based on a given table.
 * @param table The table object to create the sort parser for.
 */
export function parseAsSort<T extends Table>(table: T) {
  return createParser<SortOption<T>>({
    parse: (value) => {
      const [column, order] =
        (value.split(".") as [string, "asc" | "desc"]) ?? []
      if (
        !column ||
        !order ||
        !(column in table) ||
        !["asc", "desc"].includes(order)
      ) {
        return null
      }
      return { column, order }
    },
    serialize: ({ column, order }) => `${String(column)}.${order}`,
    eq: (a, b) => a.column === b.column && a.order === b.order,
  })
}

const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
})

/**
 * Create a parser for TanStack Table sorting state.
 * Can be used for multi-sorting.
 * @returns A parser for TanStack Table sorting state.
 */
export const parseAsSortingState = createParser<SortingState>({
  parse: (value) => {
    try {
      const parsed = JSON.parse(value)
      const result = z.array(sortingItemSchema).safeParse(parsed)
      return result.success ? result.data : null
    } catch {
      return null
    }
  },
  serialize: (value) => JSON.stringify(value),
  eq: (a, b) =>
    a.length === b.length &&
    a.every(
      (item, index) => item.id === b[index]?.id && item.desc === b[index]?.desc
    ),
})

export const filterSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  type: z.enum(dataTableConfig.columnTypes),
  operator: z.enum(dataTableConfig.globalOperators),
})

/**
 * Create a parser for filters based on a given table.
 * @param table The table object to create the filter parser for.
 */
export function parseAsFilters<T extends Table>(table: T) {
  return createParser<Filter<T>[]>({
    parse: (value) => {
      try {
        const parsedValue = JSON.parse(value)
        if (!Array.isArray(parsedValue)) {
          return null
        }

        const validatedFilters = parsedValue
          .map((filter) => {
            const result = filterSchema.safeParse(filter)
            if (!result.success) {
              return null
            }
            if (!(result.data.id in table)) {
              return null
            }
            return result.data as Filter<T>
          })
          .filter((filter): filter is Filter<T> => filter !== null)

        return validatedFilters.length > 0 ? validatedFilters : null
      } catch {
        return null
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (item, index) =>
          item.id === b[index]?.id && item.value === b[index]?.value
      ),
  })
}

/**
 * Create a parser for filters.
 * Can be used with the DataTableFilterList component.
 * @returns A parser for filters
 */
export const parseAsFiltersState = createParser({
  parse: (value) => {
    try {
      const parsed = JSON.parse(value)
      const result = z.array(filterSchema).safeParse(parsed)
      return result.success ? result.data : null
    } catch {
      return null
    }
  },
  serialize: (value) => JSON.stringify(value),
  eq: (a, b) =>
    a.length === b.length &&
    a.every(
      (item, index) =>
        item.id === b[index]?.id && item.value === b[index]?.value
    ),
})
