import type { ColumnType, Operator } from "@/types"
import { type Column } from "@tanstack/react-table"

import { dataTableConfig } from "@/config/data-table"

export function getCommonPinningStyles<TData>({
  column,
  withBorder = false,
}: {
  column: Column<TData>
  /**
   * Show box shadow between pinned and scrollable columns.
   * @default false
   */
  withBorder?: boolean
}): React.CSSProperties {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left")
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right")

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
  }
}

export function getDefaultFilterOperator(columnType: ColumnType): Operator {
  if (columnType === "text") {
    return "iLike"
  }

  return "eq"
}

export function getFilterOperators(columnType: ColumnType) {
  const operatorMap: Record<ColumnType, { label: string; value: Operator }[]> =
    {
      text: dataTableConfig.textOperators,
      number: dataTableConfig.numericOperators,
      select: dataTableConfig.selectOperators,
      "multi-select": dataTableConfig.selectOperators,
      boolean: dataTableConfig.booleanOperators,
      date: dataTableConfig.dateOperators,
    }

  return operatorMap[columnType] ?? dataTableConfig.textOperators
}
