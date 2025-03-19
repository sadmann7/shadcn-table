import type { ColumnFilter, RowData, filterFns } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    variant?:
      | "text"
      | "number"
      | "date"
      | "date-range"
      | "range"
      | "select"
      | "multi-select";
    options?: { label: string; value: string; count?: number }[];
  }
}

export type FilterOperator =
  | keyof typeof filterFns
  | "notIncludesString"
  | "notEqualsString"
  | "notEquals"
  | "greaterThan"
  | "notGreaterThan"
  | "greaterThanOrEqualTo"
  | "notGreaterThanOrEqualTo"
  | "lessThan"
  | "notLessThan"
  | "lessThanOrEqualTo"
  | "notLessThanOrEqualTo"
  | "isRelativeToToday"
  | "inRange"
  | "startsWith"
  | "endsWith"
  | "isEmpty"
  | "isNotEmpty";

export type JoinOperator = "and" | "or";

export interface ExtendedColumnFilter extends ColumnFilter {
  filterId?: string;
  operator?: FilterOperator;
  joinOperator?: JoinOperator;
}
