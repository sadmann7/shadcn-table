import type { DataTableConfig } from "@/config/data-table";
import type { ColumnFilter, ColumnSort, RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    variant?: FilterVariant;
    options?: {
      label: string;
      value: string;
      count?: number;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
    range?: [number, number];
    unit?: string;
  }
}

export type FilterOperator = DataTableConfig["operators"][number];
export type FilterVariant = DataTableConfig["filterVariants"][number];
export type JoinOperator = DataTableConfig["joinOperators"][number]["value"];

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: Extract<keyof TData, string>;
}

export interface ExtendedColumnFilter<TData> extends ColumnFilter {
  id: Extract<keyof TData, string>;
  filterId?: string;
  operator?: FilterOperator;
  joinOperator?: JoinOperator;
}
