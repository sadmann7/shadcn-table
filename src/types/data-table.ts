import type {
  ColumnFilter,
  ColumnSort,
  RowData,
  filterFns,
} from "@tanstack/react-table";
import type { StringKeyOf } from ".";

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
    range?: [number, number];
    unit?: string;
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

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: Extract<keyof TData, string | number>;
}

export interface ExtendedColumnFilter extends ColumnFilter {
  filterId?: string;
  operator?: FilterOperator;
  joinOperator?: JoinOperator;
}
