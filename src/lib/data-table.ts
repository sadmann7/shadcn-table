import type { ColumnVariant, Filter, FilterOperator } from "@/types";
import type { Column } from "@tanstack/react-table";

import { dataTableConfig } from "@/config/data-table";

export function getCommonPinningStyles<TData>({
  column,
  withBorder = false,
}: {
  column: Column<TData>;
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

export function getDefaultFilterOperator(
  columnVariant: ColumnVariant,
): FilterOperator {
  if (columnVariant === "text") {
    return "iLike";
  }

  return "eq";
}

export function getFilterOperators(columnVariant: ColumnVariant) {
  const operatorMap: Record<
    ColumnVariant,
    { label: string; value: FilterOperator }[]
  > = {
    text: dataTableConfig.textOperators,
    number: dataTableConfig.numericOperators,
    select: dataTableConfig.selectOperators,
    "multi-select": dataTableConfig.selectOperators,
    boolean: dataTableConfig.booleanOperators,
    date: dataTableConfig.dateOperators,
  };

  return operatorMap[columnVariant] ?? dataTableConfig.textOperators;
}

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
