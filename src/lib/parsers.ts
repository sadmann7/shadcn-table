import type { ExtendedSortingState, Filter } from "@/types"
import { type Row } from "@tanstack/react-table"
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
 * @returns A parser for sorting options.
 */
export function getSortParser<T extends Table>(table: T) {
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
 * @param originalRow The original row data to create the sorting parser for.
 * @returns A parser for TanStack Table sorting state.
 */
export const getSortingStateParser = <TData>(
  originalRow?: Row<TData>["original"]
) =>
  createParser<ExtendedSortingState<TData>>({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value)
        const result = z.array(sortingItemSchema).safeParse(parsed)

        if (!result.success) {
          return null
        }

        const keys = Object.keys(originalRow ?? {})

        const isValid = result.data.every((item) => keys.includes(item.id))

        return isValid ? (result.data as ExtendedSortingState<TData>) : null
      } catch {
        return null
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (item, index) =>
          item.id === b[index]?.id && item.desc === b[index]?.desc
      ),
  })

export const filterSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  type: z.enum(dataTableConfig.columnTypes),
  operator: z.enum(dataTableConfig.globalOperators),
})

/**
 * Create a parser for data table filters.
 * @param originalRow The original row data to create the filter parser for.
 * @returns A parser for data table filters state.
 */
export const getFiltersStateParser = <TData>(
  originalRow?: Row<TData>["original"]
) =>
  createParser<Filter<TData>[]>({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed)) {
          return null
        }

        const keys = Object.keys(originalRow ?? {})

        const validatedFilters = parsed
          .map((filter) => {
            const result = filterSchema.safeParse(filter)
            if (!result.success || !keys.includes(result.data.id)) {
              return null
            }
            return result.data as Filter<TData>
          })
          .filter((filter): filter is Filter<TData> => filter !== null)

        return validatedFilters
      } catch {
        return null
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (filter, index) =>
          filter.id === b[index]?.id && filter.value === b[index]?.value
      ),
  })

/**
 * Create a parser for filters based on a given table.
 * @param table The table object to create the filter parser for.
 * @returns A parser for filters state.
 */
export function getValidFiltersStateParser<T extends Table>(table: T) {
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
