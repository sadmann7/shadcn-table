import { type User } from "@/db/schema"
import { ColumnFiltersState, SortingState } from "@tanstack/react-table"

// export type User = {
//   id: string
//   name: string
//   email: string
//   role: string
//   createdAt: Date
// }

export type SearchParams = {
  sort?: string
  filters?: string
  search?: string
  page?: string
  perPage?: string
}

export type TableState = {
  sorting: SortingState
  // columnFilters: ColumnFiltersState
  globalFilter: string
  pageIndex: number
  pageSize: number
}
