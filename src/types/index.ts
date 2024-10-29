import { type Row } from "@tanstack/react-table"
import { type SQL } from "drizzle-orm"

import { type DataTableConfig } from "@/config/data-table"

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export interface SearchParams {
  [key: string]: string | string[] | undefined
}

export interface Option {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  count?: number
}

export type ColumnType = DataTableConfig["columnTypes"][number]

export type FilterOperator = DataTableConfig["globalOperators"][number]

export type JoinOperator = DataTableConfig["joinOperators"][number]["value"]

export interface DataTableFilterField<TData> {
  id: keyof TData
  label: string
  placeholder?: string
  options?: Option[]
}

export interface DataTableAdvancedFilterField<TData>
  extends DataTableFilterField<TData> {
  type: ColumnType
}

export interface Filter<TData> {
  id: keyof TData
  value: string | string[]
  type: ColumnType
  operator: FilterOperator
}

export interface DataTableRowAction<TData> {
  row: Row<TData>
  type: "update" | "delete"
}

export interface QueryBuilderOpts {
  where?: SQL
  orderBy?: SQL
  distinct?: boolean
  nullish?: boolean
}
