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

export function filterColumn({
  column,
  value,
}: {
  column: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>
  value: string
}) {
  const [filterValue, filterVariety] = value?.split(".") ?? []

  switch (filterVariety) {
    case "contains":
      return like(column, `%${filterValue}%`)
    case "does not contain":
      return notLike(column, `%${filterValue}%`)
    case "is":
      return eq(column, filterValue)
    case "is not":
      return not(eq(column, filterValue))
    default:
      return like(column, `%${filterValue}%`)
  }
}
