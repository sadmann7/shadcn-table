import { type SQL } from "drizzle-orm"

import { type DataTableConfig } from "@/config/data-table"

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type NonUndefined<T> = T extends undefined ? never : T

export interface SearchParams {
  [key: string]: string | string[] | undefined
}

export interface Option {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  count?: number
}

export interface DataTableFilterField<TData> {
  label: string
  value: keyof TData
  placeholder?: string
  options?: Option[]
}

export interface DataTableFilterOption<TData> {
  id: string
  label: string
  value: keyof TData
  options: Option[]
  filterValues?: string[]
  filterOperator?: string
  isMulti?: boolean
}

export type ColumnType =
  | "text"
  | "number"
  | "select"
  | "multi-select"
  | "date"
  | "boolean"

export interface QueryBuilderOpts {
  where?: SQL
  orderBy?: SQL
  distinct?: boolean
  nullish?: boolean
}

export type OperatorType = "text" | "numeric" | "select" | "boolean" | "date"

export type Operator = {
  [K in OperatorType]: DataTableConfig[`${K}Operators`][number]["value"]
}[OperatorType]
