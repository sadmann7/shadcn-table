// import { ColumnFiltersState, SortingState } from "@tanstack/react-table"

// // Server-side parsing functions
// export function parseTableState(searchParams: {
//   sort?: string
//   filters?: string
//   search?: string
//   page?: string
//   perPage?: string
// }) {
//   return {
//     sorting: parseSorting(searchParams.sort),
//     columnFilters: parseColumnFilters(searchParams.filters),
//     globalFilter: searchParams.search ?? "",
//     pageIndex: parsePageIndex(searchParams.page),
//     pageSize: parsePageSize(searchParams.perPage),
//   }
// }

// function parseSorting(sortParam?: string): SortingState {
//   if (!sortParam) return []
//   try {
//     const parsed = JSON.parse(sortParam)
//     if (!Array.isArray(parsed)) return []
//     return parsed.map((item: any) => ({
//       id: String(item.id),
//       desc: Boolean(item.desc),
//     }))
//   } catch {
//     return []
//   }
// }

// function parseColumnFilters(filtersParam?: string): ColumnFiltersState {
//   if (!filtersParam) return []
//   try {
//     const parsed = JSON.parse(filtersParam)
//     if (!Array.isArray(parsed)) return []
//     return parsed.map((item: any) => ({
//       id: String(item.id),
//       value: item.value,
//     }))
//   } catch {
//     return []
//   }
// }

// function parsePageIndex(pageParam?: string): number {
//   if (!pageParam) return 0
//   const parsed = parseInt(pageParam, 10)
//   // Convert from 1-based to 0-based index
//   return isNaN(parsed) ? 0 : Math.max(0, parsed - 1)
// }

// function parsePageSize(perPageParam?: string): number {
//   if (!perPageParam) return 10
//   const parsed = parseInt(perPageParam, 10)
//   return isNaN(parsed) ? 10 : parsed
// }
