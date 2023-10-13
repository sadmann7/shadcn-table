import { clsx, type ClassValue } from "clsx"
import {
  eq,
  like,
  not,
  notLike,
  type Column,
  type ColumnBaseConfig,
  type ColumnDataType,
} from "drizzle-orm"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function filterColumn(
  param: string,
  table: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>
) {
  const [value, filterVariety] = param?.split(".") ?? []

  switch (filterVariety) {
    case "contains":
      return like(table, `%${value}%`)
    case "does not contain":
      return notLike(table, `%${value}%`)
    case "is":
      return eq(table, value)
    case "is not":
      return not(eq(table, value))
    default:
      return like(table, `%${value}%`)
  }
}
