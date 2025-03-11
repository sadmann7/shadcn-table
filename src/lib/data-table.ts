import type { ColumnType, Filter, FilterOperator } from "@/types";
import type { Column } from "@tanstack/react-table";

import { dataTableConfig } from "@/config/data-table";

/**
 * Generate common pinning styles for a table column.
 *
 * This function calculates and returns CSS properties for pinned columns in a data table.
 * It handles both left and right pinning, applying appropriate styles for positioning,
 * shadows, and z-index. The function also considers whether the column is the last left-pinned
 * or first right-pinned column to apply specific shadow effects.
 *
 * @param options - The options for generating pinning styles.
 * @param options.column - The column object for which to generate styles.
 * @param options.withBorder - Whether to show a box shadow between pinned and scrollable columns.
 * @returns A React.CSSProperties object containing the calculated styles.
 */
export function getCommonPinningStyles<TData>({
  column,
  withBorder = false,
}: {
  column: Column<TData>;
  /**
   * Show box shadow between pinned and scrollable columns.
   * @default false
   */
  withBorder?: boolean;
}): React.CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");

  return {
    boxShadow: withBorder
      ? isLastLeftPinnedColumn
        ? "-4px 0 4px -4px hsl(var(--border)) inset"
        : isFirstRightPinnedColumn
          ? "4px 0 4px -4px hsl(var(--border)) inset"
          : undefined
      : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? "sticky" : "relative",
    background: isPinned ? "hsl(var(--background))" : "hsl(var(--background))",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
}

/**
 * Determine the default filter operator for a given column type.
 *
 * This function returns the most appropriate default filter operator based on the
 * column's data type. For text columns, it returns 'iLike' (case-insensitive like),
 * while for all other types, it returns 'eq' (equality).
 *
 * @param columnType - The type of the column (e.g., 'text', 'number', 'date', etc.).
 * @returns The default FilterOperator for the given column type.
 */
export function getDefaultFilterOperator(
  columnType: ColumnType,
): FilterOperator {
  if (columnType === "text") {
    return "iLike";
  }

  return "eq";
}

/**
 * Retrieve the list of applicable filter operators for a given column type.
 *
 * This function returns an array of filter operators that are relevant and applicable
 * to the specified column type. It uses a predefined mapping of column types to
 * operator lists, falling back to text operators if an unknown column type is provided.
 *
 * @param columnType - The type of the column for which to get filter operators.
 * @returns An array of objects, each containing a label and value for a filter operator.
 */
export function getFilterOperators(columnType: ColumnType) {
  const operatorMap: Record<
    ColumnType,
    { label: string; value: FilterOperator }[]
  > = {
    text: dataTableConfig.textOperators,
    number: dataTableConfig.numericOperators,
    select: dataTableConfig.selectOperators,
    "multi-select": dataTableConfig.selectOperators,
    boolean: dataTableConfig.booleanOperators,
    date: dataTableConfig.dateOperators,
  };

  return operatorMap[columnType] ?? dataTableConfig.textOperators;
}

/**
 * Filters out invalid or empty filters from an array of filters.
 *
 * This function processes an array of filters and returns a new array
 * containing only the valid filters. A filter is considered valid if:
 * - It has an 'isEmpty' or 'isNotEmpty' operator, or
 * - Its value is not empty (for array values, at least one element must be present;
 *   for other types, the value must not be an empty string, null, or undefined)
 *
 * @param filters - An array of Filter objects to be validated.
 * @returns A new array containing only the valid filters.
 */
export function getValidFilters<TData>(
  filters: Filter<TData>[],
): Filter<TData>[] {
  return filters.filter(
    (filter) =>
      filter.operator === "isEmpty" ||
      filter.operator === "isNotEmpty" ||
      (Array.isArray(filter.value)
        ? filter.value.length > 0
        : filter.value !== "" &&
          filter.value !== null &&
          filter.value !== undefined),
  );
}
