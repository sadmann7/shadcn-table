import { isEmpty, isNotEmpty } from "@/db/utils";
import type { Filter, JoinOperator } from "@/types";
import { addDays, endOfDay, startOfDay } from "date-fns";
import {
  type AnyColumn,
  type SQL,
  type Table,
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
} from "drizzle-orm";

/**
 * Generate SQL conditions from filters for a specific table.
 *
 * This function returns a SQL expression combining conditions based on the provided filters
 * and the specified join operator ('AND' or 'OR').
 *
 * Each filter can use various operators (e.g., equality, comparison) to create the SQL expressions.
 *
 * @param table - The table to apply the filters on.
 * @param filters - An array of filters to be applied to the table.
 * @param joinOperator - The join operator to use for combining the filters.
 * @returns A SQL expression representing the combined filters.
 */
export function filterColumns<T extends Table>({
  table,
  filters,
  joinOperator,
}: {
  table: T;
  filters: Filter<T>[];
  joinOperator: JoinOperator;
}): SQL | undefined {
  const joinFn = joinOperator === "and" ? and : or;

  const conditions = filters.map((filter) => {
    const column = getColumn(table, filter.id);

    switch (filter.operator) {
      case "eq":
        if (Array.isArray(filter.value)) {
          return inArray(column, filter.value);
        }
        if (column.dataType === "boolean" && typeof filter.value === "string") {
          return eq(column, filter.value === "true");
        }
        if (filter.type === "date") {
          const date = new Date(filter.value);
          const start = startOfDay(date);
          const end = endOfDay(date);
          return and(gte(column, start), lte(column, end));
        }
        return eq(column, filter.value);
      case "ne":
        if (Array.isArray(filter.value)) {
          return notInArray(column, filter.value);
        }
        if (column.dataType === "boolean" && typeof filter.value === "string") {
          return ne(column, filter.value === "true");
        }
        if (filter.type === "date") {
          const date = new Date(filter.value);
          const start = startOfDay(date);
          const end = endOfDay(date);
          return or(lt(column, start), gt(column, end));
        }
        return ne(column, filter.value);
      case "iLike":
        return filter.type === "text" && typeof filter.value === "string"
          ? ilike(column, `%${filter.value}%`)
          : undefined;
      case "notILike":
        return filter.type === "text" && typeof filter.value === "string"
          ? notIlike(column, `%${filter.value}%`)
          : undefined;
      case "lt":
        return filter.type === "number"
          ? lt(column, filter.value)
          : filter.type === "date" && typeof filter.value === "string"
            ? lt(column, endOfDay(new Date(filter.value)))
            : undefined;
      case "lte":
        return filter.type === "number"
          ? lte(column, filter.value)
          : filter.type === "date" && typeof filter.value === "string"
            ? lte(column, endOfDay(new Date(filter.value)))
            : undefined;
      case "gt":
        return filter.type === "number"
          ? gt(column, filter.value)
          : filter.type === "date" && typeof filter.value === "string"
            ? gt(column, startOfDay(new Date(filter.value)))
            : undefined;
      case "gte":
        return filter.type === "number"
          ? gte(column, filter.value)
          : filter.type === "date" && typeof filter.value === "string"
            ? gte(column, startOfDay(new Date(filter.value)))
            : undefined;
      case "isBetween":
        return filter.type === "date" &&
          Array.isArray(filter.value) &&
          filter.value.length === 2
          ? and(
              filter.value[0]
                ? gte(column, startOfDay(new Date(filter.value[0])))
                : undefined,
              filter.value[1]
                ? lte(column, endOfDay(new Date(filter.value[1])))
                : undefined,
            )
          : undefined;
      case "isRelativeToToday":
        if (filter.type === "date" && typeof filter.value === "string") {
          const today = new Date();
          const [amount, unit] = filter.value.split(" ") ?? [];
          let startDate: Date;
          let endDate: Date;

          if (!amount || !unit) return undefined;

          switch (unit) {
            case "days":
              startDate = startOfDay(addDays(today, Number.parseInt(amount)));
              endDate = endOfDay(startDate);
              break;
            case "weeks":
              startDate = startOfDay(
                addDays(today, Number.parseInt(amount) * 7),
              );
              endDate = endOfDay(addDays(startDate, 6));
              break;
            case "months":
              startDate = startOfDay(
                addDays(today, Number.parseInt(amount) * 30),
              );
              endDate = endOfDay(addDays(startDate, 29));
              break;
            default:
              return undefined;
          }

          return and(gte(column, startDate), lte(column, endDate));
        }
        return undefined;
      case "isEmpty":
        return isEmpty(column);
      case "isNotEmpty":
        return isNotEmpty(column);

      default:
        throw new Error(`Unsupported operator: ${filter.operator}`);
    }
  });

  const validConditions = conditions.filter(
    (condition) => condition !== undefined,
  );

  return validConditions.length > 0 ? joinFn(...validConditions) : undefined;
}

/**
 * Get table column.
 * @param table The table to get the column from.
 * @param columnKey The key of the column to retrieve from the table.
 * @returns The column corresponding to the provided key.
 */
export function getColumn<T extends Table>(
  table: T,
  columnKey: keyof T,
): AnyColumn {
  return table[columnKey] as AnyColumn;
}
