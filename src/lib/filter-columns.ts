import { isEmpty, isNotEmpty } from "@/db/utils"
import type { FilterCondition } from "@/types"
import { addDays, endOfDay, startOfDay } from "date-fns"
import {
  and,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lt,
  lte,
  ne,
  notIlike,
  notInArray,
  or,
  type AnyColumn,
  type SQL,
  type Table,
} from "drizzle-orm"

/**
 * Constructs SQL conditions based on the provided filters for a specific table.
 *
 * This function takes a table and an array of filter conditions, and returns a SQL
 * expression that represents the logical combination of these conditions. The conditions
 * are combined using the specified join operator (either 'AND' or 'OR'), which is determined
 * by the first filter's joinOperator property.
 *
 * Each filter condition can specify various operators (e.g., equality, inequality,
 * comparison for numbers and dates, etc.) and the function will generate the appropriate
 * SQL expressions based on the filter's type and value.
 *
 * @param table - The table to apply the filters on.
 * @param filters - An array of filter conditions to be applied to the table.
 * @returns A SQL expression representing the combined conditions, or undefined if no valid
 * conditions are found.
 */
export function filterColumns<T extends Table>({
  table,
  filters,
}: {
  table: T
  filters: FilterCondition<T>[]
}): SQL | undefined {
  const joinOperator = (filters[0]?.joinOperator ?? "and" === "and") ? and : or

  const conditions = filters.map((filter) => {
    const column = getColumn(table, filter.id)

    switch (filter.operator) {
      case "eq":
        if (Array.isArray(filter.value)) {
          return inArray(column, filter.value)
        } else if (
          column.dataType === "boolean" &&
          typeof filter.value === "string"
        ) {
          return eq(column, filter.value === "true")
        } else if (filter.type === "date") {
          const date = new Date(filter.value)
          const start = startOfDay(date)
          const end = endOfDay(date)
          return and(gte(column, start), lte(column, end))
        } else {
          return eq(column, filter.value)
        }
      case "ne":
        if (Array.isArray(filter.value)) {
          return notInArray(column, filter.value)
        } else if (column.dataType === "boolean") {
          return ne(column, filter.value === "true")
        } else if (filter.type === "date") {
          const date = new Date(filter.value)
          const start = startOfDay(date)
          const end = endOfDay(date)
          return and(lt(column, start), gt(column, end))
        } else {
          return ne(column, filter.value)
        }
      case "iLike":
        return filter.type === "text" && typeof filter.value === "string"
          ? ilike(column, `%${filter.value}%`)
          : undefined
      case "notILike":
        return filter.type === "text" && typeof filter.value === "string"
          ? notIlike(column, `%${filter.value}%`)
          : undefined
      case "lt":
        return filter.type === "number" || filter.type === "date"
          ? lt(column, filter.value)
          : undefined
      case "lte":
        return filter.type === "number" || filter.type === "date"
          ? lte(column, filter.value)
          : undefined
      case "gt":
        return filter.type === "number" || filter.type === "date"
          ? gt(column, filter.value)
          : undefined
      case "gte":
        return filter.type === "number" || filter.type === "date"
          ? gte(column, filter.value)
          : undefined
      case "isEmpty":
        return isEmpty(column)
      case "isNotEmpty":
        return isNotEmpty(column)
      case "isBefore":
        return filter.type === "date" ? lt(column, filter.value) : undefined
      case "isAfter":
        return filter.type === "date" ? gt(column, filter.value) : undefined
      case "isOnOrBefore":
        return filter.type === "date" ? lte(column, filter.value) : undefined
      case "isOnOrAfter":
        return filter.type === "date" ? gte(column, filter.value) : undefined
      case "isBetween":
        return filter.type === "date" &&
          Array.isArray(filter.value) &&
          filter.value.length === 2
          ? and(gte(column, filter.value[0]), lte(column, filter.value[1]))
          : undefined
      case "isRelativeToToday":
        if (filter.type === "date" && typeof filter.value === "string") {
          const today = new Date()
          const [amount, unit] = filter.value.split(" ") ?? []
          let startDate: Date
          let endDate: Date

          if (!amount || !unit) return undefined

          switch (unit) {
            case "days":
              startDate = startOfDay(addDays(today, parseInt(amount)))
              endDate = endOfDay(startDate)
              break
            case "weeks":
              startDate = startOfDay(addDays(today, parseInt(amount) * 7))
              endDate = endOfDay(addDays(startDate, 6))
              break
            case "months":
              startDate = startOfDay(addDays(today, parseInt(amount) * 30))
              endDate = endOfDay(addDays(startDate, 29))
              break
            default:
              return undefined
          }

          return and(gte(column, startDate), lte(column, endDate))
        }
        return undefined
      default:
        throw new Error(`Unsupported operator: ${filter.operator}`)
    }
  })

  const validConditions = conditions.filter(
    (condition) => condition !== undefined
  )

  return validConditions.length > 0
    ? joinOperator(...validConditions)
    : undefined
}

/**
 * Get table column.
 * @param table The table to get the column from.
 * @param columnKey The key of the column to retrieve from the table.
 * @returns The column corresponding to the provided key.
 */
export function getColumn<T extends Table>(
  table: T,
  columnKey: keyof T
): AnyColumn {
  return table[columnKey] as AnyColumn
}
