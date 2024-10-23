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
        return Array.isArray(filter.value)
          ? inArray(column, filter.value)
          : eq(column, filter.value)
      case "ne":
        return Array.isArray(filter.value)
          ? notInArray(column, filter.value)
          : ne(column, filter.value)
      case "iLike":
        console.log({ filter })

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

export function getColumn<T extends Table>(
  table: T,
  column: keyof T
): AnyColumn {
  return table[column] as AnyColumn
}
