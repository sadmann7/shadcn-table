import { type Row } from "@tanstack/react-table"
import { type SQL } from "drizzle-orm"
import { type z } from "zod"

import { type DataTableConfig } from "@/config/data-table"
import { type filterSchema } from "@/lib/parsers"

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

export type Filter<TData> = Prettify<
  Omit<z.output<typeof filterSchema>, "id"> & {
    id: keyof TData
  }
>

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
