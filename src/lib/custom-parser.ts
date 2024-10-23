import { type Table } from "drizzle-orm"
import { createParser } from "nuqs/server"

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
    parse(queryValue) {
      const [column, order] =
        (queryValue.split(".") as [string, "asc" | "desc"]) ?? []
      if (
        !column ||
        !order ||
        !(column in table) ||
        !["asc", "desc"].includes(order)
      ) {
        return null
      }
      return { column: column as keyof T["_"]["columns"], order }
    },
    serialize({ column, order }) {
      return `${String(column)}.${order}`
    },
  })
}
