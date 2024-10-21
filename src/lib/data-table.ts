import type { ColumnType, Operator } from "@/types"
import { type Column } from "@tanstack/react-table"

import { dataTableConfig } from "@/config/data-table"

export function getCommonPinningStyles<TData>({
  column,
  withBorder = false,
}: {
  column: Column<TData>
  /**
   * Whether to show a box shadow on the right side of the last left pinned column or the left side of the first right pinned column.
   * This is useful for creating a border between the pinned columns and the scrollable columns.
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

export function getFilterOperators(columnType: ColumnType): {
  label: string
  value: Operator
}[] {
  const numericOperators: Operator[] = [
    "eq",
    "ne",
    "lt",
    "lte",
    "gt",
    "gte",
    "isEmpty",
    "isNotEmpty",
  ]
  const selectOperators: Operator[] = ["eq", "ne", "isEmpty", "isNotEmpty"]
  const textOperators: Operator[] = [
    "iLike",
    "notILike",
    "eq",
    "ne",
    "isEmpty",
    "isNotEmpty",
  ]

  if (columnType === "number" || columnType === "date") {
    return dataTableConfig.operators.filter((op) =>
      numericOperators.includes(op.value)
    )
  }

  if (columnType === "select" || columnType === "multi-select") {
    return dataTableConfig.operators.filter((op) =>
      selectOperators.includes(op.value)
    )
  }

  return dataTableConfig.operators.filter((op) =>
    textOperators.includes(op.value)
  )
}
