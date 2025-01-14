// types/data-table.ts

import {
  ColumnDef,
  TableState,
  type Table as TanstackTable,
} from "@tanstack/react-table"
import { type LucideIcon } from "lucide-react"

/**
 * Generic type for any data model that can be displayed in the table
 * Requires an id field for proper row identification
 */
export interface BaseRecord {
  id: string | number
  createdAt?: Date
}

/**
 * Configuration for status-based columns that use icons
 */
export interface StatusConfig<T extends string> {
  value: T
  label: string
  icon: LucideIcon
  color?: string
}

/**
 * Generic filter field configuration
 */
export interface FilterField<T extends BaseRecord> {
  id: keyof T & string
  label: string
  type: "text" | "select" | "multi-select" | "date" | "boolean"
  placeholder?: string
  options?: {
    label: string
    value: string
    icon?: LucideIcon
    count?: number
  }[]
}

/**
 * Props for the generic data table component
 */
export interface DataTableProps<T extends BaseRecord> {
  data: T[]
  columns: ColumnDef<T>[]
  filterFields?: FilterField<T>[]
  toolbar?: React.ReactNode
  floatingBar?: React.ReactNode
  initialState?: Partial<TableState>
  enableSelection?: boolean
  enableColumnPinning?: boolean
  onRowAction?: (action: RowAction<T>) => void
}

/**
 * Generic row action type
 */
export interface RowAction<T extends BaseRecord> {
  type: "edit" | "delete" | "view" | string
  row: T
}

/**
 * Context provider props for table configuration
 */
export interface TableConfigProviderProps {
  features?: string[]
  statusIcons?: Record<string, LucideIcon>
  priorityIcons?: Record<string, LucideIcon>
  children: React.ReactNode
}
